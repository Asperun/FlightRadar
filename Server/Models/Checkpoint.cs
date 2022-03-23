using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FlightRadar.Models;

/// <summary>
///     Model class for Checkpoint entity
/// </summary>
[Table("checkpoints")]
public class Checkpoint : EntityBase
{
    [JsonIgnore] public Flight Flight { get; set; } = null!;

    [JsonIgnore] [Column("flightid")] public int FlightId { get; set; }
    [Column("creationtime")] public DateTime? CreationTime { get; set; }
    [Column("longitude")] public float Longitude { get; set; }

    [Column("latitude")] public float Latitude { get; set; }

    [Column("velocity")] public float Velocity { get; set; }

    [Column("altitude")] public float Altitude { get; set; }

    [Column("truetrack")] public float TrueTrack { get; set; }

    [Column("verticalrate")] public float VerticalRate { get; set; }

    public override string ToString()
    {
        return
            $"{nameof(FlightId)}: {FlightId}, {nameof(Longitude)}: {Longitude}, {nameof(Latitude)}: {Latitude}, {nameof(Velocity)}: {Velocity}, {nameof(Altitude)}: {Altitude}, {nameof(TrueTrack)}: {TrueTrack}, {nameof(VerticalRate)}: {VerticalRate}";
    }
}