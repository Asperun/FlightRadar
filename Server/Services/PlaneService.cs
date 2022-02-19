using System.Collections.ObjectModel;
using System.Data;
using System.Diagnostics;
using EFCore.BulkExtensions;
using FlightRadar.Data;
using FlightRadar.Data.Projections;
using FlightRadar.Models;
using FlightRadar.Util;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.VisualBasic;
using static FlightRadar.Data.Responses.ResponseDto;

namespace FlightRadar.Services;

/// <summary>
///     Services used for aircraft operations
/// </summary>
public class PlaneService
{
    private const float turnRadiusThreshold = 25f;
    private readonly ILogger<PlaneService> logger;
    private readonly PlaneBroadcaster planeBroadcaster;
    private readonly PlaneContext planeContext;
    private static List<Plane> memoryPlaneList = new();

    public PlaneService(PlaneContext planeContext, PlaneBroadcaster planeBroadcaster, ILogger<PlaneService> logger)
    {
        this.planeContext = planeContext;
        this.planeBroadcaster = planeBroadcaster;
        this.logger = logger;
    }

    /// <summary>
    ///     Gets most recent aircraft from memory list
    /// </summary>
    /// <returns>Read only collection of aircraft</returns>
    public static ReadOnlyCollection<Plane> GetCurrentPlanes()
    {
        return memoryPlaneList.AsReadOnly();
    }

