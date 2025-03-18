using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Entities
{
    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!; // null! for getting rid of nullable warning
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Navigation properties

        public ICollection<Game> HostedGmaes { get; set; } = null!;
        public ICollection<Song> SubmittedSongs { get; set; } = null!;
        public ICollection<Vote> Votes { get; set; } = null!;
    }
}
