using EFCore.BulkExtensions;
using FlightRadar.Data;
using FlightRadar.Data.DTO;
using FlightRadar.Models;
using FlightRadar.Util;
using Microsoft.EntityFrameworkCore;

namespace FlightRadar.Services;

public class PlaneService
{
    private readonly ILogger<PlaneService> logger;
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneContext planeContext;

    public PlaneService(PlaneContext planeContext, PlaneBroadcaster planeBroadcaster, ILogger<PlaneService> logger)
    {
        this.planeContext = planeContext;
        this.planeBroadcaster = planeBroadcaster;
        this.logger = logger;
    }

    public async Task<IEnumerable<Plane>?> GetAllAsync()
    {
        return await planeContext.Planes.AsNoTracking().ToListAsync();
    }

    public async Task<Plane?> GetByIdAsync(int id)
    {
        return await planeContext.Planes.FindAsync(id);
    }

    public async Task<Plane?> GetByIcao24Async(string icao24)
    {
        return await planeContext.Planes.FirstAsync(p => p.Icao24.Equals(icao24));
    }

    private static bool IsInZone(Plane plane, Coordinates coords)
    {
        return plane.Longitude > coords.MinLon && plane.Longitude < coords.MaxLon
                                               && plane.Latitude > coords.MinLat && plane.Latitude < coords.MaxLat;
    }

    public GlobalStatsDto GetGlobalStatsAsync()
    {
        return planeBroadcaster.PlaneListSingleton
                               // .Where(p => !p.OnGround!.Value)
                               .GroupBy(p => 1)
                               .Select(p =>
                                           new GlobalStatsDto
                                               (
                                                p.Count(),
                                                p.Count(i => !i.OnGround!.Value),
                                                p.Count(i => IsInZone(i, Globals.CoordinatesUs)),
                                                p.Count(i => IsInZone(i, Globals.CoordinatesEu))
                                               ))
                               .First();
    }


    public async Task<IEnumerable<PlaneListDTO>?> GetInAreaAsync(float minLat, float maxLat,
                                                                 float minLong, float maxLong,
                                                                 short maxPlanes)
    {
        List<PlaneListDTO> planes;
        if (planeBroadcaster.PlaneListSingleton.Any())
            planes = planeBroadcaster.PlaneListSingleton
                                     .Where(plane => plane.Latitude >= minLat)
                                     .Where(plane => plane.Latitude <= maxLat)
                                     .Where(plane => plane.Longitude >= minLong)
                                     .Where(plane => plane.Longitude <= maxLong)
                                     .Select(plane =>
                                                 new PlaneListDTO(plane.Icao24, plane.CallSign, plane.Longitude,
                                                                  plane.Latitude, plane.TrueTrack))
                                     .Take(maxPlanes)
                                     .ToList();
        else
            planes = await planeContext.Planes
                                       .AsNoTracking()
                                       .Where(plane => plane.Latitude <= maxLat)
                                       .Where(plane => plane.Longitude >= minLong)
                                       .Where(plane => plane.Longitude <= maxLong)
                                       .Where(plane => plane.Latitude >= minLat)
                                       .Select(plane => new PlaneListDTO(plane.Icao24, plane.CallSign, plane.Longitude,
                                                                         plane.Latitude, plane.TrueTrack))
                                       .Take(maxPlanes)
                                       .ToListAsync();

        return planes;
    }


    public async Task UpdateCurrentPlanes(IEnumerable<Plane> newPlanes)
    {
        // 1.) Update in memory DB of current planes
        // var enumerable = newPlanes.ToList();
        planeBroadcaster.PlaneListSingleton = newPlanes.ToList();

        // 2.) Broadcast to all subscribers
        planeBroadcaster.BroadcastUpdate(planeBroadcaster.PlaneListSingleton.Select(plane =>
                                             new PlaneListDTO(plane.Icao24, plane.CallSign, plane.Longitude,
                                                              plane.Latitude, plane.TrueTrack)));

        // 3.) Update Main Database
        await planeContext.BulkInsertOrUpdateAsync(planeBroadcaster.PlaneListSingleton,
                                                   options => options.UpdateByProperties =
                                                                  new List<string>(1) { "Icao24" });
        await planeContext.SaveChangesAsync();
    }
}

public static class EntityExtensions
{
    public static void Clear<T>(this DbSet<T> dbSet) where T : class
    {
        dbSet.RemoveRange(dbSet);
    }
}