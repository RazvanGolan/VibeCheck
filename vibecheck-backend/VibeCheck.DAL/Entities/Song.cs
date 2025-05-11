namespace VibeCheck.DAL.Entities
{
    public class Song
    {
        public Guid SongId { get; set; }
        public string DeezerId { get; set; } // Deezer song ID
        public Guid RoundId { get; set; } 
        public string SongTitle { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty; 
        public DateTime SubmittedAt { get; set; }

        // New properties from frontend
        public string? AlbumName { get; set; }
        public string? AlbumCoverSmall { get; set; }
        public string? AlbumCoverBig { get; set; }
        public string? PreviewUrl { get; set; }
        
        // Navigation properties
        public Round Round { get; set; } = null!;
        public List<User> Users { get; set; } = null!;
        public ICollection<Vote> Votes { get; set; } = null!; // changed in num of votes or delete
    }
}
