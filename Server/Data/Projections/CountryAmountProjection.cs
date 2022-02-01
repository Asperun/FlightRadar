namespace FlightRadar.Data.Projections;

/// <summary>
/// Projection class used for stats fetching
/// </summary>
public sealed class CountryAmountProjection
{
    public string Country { get; set; } = null!;
    public int Count { get; set; }
}