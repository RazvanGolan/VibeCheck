using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Users;

namespace VibeCheck.PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAuthService _authService;

        public UsersController(IUserService userService, IAuthService authService)
        {
            _userService = userService;
            _authService = authService;
        }

        [HttpGet("GetUsers")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("GetUser/{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost("AddUser")]
        public async Task<IActionResult> AddUser([FromBody] CreateUserDto user)
        {
            try
            {
                var newUser = await _userService.CreateUserAsync(user);
                return CreatedAtAction(nameof(GetUser), new { id = newUser.UserId }, newUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);
            return Ok(response);
        }
        
        [HttpPost("Logout")]
        public async Task<IActionResult> Logout([FromBody] Guid userId)
        {
            var gameCode = await _authService.LogoutAsync(userId);
            return Ok(gameCode);
        }

        [Authorize]
        [HttpPut("UpdateUser/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id,[FromBody] UpdateUserDto User)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, User);
                return Ok(updatedUser);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var deletedUser = await _userService.DeleteUserAsync(id);
                return Ok(deletedUser); // or can return NoContent()
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
