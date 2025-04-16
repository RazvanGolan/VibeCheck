using VibeCheck.DAL.Dtos.Users;

namespace VibeCheck.DAL.Dtos.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = null!; // getting rid of nullability warning
    public UserDto User { get; set; } = null!;
}