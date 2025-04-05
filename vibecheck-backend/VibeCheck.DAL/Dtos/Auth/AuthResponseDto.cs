using VibeCheck.DAL.Dtos.Users;

namespace VibeCheck.DAL.Dtos.Auth;

public class AuthResponseDto
{
    public string Token { get; set; }
    public UserDto User { get; set; }
}