using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Dtos.Users
{
    public class CreateUserDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = null!;
    }
}
