using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Entities
{
    public class Round
    {
        public Guid RoundId { get; set; }
        public Guid GameId { get; set; }
        public string Theme { get; set; } = null!;
        public int RoundNumber { get; set; } 
        public int Status { get; set; }
        public DateTime StartTime { get; set; }

        // Navigation properties
        public Game Game { get; set; } = null!;
        public ICollection<Song> Songs { get; set; } = null!;

        public ICollection<Vote> Votes { get; set; } = null!;
    }
}
