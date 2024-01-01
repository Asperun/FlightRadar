using FlightRadar.Data.Projections;
using FlightRadar.Models;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Data;

/// <summary>
///     Aircraft database repository class
/// </summary>
public class PlaneContext : DbContext
{
    public PlaneContext(DbContextOptions options) : base(options) {}
    
    public DbSet<Plane> Planes { get; set; } = null!;
    public DbSet<Checkpoint> Checkpoints { get; set; } = null!;
    public DbSet<Flight> Flights { get; set; } = null!;
    
    public virtual DbSet<DateAmountProjection> DateAmountProj { get; set; } = null!;
    public virtual DbSet<CountryAmountProjection> CountryAmountProj { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Plane>()
                    .HasMany(p => p.Flights)
                    .WithOne(f => f.Plane)
                    .HasForeignKey(f => f.PlaneId);

        modelBuilder.Entity<Flight>()
                    .HasMany(f => f.Checkpoints)
                    .WithOne(c => c.Flight)
                    .HasForeignKey(c => c.FlightId);

        modelBuilder.Entity<Checkpoint>().Property(cp => cp.CreationTime).HasDefaultValueSql("now()");

        modelBuilder.Entity<DateAmountProjection>().HasNoKey();
        modelBuilder.Entity<CountryAmountProjection>().HasNoKey();
    }
}