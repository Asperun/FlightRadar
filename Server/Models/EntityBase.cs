using System;

namespace FlightRadar.Models
{
    public abstract class EntityBase
    {
        // [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? Inserted { get; set; }

        // [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? LastUpdated { get; set; }
    }
}