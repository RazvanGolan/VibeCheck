using System.ComponentModel.DataAnnotations;

namespace VibeCheck.DAL.Dtos.Users
{
    public class UpdateUserDto
    {
        [StringLength(50)]
        public string Username { get; set; } = null!;
    }
}
