

namespace VibeCheck.DAL.Entities
{
    public class Vote
    {
        public Guid VoteId { get; set; }
        public Guid RoundId { get; set; } 
        public Guid VoterUserId { get; set; }
        public Guid SongId { get; set; }
        public string DeezerSongId { get; set; } = string.Empty; // Deezer song ID
        public DateTime VotedAt { get; set; }

        // Navigation properties
        public Round Round { get; set; } = null!;
        public User VoterUser { get; set; } = null!;
        public Song Song { get; set; } = null!;
    }
}
