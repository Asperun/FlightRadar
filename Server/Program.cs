using FlightRadar.Data;
using FlightRadar.Services;
using FlightRadar.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// Builder
var builder = WebApplication.CreateBuilder(args);

// Database string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

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


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(endpoint => endpoint.MapControllers());

// DB context
var planeCtx = app.Services.CreateScope().ServiceProvider.GetRequiredService<PlaneContext>();

// DB initialize
DbInitializer.InitPlanes(planeCtx);

app.Run();