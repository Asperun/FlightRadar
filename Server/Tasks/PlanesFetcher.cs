using System.Diagnostics;
using System.Text.Json;
using FlightRadar.Models;
using FlightRadar.Services;

namespace FlightRadar.Tasks;

public class PlanesFetcher : IHostedService, IDisposable
{
    private const int interval = 10;
    private readonly IConfiguration configuration;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<PlanesFetcher> logger;
    private readonly IServiceScopeFactory services;

    private Timer timer = null!;


    public PlanesFetcher(ILogger<PlanesFetcher> logger, IServiceScopeFactory services,
                         IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        this.logger = logger;
        this.services = services;
        this.configuration = configuration;
        this.httpClientFactory = httpClientFactory;
    }

    public void Dispose()
    {
        timer?.Dispose();
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Starting Async @PlanesFetcher");
        timer = new Timer(FetchPlanes, null, TimeSpan.Zero,
                          TimeSpan.FromSeconds(interval));
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("BackgroundTask is stopping");

        timer?.Change(Timeout.Infinite, 0);

        return Task.CompletedTask;
    }


    private async void FetchPlanes(object? state)
    {
        var stopwatch = new Stopwatch();

        using var scope = services.CreateScope();
        var planeService = scope.ServiceProvider.GetRequiredService<PlaneService>();

        // Request
        var connectionString = string.Format("https://{0}:{1}@opensky-network.org/api/states/all",
                                             configuration["OpenSkyApi:UserName"],
                                             configuration["OpenSkyApi:Password"]);

        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, connectionString);
        var httpClient = httpClientFactory.CreateClient("OpenSky");

        // Send and response
        using (var httpResponseMessage = await httpClient.SendAsync(httpRequestMessage))
        {
            if (!httpResponseMessage.IsSuccessStatusCode) return;
            await using var contentStream = await httpResponseMessage.Content.ReadAsStreamAsync();

            // Receive response
            var response = await JsonSerializer.DeserializeAsync<SkyApiResponse>(contentStream);

            if (response == null) return;

            // Convert response to model
            stopwatch.Start();
            var newPlanesList = response.ConvertToModel(true);
            stopwatch.Stop();

            logger.LogWarning("fetched and processed {PlanesAmount} planes in {ElapsedTime}ms",
                              newPlanesList.Count, stopwatch.ElapsedMilliseconds);

            // await planeService.UpdateCurrentPlanes(newPlanesList);
            await planeService.UpdateCurrentPlanes(newPlanesList);
            //
            //
            // // Debug
            // var matchesFound = 0;
            //
            // // Get old planes
            // var databasePlanes = await planeService.GetAllAsync();
            //
            // // Compare
            // stopwatch.Restart();
            // var planeComparer = new PlaneComparer();
            // foreach (var plane in databasePlanes!)
            // {
            //     var resultIndex = newPlanesList.BinarySearch(plane, planeComparer);
            //     if (resultIndex > -1)
            //     {
            //         matchesFound++;
            //         // Console.WriteLine("InsertDate " + plane.Inserted.Value);
            //         
            //         //var planeToUpdate = planeService.GetByIcao24Async(newPlanesList[indedx].Icao24);
            //         
            //         
            //         // var idtemp = plane.Id;
            //          newPlanesList[resultIndex].Id = plane.Id;
            //     }
            //
            // }
            //
            // stopwatch.Stop();
            // logger.LogWarning("Found {Matches} matches in {Millis}ms", matchesFound,
            //                       stopwatch.ElapsedMilliseconds);
            //
            // UpdateInNewContext(newPlanesList);
        }
    }


    private sealed class SkyApiResponse
    {
        public int time { get; set; }
        public JsonElement[][] states { get; set; }

        public List<Plane> ConvertToModel(bool sorted = false)
        {
            var planeList = new List<Plane>();
            foreach (var state in states)
            {
                var plane = new Plane
                {
                    Icao24 = state[States.Icao24].GetString()!,
                    CallSign = state[States.CallSign].GetString()?.TrimEnd(),
                    OriginCountry = state[States.OriginCountry].GetString(),
                    TimePosition = state[States.TimePosition]
                                       .ValueKind != JsonValueKind.Null
                                       ? state[States.TimePosition].GetInt32()
                                       : -1,
                    LastContact = state[States.LastContact]
                                      .ValueKind != JsonValueKind.Null
                                      ? state[States.LastContact].GetInt32()
                                      : -1,
                    Longitude = state[States.Longitude]
                                    .ValueKind != JsonValueKind.Null
                                    ? state[States.Longitude].GetSingle()
                                    : -1,
                    Latitude = state[States.Latitude].ValueKind != JsonValueKind.Null
                                   ? state[States.Latitude].GetSingle()
                                   : -1,
                    BaroAltitude = state[States.BaroAltitude].ValueKind != JsonValueKind.Null
                                       ? state[States.BaroAltitude].GetSingle()
                                       : -1,
                    OnGround = state[States.OnGround].GetBoolean(),
                    Velocity = state[States.Velocity].ValueKind != JsonValueKind.Null
                                   ? state[States.Velocity].GetSingle()
                                   : -1,
                    TrueTrack = state[States.TrueTrack].ValueKind != JsonValueKind.Null
                                    ? state[States.TrueTrack].GetSingle()
                                    : -1,
                    VerticalRate = state[States.VerticalRate].ValueKind != JsonValueKind.Null
                                       ? state[States.VerticalRate].GetSingle()
                                       : -1,
                    GeoAltitude = state[States.GeoAltitude].ValueKind != JsonValueKind.Null
                                      ? state[States.GeoAltitude].GetSingle()
                                      : -1,
                    Squawk = state[States.Squawk].GetString(),
                    Spi = state[States.Spi].GetBoolean(),
                    PositionSource = (byte?)(state[States.PositionSource].ValueKind != JsonValueKind.Null
                                                 ? state[States.PositionSource].GetByte()
                                                 : -1)
                };
                planeList.Add(plane);
            }

            if (sorted) planeList.Sort(new PlaneComparer());
            return planeList;
        }

        private sealed class States
        {
            public const byte
                Icao24 = 0,
                CallSign = 1,
                OriginCountry = 2,
                TimePosition = 3,
                LastContact = 4,
                Longitude = 5,
                Latitude = 6,
                BaroAltitude = 7,
                OnGround = 8,
                Velocity = 9,
                TrueTrack = 10,
                VerticalRate = 11,
                Sensors = 12,
                GeoAltitude = 13,
                Squawk = 14,
                Spi = 15,
                PositionSource = 16;
        }
    }

    private sealed class PlaneComparer : IComparer<Plane>
    {
        public int Compare(Plane? x, Plane? other)
        {
            if (x == null) return -1;

            if (other == null) return 1;

            if (x.Icao24.Equals(other.Icao24)) return 0;

            return string.Compare(x.Icao24, other.Icao24, StringComparison.Ordinal);
        }
    }
}