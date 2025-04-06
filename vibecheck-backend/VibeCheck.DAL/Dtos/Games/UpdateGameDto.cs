
using System.ComponentModel.DataAnnotations;
using VibeCheck.DAL.Enums;

namespace VibeCheck.DAL.Dtos.Games
{
    public class UpdateGameDto
    {
        [Required]
        public GameStatus Status { get; set; }
    }
}
