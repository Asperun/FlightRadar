using System;
using System.Collections.Generic;
using FlightRadar.Models;

namespace FlightRadar.Services.Events
{
    public class NotificationArgs : EventArgs
    {
        public NotificationArgs(List<Plane> notification)
        {
            Notification = notification;
        }

        public List<Plane> Notification { get; }
    }
}