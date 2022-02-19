namespace FlightRadar.Data.Projections;


/// <summary>
///     Projection class used to fetch current aircraft data with active flights(if any) and last checkpoint turn radius
/// </summary>
public sealed class PlaneLastCheckpointProj
{
    public static readonly string Query = @"
                          select Planes.Id as Id,
                           Icao24 as Icao24,
                           TrueTrack as TrueTrack,
                           Longitude as Longitude,
                           Latitude as Latitude,
                           Velocity as Velocity,
                           OnGround as OnGround,
                           (Select TOP 1 Flights.Id from Flights where Flights.IsCompleted = '0' and Flights.PlaneId = Planes.Id Order By Flights.Id desc) as FlightId,
                           (Select TOP 1 C.TrueTrack
                            from (Select TOP 1 Flights.Id from Flights where Flights.IsCompleted = '0' and Flights.PlaneId = Planes.Id Order By Flights.Id desc) as F,
                                 Checkpoints as C
                            where C.FlightId = F.Id
                            Order By F.Id desc, C.Id desc)   as LastCheckpointTrueTrack                                                                                      
                            from Planes
                            Order by Planes.Icao24";

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
        return @$"Select   DATENAME(Month, CreationTime) as Month,
                           DATEPART(Day, CreationTime)   as Day,
                           DATEPART(HOUR, CreationTime)  as Hour,
                           Count( FlightId)              as Count
                            from Checkpoints where CreationTime BETWEEN {startDate} and {endDate}
                            Group By DATENAME(Month, CreationTime), DATEPART(Day, CreationTime), DatePART(HOUR, CreationTime)
                            Order BY DATENAME(Month, CreationTime), DATEPART(Day, CreationTime), DatePART(HOUR, CreationTime)";
    }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class CountryAmountProjection
{
    public static readonly string Query = @"   Select RegCountry as Country, Count(Id) as Count
                                                from Planes as p
                                                Group By RegCountry 
                                                Order By Count Desc";

    public string Country { get; set; } = null!;
    public int Count { get; set; }
}

/// <summary>
///     Projection class used for stats fetching
/// </summary>
public sealed class GeneralStatsProjection
{
    public static readonly string Query = @"Select (Select Count(*) from Planes) as TotalPlanes,
                                            (Select Count(*) from Flights)       as TotalFlights,
                                            (Select Count(*) from Checkpoints)   as TotalCheckpoints";

    public int TotalPlanes { get; set; }
    public int TotalFlights { get; set; }
    public int TotalCheckpoints { get; set; }
}