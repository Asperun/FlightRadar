using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FlightRadar.Models;

/// <summary>
/// Model class for Checkpoint entity
/// </summary>
[Table("Checkpoints")]
public class Checkpoint : EntityBase
{
    [Required] 
    [JsonIgnore]
    public Flight Flight { get; set; } = null!;
    [JsonIgnore]
    public int FlightId { get; set;}
    public DateTime? CreationTime { get; set; }
    public float Longitude { get; set; }
    public float Latitude { get; set; }
    public float Velocity { get; set; }
    public float Altitude { get; set; }
    public float TrueTrack { get; set; }
    public float VerticalRate { get; set; }

    public override string ToString()
    {
        return $"{nameof(FlightId)}: {FlightId}, {nameof(Longitude)}: {Longitude}, {nameof(Latitude)}: {Latitude}, {nameof(Velocity)}: {Velocity}, {nameof(Altitude)}: {Altitude}, {nameof(TrueTrack)}: {TrueTrack}, {nameof(VerticalRate)}: {VerticalRate}";
    }
}