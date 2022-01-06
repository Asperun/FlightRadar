using FlightRadar.Data.DTO;
using FlightRadar.Models;
using FlightRadar.Services.Events;

namespace FlightRadar.Services;

public class PlaneBroadcaster
{
    public List<Plane> PlaneListSingleton = new(); // for now
    public event EventHandler<NotificationArgs>? NotificationEvent;

    public void BroadcastUpdate(IEnumerable<PlaneListDTO> newPlanes)
    {
        NotificationEvent?.Invoke(this, new NotificationArgs(newPlanes));
    }

    public int GetSubscribersCount()
    {
        return NotificationEvent != null ? NotificationEvent.GetInvocationList().Length : 0;
    }
}