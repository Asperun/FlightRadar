using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FlightRadar.Models;

/// <summary>
/// Model class for Flight entity
/// </summary>
[Table("Flights")]
public class Flight : EntityBase
{
    [Required]
    [JsonIgnore]
    public Plane Plane { get; set; } = null!;
    [JsonIgnore]
    public int PlaneId { get; set; }
    public bool IsCompleted { get; set; }
    public List<Checkpoint> Checkpoints { get; set; } = null!;

    public override string ToString()
    {
        return $"{nameof(PlaneId)}: {PlaneId}, {nameof(IsCompleted)}: {IsCompleted}, {nameof(Checkpoints)}: {Checkpoints}";
    }
}