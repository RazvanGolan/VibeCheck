
using System.ComponentModel.DataAnnotations;

namespace VibeCheck.DAL.Dtos.Games
{
    public class CreateGameDto
    {
        [Required]
        public string Code { get; set; } = null!;
        [Required]
        public Guid HostUserId { get; set; }
    }
}
