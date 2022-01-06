using System.Text;
using System.Text.Json;
using FlightRadar.Data.DTO;
using FlightRadar.Models;
using FlightRadar.Services;
using FlightRadar.Services.Events;
using FlightRadar.Util;
using Microsoft.AspNetCore.Mvc;

namespace FlightRadar.Controllers;

[Route("api/v1/planes")]
[ApiController]
public class PlaneController : ControllerBase
{
    private readonly JsonSerializerOptions jsonSerializerOptions;
    private readonly ILogger<PlaneController> logger;
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneService planeService;


    public PlaneController(PlaneService planeService, ILogger<PlaneController> logger,
                           PlaneBroadcaster planeBroadcaster)
    {
        this.planeService = planeService;
        this.logger = logger;
        this.planeBroadcaster = planeBroadcaster;
        jsonSerializerOptions = new JsonSerializerOptions
        {
            // Converters = { new JsonArraySerializer() },
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            
        };
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<Plane>>> GetAllPlanes()
    {
        Console.WriteLine("Empty response?");
        var planes = await planeService.GetAllAsync();
        if (planes == null || !planes.Any()) return NotFound();
        return Ok(planes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Plane>> GetById(int id)
    {
        Console.WriteLine("GetById");
        var plane = await planeService.GetByIdAsync(id);
        if (plane == null) return NotFound();
        return plane;
    }

    [HttpGet("icao24/{icao24}")]
    public async Task<ActionResult<Plane>> GetByIcao24(string icao24)
    {
        // Response.Headers.Add("Content-Type", "application/json");
        // Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
        Console.WriteLine("GetById");
        var plane = await planeService.GetByIcao24Async(icao24);
        if (plane == null) return NotFound();
        return Ok(plane);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<Plane>> GetGlobalStats()
    {
        // Response.Headers.Add("Content-Type", "application/json");
        // Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
        Console.WriteLine("GlobalStats");
        var stats = planeService.GetGlobalStatsAsync();
        Console.WriteLine(stats);
        if (stats == null) return NotFound();
        return Ok(stats);
    }

    [HttpGet("findInArea")]
    public async Task<IEnumerable<PlaneListDTO>> FindInArea([FromQuery] float minLat,
                                                            [FromQuery] float maxLat,
                                                            [FromQuery] float minLong,
                                                            [FromQuery] float maxLong,
                                                            [FromQuery] short limitPlanes)
    {
        var planes = await planeService.GetInAreaAsync(minLat, maxLat, minLong, maxLong, limitPlanes);

        return planes;
    }

    [Produces("text/event-stream")]
    [HttpGet("subscribeToPlanes")]
    public async Task SubscribeToAllPlaneSse([FromQuery] float minLat,
                                             [FromQuery] float maxLat,
                                             [FromQuery] float minLong,
                                             [FromQuery] float maxLong,
                                             [FromQuery] short limitPlanes,
                                             CancellationToken cancellationToken)
    {
        // Headers
        Response.Headers.Add("Content-Type", "text/event-stream");
        Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
        // Response.Headers.Add("Transer-Encoding", "chunked");


        // Initial planes response from memory DB
        var initialPlanesJson =
            JsonSerializer.Serialize(new { Planes = await planeService.GetInAreaAsync(minLat, maxLat, minLong, maxLong, limitPlanes) },
                                     jsonSerializerOptions);
        await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"data: {initialPlanesJson}\n\n"), cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);

        // Delegate
        async void OnNotification(object? sender, NotificationArgs eventArgs)
        {
            try
            {
                IEnumerable<PlaneListDTO> planesFiltered;

                if (minLat != 0 && maxLat != 0 && minLong != 0 && maxLong != 0)
                    planesFiltered = eventArgs.Planes
                                              .Where(p => p.Latitude > minLat && p.Latitude < maxLat)
                                              .Where(p => p.Longitude > minLong && p.Longitude < maxLong);
                else
                    planesFiltered = eventArgs.Planes;

                if (limitPlanes > 0) planesFiltered = planesFiltered.Take(limitPlanes);

                // var planesJson =
                //     JsonSerializer.Serialize(new { Planes = planesFiltered, Total = eventArgs.Planes.Count() },
                //                              jsonSerializerOptions);
  var planesJson =
                    JsonSerializer.Serialize(new { Planes = planesFiltered, Total = eventArgs.Planes.Count() },
                                             jsonSerializerOptions);

                // TODO: Hold a list of current planes in runtime
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"data: {planesJson}\n\n"), cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
                logger.LogWarning("Sent SSE to {ClientIp} on {Time} planes amount {PlanesAmount}",
                                  Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                  DateTime.Now.Millisecond,
                                  limitPlanes);
            }
            catch (Exception)
            {
                logger.LogError("Not able to send the notification");
            }
        }

        planeBroadcaster.NotificationEvent += OnNotification;
        logger.LogWarning("Client connected, total connections {CC}", planeBroadcaster.GetSubscribersCount());

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                // Check if connection is broken 
                await Task.Delay(1000 * 1, cancellationToken);
            }
        }
        catch (TaskCanceledException)
        {
            logger.LogWarning("User disconnected");
            // logger.LogWarning("Client disconnected, total connections {CC}", planeBroadcaster.GetSubscribersCount());
        }
        finally
        {
            planeBroadcaster.NotificationEvent -= OnNotification;
            logger.LogWarning("Client disconnected, total connections {CC}",
                              planeBroadcaster.GetSubscribersCount());
        }
    }

    // public static async Task<byte[]> CompressBytes(byte[] bytes)
    // {
    //     await using (var outputStream = new MemoryStream())
    //     {
    //         await using (var compressStream = new BrotliStream(outputStream, CompressionLevel.Fastest))
    //         {
    //             compressStream.Write(bytes, 0, bytes.Length);
    //         }
    //
    //         return outputStream.ToArray();
    //     }
    // }
}