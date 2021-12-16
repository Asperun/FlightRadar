using FlightRadar.Models;

namespace FlightRadar.Services.Events;

public class NotificationArgs : EventArgs
{
    // public NotificationArgs(List<Plane> notification, CoordinatesRange? coordinates = null)
    // {
    //     if (coordinates != null)
    //     {
    //         Notification = notification
    //                        .Where(p => p.Longitude > coordinates.MinLong)
    //                        .Where(p => p.Longitude < coordinates.MaxLong)
    //                        .Where(p => p.Latitude > coordinates.MinLat)
    //                        .Where(p => p.Latitude < coordinates.MaxLat)
    //                        .ToList();
    //     }
    //     else
    //     {
    //         Notification = notification;
    //     }
    // }

    public NotificationArgs(List<Plane> notification)
    {
        Notification = notification;
    }

    public List<Plane> Notification { get; }

    // public record CoordinatesRange(float MinLong, float MaxLong, float MinLat, float MaxLat);
}