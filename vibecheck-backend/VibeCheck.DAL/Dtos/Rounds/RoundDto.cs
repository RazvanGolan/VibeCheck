using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Themes;
using VibeCheck.DAL.Enums;

namespace VibeCheck.DAL.Dtos.Rounds
{
    public class RoundDto
    {
        public Guid RoundId { get; set; }
        public int RoundNumber { get; set; }
        public RoundStatus Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public ThemeDto? Theme { get; set; }
        public List<SongDto> Songs { get; set; } = new List<SongDto>();
    }
}
