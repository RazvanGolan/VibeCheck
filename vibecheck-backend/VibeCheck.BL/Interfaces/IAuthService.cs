using VibeCheck.DAL.Dtos.Auth;
using VibeCheck.DAL.Dtos.Users;

namespace VibeCheck.BL.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginUserDto loginUserDto);
}