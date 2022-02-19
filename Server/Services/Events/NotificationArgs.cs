using static FlightRadar.Data.Responses.ResponseDto;

namespace FlightRadar.Services.Events;

/// <summary>
///     Delegate arguments used for subscriber-publisher data transfer
/// </summary>
public class NotificationArgs : EventArgs
{
    public NotificationArgs(IEnumerable<PlaneListDto> planes)
    {
        Planes = planes;
    }

    public IEnumerable<PlaneListDto> Planes { get; }
}