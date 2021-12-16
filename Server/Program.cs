using System.IO.Compression;
using System.Net;
using FlightRadar.Data;
using FlightRadar.Services;
using FlightRadar.Tasks;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;

// Builder
var builder = WebApplication.CreateBuilder(args);

// Database string
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var connectionString = builder.Configuration.GetConnectionString("AzureConnection");

// ===== Services ======
builder.Services.AddControllers();
builder.Services.AddHttpClient<PlanesFetcher>("OpenSky");
builder.Services.AddDbContext<PlaneContext>(x => x.UseSqlServer(connectionString));
builder.Services.AddScoped<PlaneService>();
builder.Services.AddSingleton<PlaneBroadcaster>();

// ====== Swagger ======
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==== Async Background ====
builder.Services.AddHostedService<PlanesFetcher>();

// === HTTP Protocols =====
builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Listen(IPAddress.Any, 5001, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        listenOptions.UseHttps();
    });
});

// ==== Compression ====
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    // options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
    options.MimeTypes = new[] { "text/plain", "text/event-stream" };
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });

// ------------------------------------------------------------
var app = builder.Build();


app.UseCors(builder => builder
                       .AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseResponseCompression();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(endpoint => endpoint.MapControllers());


// DB context
// var planeCtx = app.Services.CreateScope().ServiceProvider.GetRequiredService<PlaneContext>();

// DB initialize
// DbInitializer.InitPlanes(planeCtx);

app.Run();