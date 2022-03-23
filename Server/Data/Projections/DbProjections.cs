namespace FlightRadar.Data.Projections;

/// <summary>
///     Projection class used to fetch current aircraft data with active flights(if any) and last checkpoint turn radius
/// </summary>
public sealed class PlaneLastCheckpointProj
{
    public static readonly string Query = @"
        select id,
       icao24,
       trueTrack,
       longitude,
       latitude,
       velocity,
       onGround,
       (Select flights.id from flights where NOT flights.isCompleted and flights.planeId = planes.Id Order By flights.Id desc limit 1) as FlightId,
       (Select C.trueTrack
        from (Select flights.Id from flights where NOT flights.isCompleted and flights.planeId = planes.Id Order By flights.Id desc limit 1) as F,
             Checkpoints as C
        where C.flightId = F.Id
        Order By F.Id desc, C.Id desc limit 1)   as LastCheckpointTrueTrack
from planes
Order by planes.icao24";

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
        return $"Select DATE_PART('Day', creationtime)::integer as \"Day\", TRIM(TRAILING FROM to_char (creationtime, 'Month')) as \"Month\", DATE_PART('HOUR', creationtime)::integer  as \"Hour\", Count(distinct flightid)::integer     as \"Count\" from checkpoints where creationtime BETWEEN {startDate} and {endDate} Group By to_char(creationtime, 'Month'), DATE_PART('Day', creationtime), DATE_PART('HOUR', creationtime) Order BY to_char(creationtime, 'Month'), DATE_PART('Day', creationtime), DATE_PART('HOUR', creationtime)";
    }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class CountryAmountProjection
{
    public static readonly string Query = 
        "Select RegCountry as \"Country\", Count(Id) as \"Count\" from Planes as p Group By RegCountry Order By \"Count\" Desc";

    public string Country { get; set; } = null!;
    public int Count { get; set; }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class GeneralStatsProjection
{
    public static readonly string Query =
        "Select (Select Count(*) from Planes) as \"TotalPlanes\", (Select Count(*) from Flights) as \"TotalFlights\", (Select Count(*) from Checkpoints) as \"TotalCheckpoints\"";
    
    public int TotalPlanes { get; set; }
    public int TotalFlights { get; set; }
    public int TotalCheckpoints { get; set; }
}