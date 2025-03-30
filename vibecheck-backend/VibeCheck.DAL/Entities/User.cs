

namespace VibeCheck.DAL.Entities
{
    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!; // null! for getting rid of nullable warning
        public DateTime CreatedAt { get; set; } // updating this is user service


        // Navigation properties
        public ICollection<Game> HostedGmaes { get; set; } = null!;
        public ICollection<Song> SubmittedSongs { get; set; } = null!; // maybe baby
        public ICollection<Vote> Votes { get; set; } = null!; // maybe not 
    }
}
