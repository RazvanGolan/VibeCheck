using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VibeCheck.DAL.Dtos.Users;

namespace VibeCheck.BL.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto);
        Task<UserDto> DeleteUserAsync(Guid id);
    }
}
