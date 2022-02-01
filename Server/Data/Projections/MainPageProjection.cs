namespace FlightRadar.Data.Projections;

/// <summary>
/// Projection class used for stats fetching
/// </summary>
public sealed class MainPageProjection
{
    public int TotalPlanes { get; set; }
    public int TotalFlights { get; set; }
    public int TotalCheckpoints { get; set; }
}