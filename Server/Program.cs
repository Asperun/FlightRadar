using System.IO.Compression;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Json;
using FlightRadar.Data;
using FlightRadar.Services;
using FlightRadar.Tasks;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");


builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    // options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
});
builder.Services.AddHttpClient<PlanesFetcher>("OpenSky");
builder.Services.AddDbContext<PlaneContext>(x => x.UseSqlServer(connectionString));
builder.Services.AddScoped<PlaneService>();
builder.Services.AddSingleton<PlaneBroadcaster>();

// ====== Swagger ======
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ====== Async Background Tasks ======
builder.Services.AddHostedService<PlanesFetcher>();

// ====== HTTP Protocols ======
builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Listen(IPAddress.Any, 5001, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        // listenOptions.UseHttps();
    });
});

// ====== Compression ======
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    // options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
    options.MimeTypes = new[] { "text/plain", "text/event-stream", "application/json" };
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });


var app = builder.Build();

// ====== HTTP request pipeline ======
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseResponseCompression();
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader().Build());
app.UseAuthorization();
app.UseEndpoints(endpoint => endpoint.MapControllers());


// ====== Migrations ======
var planeCtx = app.Services.CreateScope().ServiceProvider.GetRequiredService<PlaneContext>();

if (planeCtx.Database.GetPendingMigrations().Any())
    planeCtx.Database.Migrate();

planeCtx.Database.EnsureCreated();
app.Run();

/* ################################ IMPORTANT ########################################################################################################
Console.WriteLine(planeCtx.Flights.First().Checkpoints.Count); // Doesnt work because Lists are lazily fetched(has to be accessed in same scope)

Console.WriteLine(planeCtx.Flights.Select(fl => fl.Checkpoints).First().Count); // Works because we specifically select List to be fetched with query.
Console.WriteLine(planeCtx.Planes.Include(p => p.Flights).First()); // Works because we specifically include List to be fetched with query.
Console.WriteLine(planeCtx.Planes.Include(p => p.Flights).ThenInclude(f =>f.Checkpoints).First()); // Works because we specifically chain what has to be fetched with query
####################################################################################################################################################### */