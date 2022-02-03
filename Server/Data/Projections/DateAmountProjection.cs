namespace FlightRadar.Data.Projections;

/// <summary>
/// Projection class used for stats fetching
/// </summary>
public sealed class HourAmountProjection
{
    public int Hour { get; set; }
    public int Count { get; set; }
}