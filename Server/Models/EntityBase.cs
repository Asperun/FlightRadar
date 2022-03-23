using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FlightRadar.Models;

/// <summary>
///     Base entity class
/// </summary>
public abstract class EntityBase
{
    [Key] [JsonIgnore] [Column("id")] public int Id { get; set; }
}