using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Models;

/// <summary>
///     Model class for Checkpoint entity
/// </summary>
[Table("checkpoints")]
[Index(nameof(CreationTime))]
[Index(nameof(CreationTime), nameof(Longitude), nameof(Latitude))]
public class Checkpoint : EntityBase
{
    [JsonIgnore] 
    public Flight Flight { get; set; } = null!;
    [JsonIgnore] 
    [Column("flight_id")]
    public int FlightId { get; set; }
    [Column("creation_time")] 
    public DateTime? CreationTime { get; set; }
    [Column("longitude")] 
    public float Longitude { get; set; }
    [Column("latitude")] 
    public float Latitude { get; set; }
    [Column("velocity")]
    public float Velocity { get; set; }
    [Column("altitude")]
    public float Altitude { get; set; }
    [Column("true_track")]
    public float TrueTrack { get; set; }
    [Column("vertical_rate")] 
    public float VerticalRate { get; set; }

    public override string ToString()
    {
        return $"{nameof(FlightId)}: {FlightId}," +
               $" {nameof(Longitude)}: {Longitude}," +
               $" {nameof(Latitude)}: {Latitude}," +
               $" {nameof(Velocity)}: {Velocity}," +
               $" {nameof(Altitude)}: {Altitude}," +
               $" {nameof(TrueTrack)}: {TrueTrack}," +
               $" {nameof(VerticalRate)}: {VerticalRate}";
    }
}