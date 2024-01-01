using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Models;

/// <summary>
///     Base entity class
/// </summary>
[Index(nameof(Id), IsUnique = true)]
public abstract class EntityBase
{
    [Key] [JsonIgnore] [Column("id")] public int Id { get; set; }
}