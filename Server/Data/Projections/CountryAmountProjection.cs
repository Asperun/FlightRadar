namespace FlightRadar.Data.Projections;

public sealed class CountryAmountProjection
{
    public string Country { get; set; } = null!;
    public int Count { get; set; }
}