namespace FlightRadar.Util;

/// <summary>
///     Global variable class
/// </summary>
public abstract class Globals
{
    public static readonly Coordinates NorthAmerica = new(-24.697266f, 34.524661f, 44.121094f, 71.718882f);
    public static readonly Coordinates Europe = new(-169.101563f, 16.636192f, -51.328125f, 73.277353f);
    public static readonly List<Coordinates> GetAllRegions = new(2) { NorthAmerica, Europe };
    public static string ConnectionString = "";
}

/// <summary>
///     Coordinates wrapper
/// </summary>
/// <param name="MinLon">Minimal longitude</param>
/// <param name="MinLat">Minimal latitude</param>
/// <param name="MaxLon">Maximal longitude</param>
/// <param name="MaxLat">Maximal latitude</param>
public readonly record struct Coordinates(float MinLon, float MinLat, float MaxLon, float MaxLat);