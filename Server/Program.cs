using System.Net;
using System.Text.Json;
using FlightRadar.Data;
using FlightRadar.Services;
using FlightRadar.Tasks;
using FlightRadar.Util;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

Globals.ConnectionString = builder.Environment.IsDevelopment()
                               ? builder.Configuration.GetConnectionString("DevDb")
                               : builder.Configuration.GetConnectionString("Postgres");

builder.Services.AddControllers().AddJsonOptions(options => { options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; });
builder.Services.AddHttpClient<PlanesFetcher>("OpenSky");
builder.Services.AddDbContextPool<PlaneContext>(opt => opt.UseNpgsql(Globals.ConnectionString));
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddScoped<PlaneService>();
builder.Services.AddSingleton<PlaneBroadcaster>();

// ====== Swagger ======
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

// ====== Async Background Tasks ======
builder.Services.AddHostedService<PlanesFetcher>();

// ====== HTTP Protocols ======
builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Listen(IPAddress.Any, 5001, listenOptions => { listenOptions.Protocols = HttpProtocols.Http1AndHttp2; });
});

// ====== Compression ======
// builder.Services.AddResponseCompression(options =>
// {
//     // options.EnableForHttps = true;
//     options.Providers.Add<BrotliCompressionProvider>();
//     options.Providers.Add<GzipCompressionProvider>();
//     options.MimeTypes = new[] { "text/plain", "text/event-stream", "application/json" };
// });
//
// builder.Services.Configure<BrotliCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });
// builder.Services.Configure<GzipCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });

var app = builder.Build();

// ====== HTTP request pipeline ======
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// app.UseResponseCompression();
app.UseRouting();
app.UseAuthentication();
app.UseCors(b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader().Build());
app.UseAuthorization();
app.UseEndpoints(endpoint => endpoint.MapControllers());

// ====== Migrations ======
var planeCtx = app.Services.CreateScope().ServiceProvider.GetRequiredService<PlaneContext>();
planeCtx.Database.EnsureCreated();

app.Run();