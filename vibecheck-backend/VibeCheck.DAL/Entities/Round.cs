

namespace VibeCheck.DAL.Entities
{
    public class Round
    {
        public Guid RoundId { get; set; }
        public Guid GameId { get; set; }
        public Guid ThemeId { get; set; }
        public int RoundNumber { get; set; }  
        public int Status { get; set; } // de facut enum dif de game or 0=Submitting, 1=Voting, 2=Completed)
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }


        // Navigation properties
        public Theme Theme { get; set; } = null!;
        public Game Game { get; set; } = null!;
        public ICollection<Song> Songs { get; set; } = null!;

        public ICollection<Vote> Votes { get; set; } = null!;
    }
}
