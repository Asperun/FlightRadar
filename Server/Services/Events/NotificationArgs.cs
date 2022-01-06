using FlightRadar.Data.DTO;

namespace FlightRadar.Services.Events;

public class NotificationArgs : EventArgs
{
    public NotificationArgs(IEnumerable<PlaneListDTO> planes)
    {
        Planes = planes;
    }

    public IEnumerable<PlaneListDTO> Planes { get; }

    // public record CoordinatesRange(float MinLong, float MaxLong, float MinLat, float MaxLat);
}