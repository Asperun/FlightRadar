using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FlightRadar.Models;
using FlightRadar.Services;
using FlightRadar.Services.Events;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            var planes = await planeService.GetAllAsync();

            if (planes == null || !planes.Any()) return NotFound();
            return Ok(planes);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Plane>> GetById(int id)
        {
            var plane = await planeService.GetByIdAsync(id);

            if (plane == null) return NotFound();

            return Ok(plane);
        }

        [HttpGet("findInArea")]
        public async Task<ActionResult<IEnumerable<Plane>>> FindInArea([FromQuery] double minLat,
                                                                       [FromQuery] double maxLat,
                                                                       [FromQuery] double minLong,
                                                                       [FromQuery] double maxLong)
        {
            var planes = await planeService.GetInAreaAsync(minLat, maxLat, minLong, maxLong);

            if (planes == null || !planes.Any()) return NotFound();
            return Ok(planes);
        }

        // [HttpGet("findInAreaSse")]
        public async Task FindInAreaSse([FromQuery] double minLat,
                                        [FromQuery] double maxLat,
                                        [FromQuery] double minLong,
                                        [FromQuery] double maxLong)

        {
            // var response = Response;
            Response.Headers.Add("Content-Type", "text/event-stream");

            logger.LogWarning("Established connection to {IpAddress}",
                              Request.HttpContext.Connection.RemoteIpAddress?.ToString());

            var stopwatch = new Stopwatch();
            while (true)
            {
                if (HttpContext.RequestAborted.IsCancellationRequested)
                {
                    logger.LogWarning("Cancelling connection to {IpAddress}",
                                      Request.HttpContext.Connection.RemoteIpAddress?.ToString());
                    break;
                }

                var planes = await planeService.GetInAreaAsync(minLat, maxLat, minLong, maxLong);
                stopwatch.Start();
                // await Response.WriteAsync(JsonSerializer.SerializeAsync(Response.Body,planes).ToString() ?? string.Empty);
                await JsonSerializer.SerializeAsync(Response.Body, planes);
                await Response.Body.FlushAsync();
                stopwatch.Stop();
                logger.LogWarning("Sent Planes to client in {TimeInMs}ms", stopwatch.ElapsedMilliseconds);
                await Task.Delay(5 * 1000);
            }
        }


        [Produces("text/event-stream")]
        [HttpGet("findInAreaSse")]
        public async Task SubscribeToPlaneSse(CancellationToken cancellationToken)
        {
            Response.Headers.Add("Content-Type", "text/event-stream");
            Response.Headers.Add("Cache-Control", "no-cache");
            
            var data = new { Message = "Established connection with server" };
            var jsonConnection = JsonSerializer.Serialize(data, jsonSerializerOptions);
            await Response.WriteAsync($"data: {jsonConnection}\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            async void OnNotification(object? sender, NotificationArgs eventArgs)
            {
                try
                {
                    var json = JsonSerializer.Serialize(eventArgs.Notification[0], jsonSerializerOptions);
                    await Response.WriteAsync($"planes:{json}\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                    logger.LogWarning("Sent SSE to {ClientIp}", Request.HttpContext.Connection.RemoteIpAddress?.ToString());
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
                logger.LogWarning("Client disconnected, total connections {CC}", planeBroadcaster.GetSubscribersCount());
            }
        }
    }
}