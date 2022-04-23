using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Models;

/// <summary>
///     Model class for Flight entity
/// </summary>
[Table("flights")]
[Index(nameof(PlaneId), nameof(IsCompleted))]
public class Flight : EntityBase
{
    [JsonIgnore] public Plane Plane { get; set; } = null!;

    [JsonIgnore] [Column("planeid")] public int PlaneId { get; set; }

    [Column("iscompleted")] public bool IsCompleted { get; set; }
    public List<Checkpoint> Checkpoints { get; set; } = null!;

    public override string ToString()
    {
        return $"{nameof(PlaneId)}: {PlaneId}, {nameof(IsCompleted)}: {IsCompleted}, {nameof(Checkpoints)}: {Checkpoints}";
    }
}