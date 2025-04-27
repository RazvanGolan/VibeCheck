using VibeCheck.DAL.Dtos.Songs;

namespace VibeCheck.DAL.Dtos.Leaderboard
{
    public class LeaderboardResultDto
    {
        public Guid GameId { get; set; }
        public int RoundNumber { get; set; }
        public List<PlayerScoreDto> Leaderboard { get; set; } = new List<PlayerScoreDto>();
        public SongDto? WinningSong { get; set; }
    }
}
