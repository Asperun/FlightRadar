using System.Diagnostics;
using System.Text.Json;
using FlightRadar.Data.Comparers;
using FlightRadar.Data.Requests;
using FlightRadar.Models;
using FlightRadar.Services;

namespace FlightRadar.Tasks;

/// <summary>
/// OpenSky Api data fetching and processing class
/// </summary>
public class PlanesFetcher : IHostedService, IDisposable
{
    private readonly IConfiguration configuration;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<PlanesFetcher> logger;
    private readonly IServiceScopeFactory services;

    private Timer task1 = null!;
    private Timer task2 = null!;

    private delegate Task FetchCallback(List<Plane> planes);

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
    
    private async Task Callback_UpdatePlanes(List<Plane> planes)
    {
        logger.LogWarning("Updating Planes");
        using var scope = services.CreateScope();
        var planeService = scope.ServiceProvider.GetRequiredService<PlaneService>();
        await planeService.UpdatePlanes(planes);
        logger.LogWarning("Updated Planes");
    }

    private async Task Callback_UpdateCheckpoints(List<Plane> planes)
    {
        logger.LogWarning("Updating Checkpoints");
        using var scope = services.CreateScope();
        var planeService = scope.ServiceProvider.GetRequiredService<PlaneService>();
        await planeService.UpdateCheckpoints(planes);
        logger.LogWarning("Updated Checkpoints");
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        task1 = new Timer(state => FetchPlanes(state, Callback_UpdatePlanes), null, TimeSpan.Zero
                        , TimeSpan.FromSeconds(int.Parse(configuration["Intervals:FetchInterval"])));
        task2 = new Timer(state => FetchPlanes(state, Callback_UpdateCheckpoints), null, TimeSpan.Zero
                        , TimeSpan.FromSeconds(int.Parse(configuration["Intervals:CheckpointsInterval"])));
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        task1?.Change(Timeout.Infinite, 0);
        task2?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    private async void FetchPlanes(object? state, FetchCallback callback)
    {
        using var httpResponseMessage = await SendFetchRequest();
        if (!httpResponseMessage.IsSuccessStatusCode)
        {
            logger.LogWarning("Fetch failed - OpenSkyApi bad response");
            return;
        }

        await using var contentStream = await httpResponseMessage.Content.ReadAsStreamAsync();

        var response = await JsonSerializer.DeserializeAsync<OpenSkyRequest>(contentStream);

        if (response == null)
        {
            logger.LogWarning("Fetch failed - Response was null");
            return;
        }
        var recentPlanes = response.ToModelList();
        
        await callback(recentPlanes);
    }

    private async Task<HttpResponseMessage> SendFetchRequest()
    {
        var connectionString = string.Format("https://{0}:{1}@opensky-network.org/api/states/all",
                                             configuration["OpenSkyApi:UserName"],
                                             configuration["OpenSkyApi:Password"]);

        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, connectionString);
        var httpClient = httpClientFactory.CreateClient("OpenSky");

        return await httpClient.SendAsync(httpRequestMessage);
    }
}