

namespace VibeCheck.DAL.Entities
{
    public class Game
    {
        public Guid GameId { get; set; }

        public string Code { get; set; } = null!;

        public Guid HostUserId { get; set; } 

        public int Status { get; set; } // enum poate sau (0-waiting, 1-active, 2-finished)

        public DateTime CreatedAt { get; set; }

        // Navigation properties

        public User HostUser { get; set; } = null!;
        
        public ICollection<Round> Rounds { get; set; } = null!;

        public ICollection<PlayerScore> Leaderboard { get; set; } = null!;
    }
}
