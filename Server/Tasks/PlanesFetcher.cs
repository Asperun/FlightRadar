using System.Text.Json;
using FlightRadar.Data.Requests;
using FlightRadar.Models;
using FlightRadar.Services;

namespace FlightRadar.Tasks;

/// <summary>
///     OpenSky Api data fetching and processing class
/// </summary>
public class PlanesFetcher : IHostedService, IDisposable
{
    private readonly IConfiguration configuration;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<PlanesFetcher> logger;
    private readonly IServiceScopeFactory services;

    private Timer task1 = null!;
    private Timer task2 = null!;

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
        task1?.Dispose();
        task2?.Dispose();
    }

    /// <summary>
    ///     Stats async tasks
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns>Status of a task</returns>
    public Task StartAsync(CancellationToken cancellationToken)
    {
        task1 = new Timer(state => FetchPlanes(state, Callback_UpdatePlanes), null, TimeSpan.Zero
                        , TimeSpan.FromSeconds(int.Parse(configuration["Intervals:FetchInterval"])));
        task2 = new Timer(state => FetchPlanes(state, Callback_UpdateCheckpoints), null, TimeSpan.Zero
                        , TimeSpan.FromSeconds(int.Parse(configuration["Intervals:CheckpointsInterval"])));
        return Task.CompletedTask;
    }

    /// <summary>
    ///     Stops all tasks
    /// </summary>
    /// <param name="stoppingToken"></param>
    /// <returns>Status of a task</returns>
    public Task StopAsync(CancellationToken stoppingToken)
    {
        task1?.Change(Timeout.Infinite, 0);
        task2?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    /// <summary>
    ///     Callback function used for updating current coordinates of a plane as delegate for post-fetching processing
    /// </summary>
    /// <param name="planes">List of fetched planes</param>
    private async Task Callback_UpdatePlanes(List<Plane> planes)
    {
        using var scope = services.CreateScope();
        var planeService = scope.ServiceProvider.GetRequiredService<PlaneService>();
        await planeService.UpdatePlanes(planes);
    }

    /// <summary>
    ///     Callback function used for updating checkpoints based on current coordinates as delegate for post-fetching processing
    /// </summary>
    /// <param name="planes">List of fetched planes</param>
    private async Task Callback_UpdateCheckpoints(List<Plane> planes)
    {
        using var scope = services.CreateScope();
        var planeService = scope.ServiceProvider.GetRequiredService<PlaneService>();
        await planeService.UpdateCheckpoints(planes);
    }

    /// <summary>
    ///     Used to fetch data from OpenSky Network and process it
    /// </summary>
    /// <param name="state"></param>
    /// <param name="callback">Callback delegate for post-fetching tasks</param>
    private async void FetchPlanes(object? state, FetchCallback callback)
    {
        using (var httpResponseMessage = await SendFetchRequest())
        {
            if (!httpResponseMessage.IsSuccessStatusCode)
            {
                logger.LogWarning("Fetch failed - OpenSkyApi bad response");
                return;
            }

            await using (var contentStream = await httpResponseMessage.Content.ReadAsStreamAsync())
            {
                if (!contentStream.CanRead || contentStream.Length <= 0) return;
                var response = await JsonSerializer.DeserializeAsync<OpenSkyRequest>(contentStream);

                if (response == null)
                {
                    logger.LogWarning("Fetch failed - Response was null");
                    return;
                }

                var recentPlanes = response.ToModelList();

                if (recentPlanes.Count > 0)
                    await callback(recentPlanes);
            }
        }
    }

    /// <summary>
    ///     Sends fetch request for OpenSky network API
    /// </summary>
    /// <returns>Response</returns>
    private async Task<HttpResponseMessage> SendFetchRequest()
    {
        var connectionString = string.Format("https://{0}:{1}@opensky-network.org/api/states/all",
                                             configuration["OpenSkyApi:UserName"],
                                             configuration["OpenSkyApi:Password"]);

        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, connectionString);
        var httpClient = httpClientFactory.CreateClient("OpenSky");

        return await httpClient.SendAsync(httpRequestMessage);
    }

    /// <summary>
    ///     Delegate task to perform after fetching aircraft
    /// </summary>
    private delegate Task FetchCallback(List<Plane> planes);
}