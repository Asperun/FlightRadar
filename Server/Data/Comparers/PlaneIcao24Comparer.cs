using FlightRadar.Models;

namespace FlightRadar.Data.Comparers;

/// <summary>
///     Comparator class used to compare aircraft by Icao24 string
/// </summary>
public sealed class PlaneIcao24Comparer : IComparer<Plane>
{
    public int Compare(Plane? x, Plane? other)
    {
        if (x == null) return -1;
        if (other == null) return 1;
        if (x.Icao24.Equals(other.Icao24)) return 0;
        return string.Compare(x.Icao24, other.Icao24, StringComparison.Ordinal);
    }
}