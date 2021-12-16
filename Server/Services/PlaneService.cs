using EFCore.BulkExtensions;
using FlightRadar.Data;
using FlightRadar.Models;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Services;

public class PlaneService
{
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneContext planeContext;

    public PlaneService(PlaneContext planeContext, PlaneBroadcaster planeBroadcaster)
    {
        this.planeContext = planeContext;
        this.planeBroadcaster = planeBroadcaster;
    }


    public async Task<IEnumerable<Plane>?> GetAllAsync()
    {
        return await planeContext.Planes.AsNoTracking().ToListAsync();
    }

    public async Task<Plane?> GetByIdAsync(int id)
    {
        var plane = await planeContext.Planes.FindAsync(id);

        return plane;
    }

    public async Task<Plane?> GetByIcao24Async(string icao24)
    {
        var plane = await planeContext.Planes.FirstAsync(p => p.Icao24.Equals(icao24));

        return plane;
    }

    public async Task<IEnumerable<Plane>?> GetInAreaAsync(double minLat, double maxLat,
                                                          double minLong, double maxLong)
    {
        var planes = await planeContext.Planes
                                       .AsNoTracking()
                                       .Where(plane => plane.Latitude >= minLat)
                                       .Where(plane => plane.Latitude <= maxLat)
                                       .Where(plane => plane.Longitude >= minLong)
                                       .Where(plane => plane.Longitude <= maxLong)
                                       .ToListAsync();

        // var planes = await planeContext.Planes
        //                                .Select(x =>
        //                                            new
        //                                            {
        //                                                Plane = x.Icao24,
        //                                                Icao = x.Latitude
        //                                            }).ToListAsync();
        return planes;
    }

    public async void SaveAllAsync(IEnumerable<Plane> planesModel)
    {
        await planeContext.Planes.AddRangeAsync(planesModel);
        planeContext.SaveChanges();
    }

    public void UpdateCurrentPlanes(List<Plane> newPlanes)
    {
        planeBroadcaster.BroadcastUpdate(newPlanes);
        // await planeContext.Database.ExecuteSqlRawAsync("TRUNCATE TABLE Planes;");
        planeContext.Database.ExecuteSqlRaw("DELETE From Planes");
        // planeContext.Planes.Clear();;
        planeContext.BulkInsert(newPlanes);
        // planeContext.Planes.AddRange(newPlanes);
        planeContext.SaveChanges();
    }
}

public static class EntityExtensions
{
    public static void Clear<T>(this DbSet<T> dbSet) where T : class
    {
        dbSet.RemoveRange(dbSet);
    }
}