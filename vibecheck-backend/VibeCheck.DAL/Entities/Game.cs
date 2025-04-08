using VibeCheck.DAL.Enums;

namespace VibeCheck.DAL.Entities
{
    public class Game
    {
        public Guid GameId { get; set; }

        public string Code { get; set; } = null!;

        public Guid HostUserId { get; set; } 

        public GameStatus Status { get; set; } 

        public DateTime CreatedAt { get; set; }

        public int Rounds { get; set; }
        public int PlayersLimit { get; set; }
        public int TimePerRound { get; set; }
        public string Privacy { get; set; } = null!;
        public GameMode Mode { get; set; }
        public List<string> SelectedThemeCategories { get; set; } = new();
        public List<string> CustomThemes { get; set; } = new();

        // Navigation properties

        public ICollection<User> Participants { get; set; } = new List<User>();
        public User HostUser { get; set; } = null!;
        public ICollection<Round> RoundsList { get; set; } = null!; 
        public ICollection<PlayerScore> Leaderboard { get; set; } = null!;
    }
}
