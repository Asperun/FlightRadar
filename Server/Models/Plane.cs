using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Models;

/// <summary>
///     Model class for Plane entity
/// </summary>
[Table("planes")]
[Index(nameof(Icao24), IsUnique = true)]
public class Plane : EntityBase
{
    [MaxLength(6)]
    [Required]
    [Column("icao24")]
    public string Icao24 { get; set; } = null!;

    [MaxLength(8)] [Column("callsign")] public string? CallSign { get; set; }

    [Column("lastcontact")] public int LastContact { get; set; }
    [Column("longitude")] public float Longitude { get; set; }
    [Column("latitude")] public float Latitude { get; set; }
    [Column("onground")] public bool OnGround { get; set; }
    [Column("velocity")] public float Velocity { get; set; }
    [Column("truetrack")] public float TrueTrack { get; set; }
    [Column("verticalrate")] public float VerticalRate { get; set; }
    [Column("geoaltitude")] public float GeoAltitude { get; set; }
    [Column("regcountry")] public string RegCountry { get; set; } = null!;
    public List<Flight> Flights { get; set; } = null!;

    public override string ToString()
    {
        return
            $"{nameof(Icao24)}: {Icao24}, {nameof(CallSign)}: {CallSign}, {nameof(LastContact)}: {LastContact}, {nameof(Longitude)}: {Longitude}, {nameof(Latitude)}: {Latitude}, {nameof(OnGround)}: {OnGround}, {nameof(Velocity)}: {Velocity}, {nameof(TrueTrack)}: {TrueTrack}, {nameof(VerticalRate)}: {VerticalRate}, {nameof(GeoAltitude)}: {GeoAltitude}, {nameof(RegCountry)}: {RegCountry}";
    }
}