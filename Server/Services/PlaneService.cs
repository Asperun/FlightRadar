using System.Diagnostics;
using EFCore.BulkExtensions;
using FlightRadar.Data;
using FlightRadar.Data.Projections;
using FlightRadar.Models;
using FlightRadar.Util;
using Microsoft.EntityFrameworkCore;
using static FlightRadar.Data.Responses.ResponseDto;

namespace FlightRadar.Services;

/// <summary>
///     Services used for aircraft operations
/// </summary>
public class PlaneService
{
    private const float turnRadiusThreshold = 25f, velocityThreshold = 25f, altitudeThreshold = 500;
    private static List<Plane> memoryPlaneList = new();

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
    ///     Fetches amount of aircraft grouped by country
    /// </summary>
    /// <returns>List of aircraft count grouped by country</returns>
    public async Task<List<CountryAmountProjection>?> GetRegisteredPerCountry()
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
    public async Task<List<DateAmountProjection>?> GetHourlyAmountFromDate(DateTime dateUtc, int pastDays = 0)
    {
        var startDate = new DateTime(dateUtc.Year, dateUtc.Month, dateUtc.Day)
            .Subtract(new TimeSpan(pastDays, 0, 0, 0));

        List<DateAmountProjection>? dateAmountProjection = null;
        try
        {
            dateAmountProjection = await planeContext
                                         .DateAmountProj
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
                                                 .FromSqlInterpolated($"Select DATE_PART('Day', creation_time)::integer as \"Day\", TRIM(TRAILING FROM to_char (creation_time, 'Month')) as \"Month\", DATE_PART('HOUR', creation_time)::integer  as \"Hour\", Count(distinct flight_id)::integer     as \"Count\" from checkpoints where creation_time BETWEEN {startDate} and {dateUtc} and longitude Between {coordinates.MinLon} and {coordinates.MaxLon} and latitude between {coordinates.MinLat} and {coordinates.MaxLat} Group By to_char(creation_time, 'Month'), DATE_PART('Day', creation_time), DATE_PART('HOUR', creation_time) Order BY to_char(creation_time, 'Month'), DATE_PART('Day', creation_time), DATE_PART('HOUR', creation_time)")
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
        GeneralStatsProjection statsProjection = null!;
        try
        {
            statsProjection = await planeContext
                                    .Planes
                                    .AsNoTracking()
                                    .Select(p => new GeneralStatsProjection
                                    {
                                        TotalPlanes = planeContext.Planes.Count(),
                                        TotalFlights = planeContext.Flights.Count(),
                                        TotalCheckpoints = planeContext.Checkpoints.Count(),
                                    })
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
                                          .AsSplitQuery()
                                          .Include(p => p.Flights.Where(f => !f.IsCompleted))
                                          .ThenInclude(f => f.Checkpoints)
                                          .FirstAsync(p => p.Icao24.Equals(icao24));
            }
            else
            {
                plane = await planeContext.Planes
                                          .AsNoTracking()
                                          .FirstAsync(p => p.Icao24.Equals(icao24));
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
        return plane.Longitude >= coords.MinLon && plane.Longitude <= coords.MaxLon
                                               && plane.Latitude >= coords.MinLat && plane.Latitude <= coords.MaxLat;
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
               .FirstOrDefault();
    }


    /// <summary>
    ///     Gets all aircraft in specified coordinates, fallbacks to database if memory is empty
    /// </summary>
    /// <param name="minLat">Minimal latitude boundary</param>
    /// <param name="maxLat">Maximal latitude boundary</param>
    /// <param name="minLong">Minimal longitude boundary</param>
    /// <param name="maxLong">Maximal longitude boundary</param>
    /// <param name="maxPlanes">Amount limit</param>
    /// <param name="showLanded">Show landed planes</param>
    /// <returns>List of planes in DTO form</returns>
    public List<PlaneListDto> GetInAreaAsync(float minLat, float minLong,
                                             float maxLat, float maxLong,
                                             short maxPlanes, bool showLanded = false)
    {
        var planes = memoryPlaneList.AsEnumerable();

        if (!showLanded)
            planes = planes.Where(p => !p.OnGround);

        return planes
               .Select(plane => new PlaneListDto(plane.Icao24, plane.CallSign, plane.Longitude, plane.Latitude, plane.TrueTrack))
               .Where(plane => plane.Latitude >= minLat && plane.Latitude <= maxLat 
                                                        && plane.Longitude >= minLong && plane.Longitude <= maxLong)
               .Take(maxPlanes)
               .ToList();
    }

    /// <summary>
    ///     Updates subscribers with new aircraft and current values in database
    /// </summary>
    /// <param name="planes">List of aircraft</param>
    public async Task UpdatePlanes(List<Plane> planes)
    {
        memoryPlaneList = planes;
        planeBroadcaster.Publish(planes);

        var stopwatch = new Stopwatch();
        stopwatch.Start();
        planeContext.ChangeTracker.AutoDetectChangesEnabled = false;

        try
        {
            await planeContext.BulkInsertOrUpdateAsync(planes, new BulkConfig
            {
                UpdateByProperties = new List<string>(1) { nameof(Plane.Icao24) },
                BatchSize = 3000,
                TrackingEntities = false,
                WithHoldlock = false
            });
        }
        catch (Exception e)
        {
            logger.LogWarning("{Message}", e.Message);
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
        stopwatch.Start();
        try
        {
            planeContext.ChangeTracker.AutoDetectChangesEnabled = false;
            var dbPlanes = await planeContext.Planes
                                             .AsNoTracking()
                                             .Where(plane => memoryPlaneList
                                                             .Select(p => p.Icao24)
                                                             .Contains(plane.Icao24))
                                             .Select(plane => new PlaneLastCheckpointProj
                                             {
                                                 Icao24 = plane.Icao24,
                                                 TrueTrack = plane.TrueTrack,
                                                 Velocity = plane.Velocity,
                                                 Id = plane.Id,
                                                 OnGround = plane.OnGround,
                                                 FlightId = plane.Flights
                                                                 .Where(f => !f.IsCompleted)
                                                                 .Select(f => f.Id)
                                                                 .First(),
                                                 Latitude = plane.Latitude,
                                                 Longitude = plane.Longitude,
                                                 LastCheckpointTrueTrack = plane.Flights
                                                                                .Where(f => !f.IsCompleted)
                                                                                .Select(f => f.Checkpoints
                                                                                              .OrderBy(cp => cp.Id)
                                                                                              .Last()
                                                                                              .TrueTrack)
                                                                                .First()
                                             })
                                             .OrderBy(plane => plane.Icao24)
                                             .ToListAsync();


            stopwatch.Stop();
            logger.LogInformation("Query time={QueryTimeMs}ms, el={ListSize}", stopwatch.ElapsedMilliseconds, dbPlanes.Count);

            if (dbPlanes.Count == 0)
            {
                logger.LogInformation("No planes found");
                return;
            }

            logger.LogInformation("icaos={@Icaos}", dbPlanes.Count);
            
            for (var i = planes.Count - 1; i-- > 0;)
            {
                var memoryPlane = planes[i];

                var index = dbPlanes.BinaryFind(memoryPlane.Icao24, p => p.Icao24);
                if (index < 0) continue;

                var dbPlane = dbPlanes[index];
                var hasActiveFlight = dbPlane.FlightId != null;

                switch (memoryPlane.OnGround)
                {
                    case false
                        when !hasActiveFlight && memoryPlane.Velocity > velocityThreshold
                                              && memoryPlane.GeoAltitude > altitudeThreshold: // in air but doesnt have flight and velocity higher than 25kt/s
                    {
                        var newFlight = new Flight { PlaneId = dbPlane.Id };
                        planeContext.Flights.Add(newFlight);
                        break;
                    }
                    case true when hasActiveFlight: // on ground but has active flight
                    {
                        planeContext.Flights.Update(new Flight { Id = dbPlane.FlightId.Value, PlaneId = dbPlane.Id, IsCompleted = true });
                        break;
                    }
                    case false when hasActiveFlight && (memoryPlane.Velocity < velocityThreshold || memoryPlane.GeoAltitude < altitudeThreshold):
                    {
                        planeContext.Flights.Update(new Flight { Id = dbPlane.FlightId.Value, PlaneId = dbPlane.Id, IsCompleted = true });
                        break;
                    }
                    case false when hasActiveFlight: //  if flying
                    {
                        var checkpoint = GetCheckpointFromPlane(memoryPlane, dbPlane.FlightId.Value);

                        if (dbPlane.LastCheckpointTrueTrack == null)
                        {
                            planeContext.Checkpoints.Add(checkpoint);
                            break;
                        }

                        if (Math.Abs(dbPlane.LastCheckpointTrueTrack.Value - memoryPlane.TrueTrack) > turnRadiusThreshold)
                            planeContext.Checkpoints.Add(checkpoint);
                        
                        break;
                    }
                    case true when !hasActiveFlight: // On ground and idle
                    {
                        continue;
                    }
                }
            }

            await planeContext.SaveChangesAsync();
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
    }
}