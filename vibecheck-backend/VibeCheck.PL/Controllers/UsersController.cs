using Microsoft.AspNetCore.Mvc;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Entities;

namespace VibeCheck.PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
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
        public async Task<IActionResult> AddUser(CreateUserDto user)
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

        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto User)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, User);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var deletedUser = await _userService.DeleteUserAsync(id);
                return Ok(deletedUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
