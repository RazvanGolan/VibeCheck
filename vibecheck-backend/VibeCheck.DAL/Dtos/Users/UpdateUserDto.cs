using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VibeCheck.DAL.Dtos.Users
{
    public class UpdateUserDto
    {
        [StringLength(50)]
        public string Username { get; set; } = null!;

        [EmailAddress]
        public string Email { get; set; } = null!;
    }
}
