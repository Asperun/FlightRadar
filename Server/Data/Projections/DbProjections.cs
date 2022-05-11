using FlightRadar.Models;

namespace FlightRadar.Data.Projections;

/// <summary>
///     Projection class used to fetch current aircraft data with active flights(if any) and last checkpoint turn radius
/// </summary>
public sealed class PlaneLastCheckpointProj
{
    public int Id { get; set; }
    public int? FlightId { get; set; }
    public string Icao24 { get; set; } = null!;
    public float Longitude { get; set; }
    public float Latitude { get; set; }
    public float TrueTrack { get; set; }
    public float Velocity { get; set; }
    public bool OnGround { get; set; }
    public float? LastCheckpointTrueTrack { get; set; }

}

/// <summary>
///     Projection class used for fetching amount of aircraft per date
/// </summary>
public sealed class DateAmountProjection
{
    public string Month { get; set; } = null!;
    public int Day { get; set; }
    public int Hour { get; set; }
    public int Count { get; set; }

    public static FormattableString Query(DateTime startDate, DateTime endDate)
    {
        return
            $"Select DATE_PART('Day', creation_time)::integer as \"Day\", TRIM(TRAILING FROM to_char (creation_time, 'Month')) as \"Month\", DATE_PART('HOUR', creation_time)::integer  as \"Hour\", Count(distinct flight_id)::integer     as \"Count\" from checkpoints where creation_time BETWEEN {startDate} and {endDate} Group By to_char(creation_time, 'Month'), DATE_PART('Day', creation_time), DATE_PART('HOUR', creation_time) Order BY to_char(creation_time, 'Month'), DATE_PART('Day', creation_time), DATE_PART('HOUR', creation_time)";
    }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class CountryAmountProjection
{
    public static readonly string Query =
        "Select Reg_Country as \"Country\", Count(Id) as \"Count\" from Planes as p Group By Reg_Country Order By \"Count\" Desc";

    public string Country { get; set; } = null!;
    public int Count { get; set; }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class GeneralStatsProjection
{
    public int TotalPlanes { get; set; }
    public int TotalFlights { get; set; }
    public int TotalCheckpoints { get; set; }
}