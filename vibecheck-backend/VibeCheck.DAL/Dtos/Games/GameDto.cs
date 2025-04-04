
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
    }
}
