using Microsoft.AspNetCore.Mvc;
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
            var game = await _gameService.GetGameByIdAsync(id);
            if (game == null)
            {
                return NotFound();
            }
            return Ok(game);
        }

        [HttpGet("GetGames")]
        public async Task<IActionResult> GetGames()
        {
            var games = await _gameService.GetGamesAsync();
            return Ok(games);
        }

        [HttpPost("AddGame")]
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
            catch
            {
                return StatusCode(500, "An unexpected error occured");
            }
        }

        [HttpPut("UpdateGame/{id}")]
        public async Task<IActionResult> UpdateGame(Guid id, [FromBody] UpdateGameDto game)
        {
            try
            {
                var updatedGame = await _gameService.UpdateGameAsync(id, game);
                return Ok(updatedGame);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
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
        }
    }
}
