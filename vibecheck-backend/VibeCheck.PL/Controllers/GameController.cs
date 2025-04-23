using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Games;

namespace VibeCheck.PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;

        public GameController(IGameService gameService)
        {
            _gameService = gameService;
        }

        [HttpGet("GetGame/{id}")]
        public async Task<IActionResult> GetGame(Guid id)
        {
            try
            {
                var game = await _gameService.GetGameByIdAsync(id);
                return Ok(game);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetGames")]
        public async Task<IActionResult> GetGames()
        {
            try
            {
                var games = await _gameService.GetGamesAsync();
                return Ok(games);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("CreateGame")]
        public async Task<IActionResult> AddGame([FromBody] CreateGameDto game)
        {
            try
            {
                var newGame = await _gameService.CreateGameAsync(game);
                return CreatedAtAction(nameof(GetGame), new { id = newGame.GameId }, newGame);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("UpdateGame/{id}")]
        public async Task<IActionResult> UpdateGame(Guid id, [FromBody] UpdateGameDto gameDto)
        {
            try
            {
                var updatedGame = await _gameService.UpdateGameAsync(id, gameDto);
                return Ok(updatedGame);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteGame/{id}")]
        public async Task<IActionResult> DeleteGame(Guid id)
        {
            try
            {
                var deletedGame = await _gameService.DeleteGameAsync(id);
                return Ok(deletedGame);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {   
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("JoinGame/{gameId}/{userId}")]
        public async Task<IActionResult> JoinGame(Guid gameId, Guid userId)
        {
            try
            {
                var result = await _gameService.JoinGameAsync(gameId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }   
        }

        [HttpPost("LeaveGame/{gameId}/{userId}")]
        public async Task<IActionResult> LeaveGame(Guid gameId, Guid userId)
        {
            try
            {
                var result = await _gameService.LeaveGameAsync(gameId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("RemovePlayer/{gameId}/{playerToRemoveId}")]
        public async Task<IActionResult> RemovePlayerFromGame(Guid gameId, Guid playerToRemoveId)
        {
            try
            {
                // Get the current user ID from the JWT token
                var hostUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var result = await _gameService.RemovePlayerFromGameAsync(gameId, hostUserId, playerToRemoveId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message); // Forbidden
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    }
}