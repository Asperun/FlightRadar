using System.Text;
using System.Text.Json;
using FlightRadar.Models;
using FlightRadar.Services;
using FlightRadar.Services.Events;
using Microsoft.AspNetCore.Mvc;
using static FlightRadar.Data.DTO.ResponseDto;

namespace FlightRadar.Controllers;

public enum StatsType
{
    MainPage,
    Hourly,
    Global,
    PlanesRegistered
}

/// <summary>
///     REST controller class for aircraft related requests
/// </summary>
[Route("api/v1/planes")]
[ApiController]
public class PlaneController : ControllerBase
{
    private readonly JsonSerializerOptions jsonSerializerOptions;
    private readonly ILogger<PlaneController> logger;
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneService planeService;

    public PlaneController(PlaneService planeService,
                           ILogger<PlaneController> logger,
                           PlaneBroadcaster planeBroadcaster)
    {
        this.planeService = planeService;
        this.logger = logger;
        this.planeBroadcaster = planeBroadcaster;
        jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    /// <summary>
    ///     Gets aircraft by Icao24 string from database
    /// </summary>
    /// <param name="icao24">Hex representation of aircraft identity</param>
    /// <param name="checkpoints">Include checkpoints of recent flight(s)</param>
    /// <returns>Aircraft with specified Icao</returns>
    [HttpGet("icao24/{icao24}")]
    public async Task<ActionResult<Plane>> GetByIcao24(string? icao24, bool checkpoints = false)
    {
        if (icao24 == null) return BadRequest();
        Console.WriteLine("GetByIcao24");
        var plane = await planeService.GetByIcao24Async(icao24, checkpoints);
        if (plane == null) return NotFound();
        return Ok(plane);
    }


  /// <summary>
  /// Handles stats fetching
  /// </summary>
  /// <param name="statsType">Enum of stats type to be fetched</param>
  /// <returns>OK if fetched</returns>
    [HttpGet("stats/{statsType}")]
    public async Task<ActionResult> GetSidePanelStats([FromRoute] StatsType statsType)
    {
        switch (statsType)
        {
            case StatsType.Global:
                var stats = planeService.GetGlobalStatsAsync();
                if (stats.TotalPlanes == 0) return NoContent();
                return Ok(stats);
            case StatsType.Hourly:
                return Ok(await planeService.GetHourlyAmountFromDate(DateTime.UtcNow));
            case StatsType.PlanesRegistered:
                return Ok(await planeService.GetRegisteredPerCountry());
            case StatsType.MainPage:
                return Ok(await planeService.GetMainPageProjection());
            default:
                return BadRequest();
        }
    }

    /// <summary>
    ///     Handles sending Server Sent Events to all subscribers
    /// </summary>
    /// <param name="minLat">Minimal latitude boundary</param>
    /// <param name="maxLat">Maximal latitude boundary</param>
    /// <param name="minLong">Minimal longitude boundary</param>
    /// <param name="maxLong">Maximal longitude boundary</param>
    /// <param name="limitPlanes">Amount limit</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [Produces("text/event-stream")]
    [HttpGet("subscribeToPlanes")]
    public async Task Subscribe([FromQuery] float minLat, [FromQuery] float minLong,
                                [FromQuery] float maxLat, [FromQuery] float maxLong,
                                [FromQuery] short limitPlanes, CancellationToken cancellationToken)
    {
        // Headers
        Response.Headers.Add("Content-Type", "text/event-stream");
        Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
        // Response.Headers.Add("Transer-Encoding", "chunked");


        // Gets planes based on passed coordinates
        var initialPlanesJson =
            JsonSerializer
                .Serialize(new { Planes = planeService.GetInAreaAsync(minLat, minLong, maxLat, maxLong, limitPlanes) },
                           jsonSerializerOptions);


        // Send it
        await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"data: {initialPlanesJson}\n\n"), cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);

        // Delegate and subscribe
        async void OnNotification(object? sender, NotificationArgs eventArgs)
        {
            try
            {
                IEnumerable<PlaneListDto> planesFiltered;

                if (minLat != 0 && maxLat != 0 && minLong != 0 && maxLong != 0)
                    planesFiltered = eventArgs.Planes
                                              .Where(p => p.Latitude > minLat && p.Latitude < maxLat)
                                              .Where(p => p.Longitude > minLong && p.Longitude < maxLong);
                else
                    planesFiltered = eventArgs.Planes;

                if (limitPlanes > 0) planesFiltered = planesFiltered.Take(limitPlanes);

                var planesJson =
                    JsonSerializer.Serialize(new { Planes = planesFiltered, Total = eventArgs.Planes.Count() },
                                             jsonSerializerOptions);

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
                await Task.Delay(1000 * 1, cancellationToken);
            }
        }
        catch (TaskCanceledException)
        {
            logger.LogWarning("User disconnected");
        }
        finally // Unsubscribe
        {
            planeBroadcaster.NotificationEvent -= OnNotification;
            logger.LogWarning("Client disconnected, total connections {CC}",
                              planeBroadcaster.GetSubscribersCount());
        }
    }
}