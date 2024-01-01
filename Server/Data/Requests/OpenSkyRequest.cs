using System.Text.Json;
using FlightRadar.Models;

namespace FlightRadar.Data.Requests;

/// <summary>
///     OpenSky Api request projection class
/// </summary>
public sealed class OpenSkyRequest
{
    /// <summary>
    ///     Timestamp of fetch
    /// </summary>
    public int time { get; set; }

    /// <summary>
    ///     Vector states
    /// </summary>
    public JsonElement[][] states { get; set; } = null!;

    /// <summary>
    ///     Converts response to model list
    /// </summary>
    /// <returns>List of aircraft according to model</returns>
    public List<Plane> ToModelList()
    {
        var planeList = (from state in states
                         where state[VState.Longitude].ValueKind != JsonValueKind.Null && state[VState.Latitude].ValueKind != JsonValueKind.Null
                         select new Plane
                         {
                             Icao24 = state[VState.Icao24].GetString()!,
                             CallSign = state[VState.CallSign].GetString()?.TrimEnd(),
                             RegCountry = state[VState.OriginCountry].GetString(),
                             Longitude = state[VState.Longitude].GetSingle(),
                             Latitude = state[VState.Latitude].GetSingle(),
                             OnGround = state[VState.OnGround].GetBoolean(),
                             Velocity = state[VState.Velocity].ValueKind != JsonValueKind.Null ? state[VState.Velocity].GetSingle() : -1,
                             TrueTrack = state[VState.TrueTrack].ValueKind != JsonValueKind.Null ? state[VState.TrueTrack].GetSingle() : -1,
                             VerticalRate = state[VState.VerticalRate].ValueKind != JsonValueKind.Null ? state[VState.VerticalRate].GetSingle() : -1,
                             GeoAltitude = state[VState.BaroAltitude].ValueKind != JsonValueKind.Null ? state[VState.BaroAltitude].GetSingle() : -1,
                             LastContact = state[VState.LastContact].GetInt32()
                         })
                        .OrderBy(p => p.Icao24)
                        .ToList();

        return planeList;
    }

    /// <summary>
    ///     Vector states used by OpenSky Api
    /// </summary>
    private abstract class VState
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