    /// <summary>
    ///     Fetches amount of aircraft grouped by country
    /// </summary>
    /// <returns>List of aircraft count grouped by country</returns>
    public async Task<List<CountryAmountProjection>> GetRegisteredPerCountry()
    {
        List<CountryAmountProjection>? countryAmountProjections = null;

        try
        {
            countryAmountProjections = await planeContext.CountryAmountProj
                                                         .FromSqlRaw(CountryAmountProjection.Query)
                                                         .AsNoTracking()
                                                         .ToListAsync();
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return countryAmountProjections;
    }

    /// <summary>
    ///     Fetches amount of unique aircraft currently in air grouped by hour of the day
    /// </summary>
    /// <param name="dateUtc">Date to look for</param>
    /// <param name="pastDays">Amount of days in the past to include</param>
    /// <returns></returns>
    public async Task<List<DateAmountProjection>> GetHourlyAmountFromDate(DateTime dateUtc, int pastDays = 0)
    {
        var startDate = new DateTime(dateUtc.Year, dateUtc.Month, dateUtc.Day).Subtract(new TimeSpan(pastDays, 0, 0, 0));

        List<DateAmountProjection>? dateAmountProjection = null;
        try
        {
            dateAmountProjection = await planeContext.DateAmountProj
                                                     .FromSqlInterpolated(DateAmountProjection.Query(startDate, dateUtc))
                                                     .AsNoTracking()
                                                     .ToListAsync();
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return dateAmountProjection;
    }

    /// <summary>
    ///     Fetches amount of aircraft for each zone grouped by hour
    /// </summary>
    /// <param name="dateUtc">Date to look for</param>
    /// <param name="pastDays">Amount of days in the past to include</param>
    /// <returns>Amount of aircraft per zone</returns>
    public async Task<List<List<DateAmountProjection>>> GetHourlyAmountFromDatePerRegion(DateTime dateUtc, int pastDays = 0)
    {
        var startDate = new DateTime(dateUtc.Year, dateUtc.Month, dateUtc.Day).Subtract(new TimeSpan(pastDays, 0, 0, 0));

        List<List<DateAmountProjection>> returnList = new();

        try
        {
            foreach (var coordinates in Globals.GetAllRegions)
            {
                returnList.Add(await planeContext.DateAmountProj
                                                 .FromSqlInterpolated(@$"
                                            Select DATEPART(Day, CreationTime)   as Day,
                                           DATENAME(Month, CreationTime) as Month,
                                           DATEPART(HOUR, CreationTime)  as Hour,
                                           Count(distinct FlightId)      as Count
                                            from Checkpoints where CreationTime BETWEEN {startDate} and {dateUtc}
                                              and Longitude Between {coordinates.MinLon} and {coordinates.MaxLon}
                                              and Latitude between {coordinates.MinLat} and {coordinates.MaxLat}
                                            Group By DATENAME(Month, CreationTime), DATEPART(Day, CreationTime), DatePART(HOUR, CreationTime)
                                            Order BY DATENAME(Month, CreationTime), DATEPART(Day, CreationTime), DatePART(HOUR, CreationTime)")
                                                 .AsNoTracking()
                                                 .ToListAsync()
                              );
            }
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return returnList;
    }


    /// <summary>
    ///     Fetches generic stats used by index page
    /// </summary>
    /// <returns>Stats</returns>
    public async Task<GeneralStatsProjection> GetMainPageProjection()
    {
        GeneralStatsProjection? statsProjection = null;
        try
        {
            statsProjection = await planeContext.GeneralStatsProj
                                                .FromSqlRaw(GeneralStatsProjection.Query)
                                                .AsNoTracking()
                                                .FirstAsync();
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return statsProjection;
    }

    /// <summary>
    ///     Gets aircraft from database by Icao24 value
    /// </summary>
    /// <param name="icao24">Hex representation of aircraft identity</param>
    /// <param name="withCheckpoints">Include checkpoints of recent flight</param>
    /// <returns>Aircraft with specified Icao24</returns>
    public async Task<Plane?> GetByIcao24Async(string icao24, bool withCheckpoints = false)
    {
        Plane? plane = null;
        try
        {
            if (withCheckpoints)
            {
                plane = await planeContext.Planes
                                          .AsNoTracking()
                                          .Include(p => p.Flights.Where(f => !f.IsCompleted))
                                          .ThenInclude(f => f.Checkpoints)
                                          .FirstAsync(p => p.Icao24.Equals(icao24));
            }
            else
            {
                plane = await planeContext.Planes.AsNoTracking().FirstAsync(p => p.Icao24.Equals(icao24));
            }
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return plane;
    }

    /// <summary>
    ///     Checks if aircraft is within bounds of specified coordinates
    /// </summary>
    /// <param name="plane">Aircraft</param>
    /// <param name="coords">Coordinates</param>
    /// <returns>True if in zone</returns>
    private static bool IsInArea(Plane plane, Coordinates coords)
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
        return memoryPlaneList
               .GroupBy(p => 1)
               .Select(p =>
                           new SidePanelStatsDto
                               (
                                p.Count(),
                                p.Count(i => !i.OnGround),
                                p.Count(i => IsInArea(i, Globals.NorthAmerica)),
                                p.Count(i => IsInArea(i, Globals.Europe))
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
        List<PlaneListDto>? planes = null;
        try
        {
            if (memoryPlaneList.Any())
            {
                planes = memoryPlaneList
                         .Select(plane => new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude, plane.TrueTrack))
                         .Where(plane => plane.Latitude >= minLat && plane.Latitude <= maxLat && plane.Longitude >= minLong && plane.Longitude <= maxLong)
                         .Take(maxPlanes)
                         .ToList();
            }
            else
            {
                planes = planeContext.Planes
                                     .AsNoTracking()
                                     .Select(plane => new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude, plane.TrueTrack))
                                     .Where(plane => plane.Latitude >= minLat && plane.Latitude <= maxLat && plane.Longitude >= minLong &&
                                                     plane.Longitude <= maxLong)
                                     .Take(maxPlanes)
                                     .ToList();
            }
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }

        return planes;
    }

    /// <summary>
    ///     Updates subscribers with new aircraft and current values in database
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public async Task UpdatePlanes(List<Plane> planes) // avg ~1.8 sec for 7k updates
    {
        // 0. Update current singleton
        memoryPlaneList = planes;

        // 1. Notify subscribers
        planeBroadcaster.Publish(planes);

        // 2. Update database based on Icao24 hex string
        var stopwatch = new Stopwatch();
        stopwatch.Start();


        // 3. Pull new context from pool, do this because main context might be used
        planeContext.ChangeTracker.AutoDetectChangesEnabled = false;

        await using (var transaction = await planeContext.Database.BeginTransactionAsync())
        {
            try
            {
                await planeContext.BulkInsertOrUpdateAsync(planes, new BulkConfig
                {
                    // UniqueTableNameTempDb = true,
                    // UseTempDB = true,
                    UpdateByProperties = new List<string>(1) { nameof(Plane.Icao24) },
                    PropertiesToExcludeOnUpdate = new List<string>(2) { nameof(Plane.Icao24), nameof(Plane.RegCountry) },
                    BatchSize = 3000,
                    TrackingEntities = false,
                    WithHoldlock = false
                });

                await transaction.CommitAsync();
            }
            catch (Exception e)
            {
                logger.LogWarning("{Message}", e.Message);
            }
            finally
            {
                await transaction.DisposeAsync();
            }
        }

        stopwatch.Stop();
        logger.LogInformation("Updated planes in={Time}", stopwatch.ElapsedMilliseconds);
        planeContext.ChangeTracker.AutoDetectChangesEnabled = true;
    }

    /// <summary>
    ///     Helper method for mapping properties of a Plane to Checkpoint
    /// </summary>
    /// <param name="plane">Values to copy from</param>
    /// <param name="flightId">FlightId of assigned flight</param>
    /// <returns>Checkpoint with copied values</returns>
    private static Checkpoint GetCheckpointFromPlane(Plane plane, int flightId = -1)
    {
        return new Checkpoint
        {
            FlightId = flightId, Altitude = plane.GeoAltitude, Latitude = plane.Latitude, Longitude = plane.Longitude, TrueTrack = plane.TrueTrack,
            Velocity = plane.Velocity, VerticalRate = plane.VerticalRate
        };
    }


    /// <summary>
    ///     Updates database with new flights/checkpoints if condition is met
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public async Task UpdateCheckpoints(List<Plane> planes)
    {
        var stopwatch = new Stopwatch();

        stopwatch.Start();
        try
        {
            planeContext.ChangeTracker.AutoDetectChangesEnabled = false;
            // 2s for 80k results... not bad compared to 34s from LINQ
            var dbPlanes = await planeContext.PlaneLastCheckpointProj
                                             .FromSqlRaw(PlaneLastCheckpointProj.Query)
                                             .AsNoTracking()
                                             .ToListAsync();

            stopwatch.Stop();
            logger.LogInformation("Query time={QueryTimeMs}ms, el={ListSize}", stopwatch.ElapsedMilliseconds, dbPlanes.Count);

            var icaos = dbPlanes.Select(d => d.Icao24).ToList();
            await using (var transaction = await planeContext.Database.BeginTransactionAsync())
            {
                // 2. Binary comparison db list with memory list and update
                for (var i = planes.Count - 1; i-- > 0;)
                {
                    var memoryPlane = planes[i];

                    var index = icaos.BinarySearch(memoryPlane.Icao24);
                    if (index < 0) continue;

                    var dbPlane = dbPlanes[index];
                    var hasActiveFlight = dbPlane.FlightId != null;

                    switch (memoryPlane.OnGround)
                    {
                        case false when !hasActiveFlight && memoryPlane.Velocity > 15f: // in air but doesnt have flight and velocity higher than 40km/h
                        {
                            // var newFlight = new Flight { PlaneId = dbPlane.Id, Checkpoints = new List<Checkpoint>(1) { GetCheckpointFromPlane(memoryPlane) } };
                            var newFlight = new Flight { PlaneId = dbPlane.Id };
                            planeContext.Flights.Add(newFlight);

                            // var cp = GetCheckpointFromPlane(memoryPlane);
                            // cp.FlightId = newFlight;
                            // planeContext.Checkpoints.Add(cp);
                            // newFlight.Checkpoints.Add(cp);
                            // newFlight.Checkpoints = new List<Checkpoint>(1){GetCheckpointFromPlane(memoryPlane)};
                            // planeContext.Update(newFlight);
                            // planeContext.Checkpoints.Add()
                            break;
                        }
                        case true when hasActiveFlight: // on ground but has active flight
                        {
                            // planeContext.Flights.Where(f=>f.Id == dbPlane.Id).First().
                            planeContext.Flights.Update(new Flight
                            {
                                Id = dbPlane.FlightId.Value, PlaneId = dbPlane.Id, IsCompleted = true
                            }); // set active flight completed
                            break;
                        }
                        case false
                            when hasActiveFlight && memoryPlane.Velocity > 2 && memoryPlane.Velocity < 15f
                            : // not on ground but speed lower than 40km/h so prob landed
                        {
                            planeContext.Flights.Update(new Flight
                            {
                                Id = dbPlane.FlightId.Value, PlaneId = dbPlane.Id, IsCompleted = true
                            }); // set active flight completed
                            break;
                        }
                        case false when hasActiveFlight: //  if flying
                        {
                            var checkpoint = GetCheckpointFromPlane(memoryPlane, dbPlane.FlightId.Value);

                            if (dbPlane.LastCheckpointTrueTrack == null) // have flight but dont have cp ? O_o
                            {
                                planeContext.Checkpoints.Add(checkpoint);
                                break;
                            }

                            if (Math.Abs(dbPlane.LastCheckpointTrueTrack.Value - memoryPlane.TrueTrack) > turnRadiusThreshold)
                            {
                                // turned 35 degree since last checkpoint
                                // Console.WriteLine("updating CP with flightId=" + dbPlane.FlightId);
                                // planeContext.Checkpoints.FromSqlInterpolated(@$"Insert Into Checkpoints(FlightId,TrueTrack,Velocity,Latitude,Longitude,Altitude) Values ({dbPlane.FlightId},{checkpoint.TrueTrack},{checkpoint.Velocity},{checkpoint.Latitude},{checkpoint.Longitude},{checkpoint.Altitude})").;
                                planeContext.Checkpoints.Add(checkpoint);
                            }

                            break;
                        }
                        case true when !hasActiveFlight: // On ground and idle
                        {
                            continue;
                        }
                        default:
                            // logger.LogWarning("Couldn't resolve case in @" + nameof(UpdateCheckpoints));
                            break;
                    }
                }

                // 3. Update DB

                try
                {
                    await planeContext.BulkSaveChangesAsync(new BulkConfig
                    {
                        WithHoldlock = false,
                        TrackingEntities = false,
                        BatchSize = 3000
                    });
                }
                catch (Exception e)
                {
                    logger.LogWarning("{Message}", e.Message);
                }
                finally
                {
                    await transaction.DisposeAsync();
                }
            }
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
        }
        finally
        {
            planeContext.ChangeTracker.AutoDetectChangesEnabled = true;
        }

        logger.LogInformation("Bulk save Done!");
        stopwatch.Stop();
    }
}