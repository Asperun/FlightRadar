namespace FlightRadar.Models
{
    public class Plane
    {
        public int Id { get; set; }
        public string Icao24 { get; set; }
        public string? CallSign { get; set; }
        public string? OriginCountry { get; set; }
        public int? TimePosition { get; set; }
        public int? LastContact { get; set; }
        public float? Longitude { get; set; }
        public float? Latitude { get; set; }
        public float? BaroAltitude { get; set; }
        public bool? OnGround { get; set; }
        public float? Velocity { get; set; }
        public float? TrueTrack { get; set; }
        public float? VerticalRate { get; set; }
        public float? GeoAltitude { get; set; }
        public string? Squawk { get; set; }
        public bool? Spi { get; set; }
        public byte? PositionSource { get; set; }
    }
}