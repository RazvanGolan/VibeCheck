using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.JsonWebTokens;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Auth;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Repositories;

namespace VibeCheck.BL.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IGameService _gameService;
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper;

    public AuthService(IRepository<User> userRepository, IConfiguration configuration, IMapper mapper, IGameService gameService)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _mapper = mapper;
        _gameService = gameService;
    }
    
    public async Task<AuthResponseDto> LoginAsync(LoginUserDto loginDto)
    {
        var user = new User
        {
            UserId = Guid.NewGuid(),
            Username = loginDto.Username,
            CreatedAt = DateTime.UtcNow
        };
        await _userRepository.AddAsync(user);

        var token = GenerateJwtToken(user);
        
        return new AuthResponseDto
        {
            Token = token,
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<string?> LogoutAsync(Guid userId)
    {
        var result = await _gameService.RemoveUserFromGameAsync(userId);

        if (string.IsNullOrEmpty(result))
        {
            await _userRepository.DeleteByIdAsync(userId);
        }

        return result;
    }

    # region Private Methods
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"] ?? "default_secret_key");
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            ]),
            Expires = DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpirationHours"] ?? "1")),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JsonWebTokenHandler();
        return tokenHandler.CreateToken(tokenDescriptor);
    }
    # endregion
}