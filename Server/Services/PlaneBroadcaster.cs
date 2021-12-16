using FlightRadar.Models;
using FlightRadar.Services.Events;

namespace FlightRadar.Services;

public class PlaneBroadcaster
{
    // private readonly IServiceScopeFactory services;
    //
    // public PlaneBroadcaster(IServiceScopeFactory services)
    // {
    //     this.services = services;
    // }

    public event EventHandler<NotificationArgs>? NotificationEvent;

    public void BroadcastUpdate(List<Plane> newPlanes)
    {
        NotificationEvent?.Invoke(this, new NotificationArgs(newPlanes));
    }

    public int GetSubscribersCount()
    {
        return NotificationEvent != null ? NotificationEvent.GetInvocationList().Length : 0;
    }
}