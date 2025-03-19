using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Entities
{
    public class PlayerScore // for leaderboard
    {
        public Guid GameId { get; set; }
        public Guid UserId { get; set; }
        public int TotalScore { get; set; }

        // Navigation properties
        public Game Game { get; set; } = null!;
        public User Player { get; set; } = null!;
    }
}
