using System.Collections.ObjectModel;
using System.Diagnostics;
using EFCore.BulkExtensions;
using FlightRadar.Data;
using FlightRadar.Data.Comparers;
using FlightRadar.Data.Projections;
using FlightRadar.Models;
using FlightRadar.Util;
using Microsoft.EntityFrameworkCore;
using static FlightRadar.Data.DTO.ResponseDto;

namespace FlightRadar.Services;

/// <summary>
///     Services used for aircraft operations
/// </summary>
public class PlaneService
{
    private const float turnRadiusThreshold = 35f;
    private static readonly PlaneIcao24Comparer planeComparer = new();
    private static List<Plane> planeListSingleton = new();
    private readonly ILogger<PlaneService> logger;
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneContext planeContext;

    public PlaneService(PlaneContext planeContext, PlaneBroadcaster planeBroadcaster, ILogger<PlaneService> logger)
    {
        this.planeContext = planeContext;
        this.planeBroadcaster = planeBroadcaster;
        this.logger = logger;
    }

    /// <summary>
    /// Gets most recent aircraft from memory list
    /// </summary>
    /// <returns>Read only collection of aircraft</returns>
    public static ReadOnlyCollection<Plane> GetCurrentPlanes()
    {
        return planeListSingleton.AsReadOnly();
    }

