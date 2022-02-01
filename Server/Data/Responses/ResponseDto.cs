namespace FlightRadar.Data.DTO;

/// <summary>
/// Contains all response Data Transfer Objects used in system
/// </summary>
public abstract class ResponseDto
{
    public readonly record struct PlaneListDto(string Icao24, string? CallSign, float Longitude, float Latitude, float TrueTrack);
    public readonly record struct SidePanelStatsDto(int TotalPlanes, int InAir, int ZoneUs, int ZoneEu);

    // public readonly record struct PlaneDetailsDto()
}