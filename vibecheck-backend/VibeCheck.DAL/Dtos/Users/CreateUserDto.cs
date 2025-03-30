using System.ComponentModel.DataAnnotations;

namespace VibeCheck.DAL.Dtos.Users
{
    public class CreateUserDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = null!;
    }
}