    /// <summary>
    /// Fetches amount of aircraft grouped by country
    /// </summary>
    /// <returns>List of aircraft count grouped by country</returns>
    public async Task<List<CountryAmountProjection>> GetRegisteredPerCountry()
    {
        var a = await planeContext.CountryAmountProj
                                  .FromSqlRaw(@"Select RegCountry as Country, Count(Id) as Count
                                                from Planes as p
                                                Group By RegCountry 
                                                Order By Count Desc")
                                  .AsNoTracking()
                                  .ToListAsync();

        Console.WriteLine(a.Count);
        return a;
    }

    /// <summary>
    /// Fetches amount of unique aircraft currently in air grouped by hour of the day
    /// </summary>
    /// <param name="dateUtc">Date to look for</param>
    /// <param name="includeZones">Include columns for zone sorting</param>
    /// <returns></returns>
    public async Task<List<HourAmountProjection>> GetHourlyAmountFromDate(DateTime dateUtc, bool includeZones = false)
    {
        var dayStart = new DateTime(dateUtc.Year, dateUtc.Month, dateUtc.Day);
        var dayEnd = dayStart.Add(new TimeSpan(23, 59, 59));

        return await planeContext.HourAmountProj
                                 .FromSqlRaw(@"Select DATEPART(HOUR , CreationTime) as Hour, 
                                                Count(distinct FlightId) as Count
                                                from Checkpoints
                                                    where CreationTime BETWEEN {0} and {1}
                                                Group By DatePART(HOUR , Checkpoints.CreationTime)
                                                Order BY DatePART(HOUR , Checkpoints.CreationTime)", dayStart, dayEnd)
                                 .AsNoTracking()
                                 .ToListAsync();
    }

    /// <summary>
    /// Fetches generic stats used by index page
    /// </summary>
    /// <returns>Stats</returns>
    public async Task<MainPageProjection> GetMainPageProjection()
    {
        return await planeContext.MainPageProj
                                 .FromSqlRaw(@"Select (Select Count(*) from Planes) as TotalPlanes,
                                                    (Select Count(*) from Flights) as TotalFlights,
                                                 (Select Count(*) from Checkpoints) as TotalCheckpoints")
                                 .AsNoTracking()
                                 .FirstAsync();
    }

    /// <summary>
    ///     Gets aircraft from database by Icao24 value
    /// </summary>
    /// <param name="icao24">Hex representation of aircraft identity</param>
    /// <param name="withCheckpoints">Include checkpoints of recent flight</param>
    /// <returns>Aircraft with specified Icao24</returns>
    public async Task<Plane?> GetByIcao24Async(string icao24, bool withCheckpoints = false)
    {
        Plane plane;
        if (withCheckpoints)
            plane = await planeContext.Planes
                                      .AsNoTracking()
                                      .Include(p => p.Flights.Where(f => !f.IsCompleted))
                                      .ThenInclude(f => f.Checkpoints)
                                      .FirstAsync(p => p.Icao24.Equals(icao24));
        else
            plane = await planeContext.Planes.AsNoTracking().FirstAsync(p => p.Icao24.Equals(icao24));

        return plane;
    }

    /// <summary>
    ///     Checks if aircraft is within bounds of specified coordinates
    /// </summary>
    /// <param name="plane">Aircraft</param>
    /// <param name="coords">Coordinates</param>
    /// <returns>True if in zone</returns>
    private static bool IsInZone(Plane plane, Coordinates coords)
    {
        return plane.Longitude > coords.MinLon && plane.Longitude < coords.MaxLon
                                               && plane.Latitude > coords.MinLat && plane.Latitude < coords.MaxLat;
    }

    /// <summary>
    ///     Gets statistics about aircraft from memory list
    /// </summary>
    /// <remarks>Used by side panel in front-end</remarks>
    /// <returns>DTO of statistics</returns>
    public SidePanelStatsDto GetGlobalStatsAsync()
    {
        return planeListSingleton
               .GroupBy(p => 1)
               .Select(p =>
                           new SidePanelStatsDto
                               (
                                p.Count(),
                                p.Count(i => !i.OnGround),
                                p.Count(i => IsInZone(i, Globals.NorthAmerica)),
                                p.Count(i => IsInZone(i, Globals.Europe))
                               ))
               .First();
    }


    /// <summary>
    ///     Gets all aircraft in specified coordinates, fallbacks to database if memory is empty
    /// </summary>
    /// <param name="minLat">Minimal latitude boundary</param>
    /// <param name="maxLat">Maximal latitude boundary</param>
    /// <param name="minLong">Minimal longitude boundary</param>
    /// <param name="maxLong">Maximal longitude boundary</param>
    /// <param name="maxPlanes">Amount limit</param>
    /// <returns>List of planes in DTO form</returns>
    public List<PlaneListDto> GetInAreaAsync(float minLat, float minLong,
                                             float maxLat, float maxLong,
                                             short maxPlanes)
    {
        List<PlaneListDto> planes;
        if (planeListSingleton.Any())
            planes = planeListSingleton
                     .Select(plane => new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude, plane.TrueTrack))
                     .Where(plane => plane.Latitude >= minLat && plane.Latitude <= maxLat && plane.Longitude >= minLong && plane.Longitude <= maxLong)
                     .Take(maxPlanes)
                     .ToList();
        else
            planes = planeContext.Planes
                                 .AsNoTracking()
                                 .Select(plane => new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude, plane.TrueTrack))
                                 .Where(plane => plane.Latitude >= minLat && plane.Latitude <= maxLat && plane.Longitude >= minLong && plane.Longitude <= maxLong)
                                 .Take(maxPlanes)
                                 .ToList();

        return planes;
    }

    /// <summary>
    ///     Updates subscribers with new aircraft and current values in database
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public async Task UpdatePlanes(List<Plane> planes)
    {
        // 0. Update current singleton
        planeListSingleton = planes;

        // 1. Notify subscribers
        planeBroadcaster.UpdateAndPublish(planes);

        // 2. Update database based on Icao24 hex string
        planeContext.ChangeTracker.AutoDetectChangesEnabled = false;
        await planeContext.BulkInsertOrUpdateAsync(planes, new BulkConfig
        {
            UpdateByProperties = new List<string>(1) { nameof(Plane.Icao24) },
            PropertiesToExcludeOnUpdate = new List<string>(2) { nameof(Plane.Icao24), nameof(Plane.RegCountry) },
            BatchSize = 5000,
            TrackingEntities = false,
            WithHoldlock = false
        });
        planeContext.ChangeTracker.AutoDetectChangesEnabled = true;
    }

/// <summary>
/// Helper method for mapping properties of a Plane to Checkpoint
/// </summary>
/// <param name="plane">Values to copy from</param>
/// <param name="flightId">FlightId of assigned flight</param>
/// <returns>Checkpoint with copied values</returns>
    private static Checkpoint GetCheckpointFromPlane(Plane plane, int flightId = -1)
    {
        if (flightId == -1)
            return new Checkpoint
            {
                Altitude = plane.GeoAltitude,
                Latitude = plane.Latitude,
                Longitude = plane.Longitude,
                TrueTrack = plane.TrueTrack,
                Velocity = plane.Velocity,
                VerticalRate = plane.VerticalRate
            };

        return new Checkpoint
        {
            FlightId = flightId,
            Altitude = plane.GeoAltitude,
            Latitude = plane.Latitude,
            Longitude = plane.Longitude,
            TrueTrack = plane.TrueTrack,
            Velocity = plane.Velocity,
            VerticalRate = plane.VerticalRate
        };
    }

    /// <summary>
    ///     Updates database with new flights/checkpoints if condition is met
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public async Task UpdateCheckpoints(List<Plane> planes)
    {
        var stopwatch = new Stopwatch();
        // planeContext.ChangeTracker.AutoDetectChangesEnabled = false;

        // 1. Fetch corresponding planes from Database
        var icaosToMatch = planes.Select(pl => pl.Icao24);

        stopwatch.Start();
        // var dbPlanes = await planeContext.Planes
        //                
        //                                  // .AsSplitQuery()
        //                                  .Where(p => icaosToMatch.Contains(p.Icao24))
        //                                  // .Include(p => p.Flights.Where(f => !f.IsCompleted))
        //                                  // .ThenInclude(f => f.Checkpoints.Select(cp => new Checkpoint { Id = cp.Id, TrueTrack = cp.TrueTrack }))
        //                                  // .AsNoTracking()
        //                                  .OrderBy(p => p.Icao24)
        //                                  .ToListAsync(); 


        var dbPlanes = await planeContext.Planes
                                         .WhereBulkContains(icaosToMatch, p => p.Icao24)
                                         .Include(p => p.Flights.Where(f => !f.IsCompleted))
                                         .ThenInclude(f => f.Checkpoints)
                                         // .AsSplitQuery()
                                         .OrderBy(p => p.Icao24)
                                         .ToListAsync();

        stopwatch.Stop();
        Console.WriteLine("Query time=" + stopwatch.ElapsedMilliseconds + "ms, el=" + dbPlanes.Count);
        // 2. Binary comparison db list with memory list and update
        for (var i = planes.Count - 1; i-- > 0;)
        {
            var memoryPlane = planes[i];

            var index = dbPlanes.BinarySearch(memoryPlane, planeComparer);
            if (index < 0) continue;

            var dbPlane = dbPlanes[index];

            switch (dbPlane.OnGround)
            {
                case false when !dbPlane.Flights.Any(): // in air but doesnt have flight
                {
                    var newFlight = new Flight { Plane = dbPlane, Checkpoints = new List<Checkpoint> { GetCheckpointFromPlane(dbPlane) } };
                    planeContext.Flights.Add(newFlight);
                    break;
                }
                case true when dbPlane.Flights.Any(): // on ground but has active flight
                {
                    dbPlane.Flights.First().IsCompleted = true;
                    break;
                }
                case false when dbPlane.Flights.Any(): // else if flying
                {
                    var lastCheckpoint = dbPlane.Flights.First().Checkpoints.Last();

                    if (Math.Abs(lastCheckpoint.TrueTrack - memoryPlane.TrueTrack) > turnRadiusThreshold) // turned 20 degree since last checkpoint
                        dbPlane.Flights.First().Checkpoints.Add(GetCheckpointFromPlane(dbPlane));
                    // planeContext.Add(GetCheckpointFromPlane(dbPlane, lastCheckpoint.FlightId));

                    break;
                }
                case true when !dbPlane.Flights.Any(): // Idle
                {
                    continue;
                }
                default:
                    logger.LogWarning("Couldn't resolve case in @" + nameof(UpdateCheckpoints));
                    break;
            }
        }

        // 3. Update DB
        await planeContext.BulkSaveChangesAsync(new BulkConfig
        {
            BatchSize = 5000
            // TrackingEntities = false,
            // WithHoldlock = false,
        });
        stopwatch.Stop();
    }
}