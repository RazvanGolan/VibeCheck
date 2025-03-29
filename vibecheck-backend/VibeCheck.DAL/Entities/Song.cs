

namespace VibeCheck.DAL.Entities
{
    public class Song
    {
        public Guid SongId { get; set; }
        public Guid RoundId { get; set; } 
        public Guid UserId { get; set; } 
        public string SongTitle { get; set; } = null!;  
        public string Artist { get; set; } = null!;
        public string SpotifyUri { get; set; } = null!;
        public DateTime SubmittedAt { get; set; }

        // Navigation properties
        public Round Round { get; set; } = null!;
        public User User { get; set; } = null!;
        public ICollection<Vote> Votes { get; set; } = null!; // changed in num of votes or delete
    }
}
