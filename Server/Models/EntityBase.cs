using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FlightRadar.Models;

/// <summary>
/// Base entity class
/// </summary>
public abstract class EntityBase
{
    [Key]
    [JsonIgnore]
    public int Id { get; set; }
}