using FlightRadar.Data.Projections;
using FlightRadar.Models;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Data;

/// <summary>
///     Aircraft database repository class
/// </summary>
public class PlaneContext : DbContext
{
    public PlaneContext(DbContextOptions options) : base(options)
    {
    }

    // === Tables ===
    public DbSet<Plane> Planes { get; set; } = null!;
    public DbSet<Checkpoint> Checkpoints { get; set; } = null!;
    public DbSet<Flight> Flights { get; set; } = null!;


    // === Projections ===
    public virtual DbSet<DateAmountProjection> DateAmountProj { get; set; } = null!;
    public virtual DbSet<CountryAmountProjection> CountryAmountProj { get; set; } = null!;
    public virtual DbSet<GeneralStatsProjection> GeneralStatsProj { get; set; } = null!;
    public virtual DbSet<PlaneLastCheckpointProj> PlaneLastCheckpointProj { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Relations
        modelBuilder.Entity<Plane>()
                    .HasMany(p => p.Flights)
                    .WithOne(f => f.Plane)
                    .HasForeignKey(f => f.PlaneId);

        modelBuilder.Entity<Flight>()
                    .HasMany(f => f.Checkpoints)
                    .WithOne(c => c.Flight)
                    .HasForeignKey(c => c.FlightId);

        modelBuilder.Entity<Checkpoint>().Property(eb => eb.CreationTime).HasDefaultValueSql("now()");
        
        // DB Projections
        modelBuilder.Entity<DateAmountProjection>().HasNoKey();
        modelBuilder.Entity<CountryAmountProjection>().HasNoKey();
        modelBuilder.Entity<GeneralStatsProjection>().HasNoKey();
        modelBuilder.Entity<PlaneLastCheckpointProj>().HasNoKey();
    }
}