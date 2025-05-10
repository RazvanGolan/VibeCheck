
namespace VibeCheck.DAL.Dtos.Leaderboard
{
    public class PlayerScoreDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalScore { get; set; }
    }
}
