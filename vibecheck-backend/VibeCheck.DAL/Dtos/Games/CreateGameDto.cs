
using System.ComponentModel.DataAnnotations;

namespace VibeCheck.DAL.Dtos.Games
{
    public class CreateGameDto
    {
        [Required]
        [MaxLength(6)]
        public string Code { get; set; } = null!;
        [Required]
        public Guid HostUserId { get; set; }
    }
}
