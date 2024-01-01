using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FlightRadar.Data.Requests;
using FlightRadar.Models;
using FlightRadar.Services;
using Microsoft.VisualBasic;

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

    private const string apiUrl = "https://opensky-network.org/api/states/all";

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
    /// <param name="attempts">Maximum amount of retries if request timeouts</param>
    private async void FetchPlanes(object? state, FetchCallback callback, byte attempts=3)
    {
        try
        {
            using var httpResponseMessage = await SendFetchRequest();
            if (!httpResponseMessage.IsSuccessStatusCode)
            {
                logger.LogWarning("Fetch failed - OpenSkyApi bad response");
                return;
            }

            await using var contentStream = await httpResponseMessage.Content.ReadAsStreamAsync();
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
        catch (TaskCanceledException e)
        {
            if (attempts > 0)
            {
                logger.LogError("Request timed out");
                FetchPlanes(state, callback, --attempts);
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Fetch failed");
        }
    }

    /// <summary>
    ///     Sends fetch request for OpenSky network API
    /// </summary>
    /// <returns>Response</returns>
    private async Task<HttpResponseMessage> SendFetchRequest()
    {
        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, apiUrl);
        var httpClient = httpClientFactory.CreateClient("OpenSky");

        httpClient.Timeout = TimeSpan.FromSeconds(2);
        httpClient.DefaultRequestVersion = new Version(2, 0);
        httpClient.MaxResponseContentBufferSize = 8_000_000;
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        httpClient.DefaultRequestHeaders.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
                                                                                       Convert.ToBase64String(Encoding.ASCII
                                                                                           .GetBytes($"{configuration["OpenSkyApi:UserName"]}:{configuration["OpenSkyApi:Password"]}")));
        return await httpClient.SendAsync(httpRequestMessage);
    }

    /// <summary>
    ///     Delegate task to perform after fetching aircraft
    /// </summary>
    private delegate Task FetchCallback(List<Plane> planes);
}