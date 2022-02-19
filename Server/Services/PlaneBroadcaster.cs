using FlightRadar.Models;
using FlightRadar.Services.Events;
using static FlightRadar.Data.Responses.ResponseDto;

namespace FlightRadar.Services;

/// <summary>
///     Aircraft publisher class for Server Sent Events
/// </summary>
public class PlaneBroadcaster
{
    public event EventHandler<NotificationArgs>? NotificationEvent;

    /// <summary>
    ///     Updates memory list of aircraft and publishes it to subscribers
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public void Publish(IEnumerable<Plane> planes)
    {
        NotificationEvent?.Invoke(this, new NotificationArgs(planes.Select(plane =>
                                                                               new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude,
                                                                                                plane.TrueTrack))));
    }

    /// <summary>
    ///     Gets current subscribers count
    /// </summary>
    /// <returns>Amount of subscribers</returns>
    public int GetSubscribersCount()
    {
        return NotificationEvent != null ? NotificationEvent.GetInvocationList().Length : 0;
    }
}