namespace FlightRadar.Models
{
    public class Plane : EntityBase
    {
        public string Icao24 { get; set; }
        public string? CallSign { get; set; }
        public string? OriginCountry { get; set; }
        public int? TimePosition { get; set; }
        public int? LastContact { get; set; }
        public double? Longitude { get; set; }
        public double? Latitude { get; set; }
        public double? BaroAltitude { get; set; }
        public bool? OnGround { get; set; }
        public double? Velocity { get; set; }
        public double? TrueTrack { get; set; }
        public double? VerticalRate { get; set; }
        public double? GeoAltitude { get; set; }
        public string? Squawk { get; set; }
        public bool? Spi { get; set; }
        public int? PositionSource { get; set; }
    }
}