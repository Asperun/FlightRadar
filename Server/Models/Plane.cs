using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlightRadar.Models;

/// <summary>
/// Model class for Plane entity
/// </summary>
[Table("Planes")]
public class Plane : EntityBase
{
    [MaxLength(6)] 
    [Required] 
    public string Icao24 { get; set; } = null!;
    [MaxLength(8)]
    public string? CallSign { get; set; }
    public int LastContact { get; set; }
    public float Longitude { get; set; }
    public float Latitude { get; set; }
    public bool OnGround { get; set; }
    public float Velocity { get; set; }
    public float TrueTrack { get; set; }
    public float VerticalRate { get; set; }
    public float GeoAltitude { get; set; }
    public string RegCountry { get; set; } = null!;
    public List<Flight> Flights { get; set; } = null!;


}