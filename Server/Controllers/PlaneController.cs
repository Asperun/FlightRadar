using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FlightRadar.Models;
using FlightRadar.Services;
using FlightRadar.Services.Events;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Logging;

namespace FlightRadar.Controllers
{
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
                { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
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
            return Ok(plane);
        }

        [HttpGet("findInArea")]
        public async Task<ActionResult<IEnumerable<Plane>>> FindInArea([FromQuery] float minLat,
                                                                       [FromQuery] float maxLat,
                                                                       [FromQuery] float minLong,
                                                                       [FromQuery] float maxLong,
                                                                       [FromQuery] short limitPlanes)
        {
            var planes = await planeService.GetInAreaAsync(minLat, maxLat, minLong, maxLong);

            if (planes == null || !planes.Any()) return NotFound();
            return Ok(planes);
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
            Response.Headers.Add("Content-Type", "text/event-stream");
            Response.Headers.Add("Cache-Control", "no-cache");
            // Response.Headers.Add("Content-Encoding", "br");


            var welcomeEventJson =
                JsonSerializer.Serialize(new { Message = "Established connection with server" }, jsonSerializerOptions);
            await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"data: {welcomeEventJson}\n\n"), cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            async void OnNotification(object? sender, NotificationArgs eventArgs)
            {
                try
                {
                    IEnumerable<Plane> planesFiltered;
                    
                    if (minLat != 0 && maxLat != 0 && minLong != 0 && maxLong != 0)
                    {
                        planesFiltered = eventArgs.Notification
                                                  .Where(p => p.Latitude > minLat && p.Latitude < maxLat)
                                                  .Where(p => p.Longitude > minLong && p.Longitude < maxLong);
                    }
                    else
                    {
                        planesFiltered = eventArgs.Notification;
                    }
                    
                    if (limitPlanes > 0)
                    {
                        planesFiltered = planesFiltered.Take(limitPlanes);
                    }

                    var planesJson =
                        JsonSerializer.Serialize(new { Planes =  planesFiltered.ToList() }, jsonSerializerOptions);
                    
                    // TODO: Compress once in service layer
                    await Response.Body.WriteAsync(Encoding.UTF8.GetBytes($"data: {planesJson}\n\n"),
                                                   cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                    logger.LogWarning("Sent SSE to {ClientIp} on {Time}",
                                      Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                      DateTime.Now.Millisecond);
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
}