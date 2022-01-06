using FlightRadar.Models;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Data;

public class PlaneContext : DbContext
{
    public PlaneContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Plane> Planes { get; set; } = null!;

    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     base.OnModelCreating(modelBuilder);
    //     modelBuilder.Entity<Plane>().ToTable("Planes");
    //
    // }

    // public override int SaveChanges()
    // {
    //     var entries = ChangeTracker
    //                   .Entries()
    //                   .Where(e => e.Entity is EntityBase
    //                               && e.State is EntityState.Added or EntityState.Modified);
    //
    //     foreach (var entityEntry in entries)
    //     {
    //         if (entityEntry.State == EntityState.Added) ((EntityBase)entityEntry.Entity).Inserted = DateTime.Now;
    //         ((EntityBase)entityEntry.Entity).LastUpdated = DateTime.Now;
    //     }
    //
    //     return base.SaveChanges();
    // }
}