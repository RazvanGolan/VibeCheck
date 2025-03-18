using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Entities
{
    public class Game
    {
        public Guid GameId { get; set; }

        public string Code { get; set; } = null!;

        public Guid HostUserId { get; set; }

        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties

        public User HostUser { get; set; } = null!;
        public ICollection<Round> Rounds { get; set; } = null!;
    }
}
