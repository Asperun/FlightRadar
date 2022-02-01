using System.Text.Json;
using FlightRadar.Models;

namespace FlightRadar.Data.Requests;

/// <summary>
/// OpenSky Api request projection class
/// </summary>
public sealed class OpenSkyRequest
{
    public int time { get; set; }
    public JsonElement[][] states { get; set; } = null!;

    /// <summary>
    /// Converts response to model list
    /// </summary>
    /// <returns>List of aircraft according to model</returns>
    public List<Plane> ToModelList()
    {
        var planeList = (from state in states
                         where state[States.Longitude].ValueKind != JsonValueKind.Null && state[States.Latitude].ValueKind != JsonValueKind.Null
                         select new Plane
                         {
                             Icao24 = state[States.Icao24].GetString()!,
                             CallSign = state[States.CallSign].GetString()?.TrimEnd(),
                             RegCountry = state[States.OriginCountry].GetString(),
                             Longitude = state[States.Longitude].GetSingle(),
                             Latitude = state[States.Latitude].GetSingle(),
                             OnGround = state[States.OnGround].GetBoolean(),
                             Velocity = state[States.Velocity].ValueKind != JsonValueKind.Null ? state[States.Velocity].GetSingle() : -1,
                             TrueTrack = state[States.TrueTrack].ValueKind != JsonValueKind.Null ? state[States.TrueTrack].GetSingle() : -1,
                             VerticalRate = state[States.VerticalRate].ValueKind != JsonValueKind.Null ? state[States.VerticalRate].GetSingle() : -1,
                             GeoAltitude = state[States.BaroAltitude].ValueKind != JsonValueKind.Null ? state[States.BaroAltitude].GetSingle() : -1,
                             LastContact = Math.Max(0, state[States.LastContact].GetInt32() - state[States.TimePosition].GetInt32())
                         })
                        .OrderBy(p => p.Icao24)
                        .ToList();

        return planeList;
    }

    private abstract class States
    {
        public const byte
            Icao24 = 0,
            CallSign = 1,
            OriginCountry = 2,
            TimePosition = 3,
            LastContact = 4,
            Longitude = 5,
            Latitude = 6,
            BaroAltitude = 7,
            OnGround = 8,
            Velocity = 9,
            TrueTrack = 10,
            VerticalRate = 11,
            Sensors = 12,
            GeoAltitude = 13,
            Squawk = 14,
            Spi = 15,
            PositionSource = 16;
    }
}