using VibeCheck.DAL.Dtos.Rounds;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Enums;

namespace VibeCheck.DAL.Dtos.Games
{
    public class GameDto
    {
        public Guid GameId { get; set; }
        public string Code { get; set; } = null!;
        public Guid HostUserId { get; set; }
        public GameStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // New properties
        public int CurrentRound { get; set; } = 1;
        public int TotalRounds { get; set; }
        public int PlayersLimit { get; set; }
        public int TimePerRound { get; set; }
        public PrivacyType Privacy { get; set; }
        public GameMode Mode { get; set; }
        public List<string> SelectedThemeCategories { get; set; } = new();
        public List<string> CustomThemes { get; set; } = new();

        public List<UserDto> Participants { get; set; } = new();

        public List<RoundDto> Rounds { get; set; } = new List<RoundDto>();
    }
}
