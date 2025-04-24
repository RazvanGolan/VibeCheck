using Microsoft.AspNetCore.Mvc;
using VibeCheck.BL.Interfaces;

namespace VibeCheck.PL.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SongController : ControllerBase
{
    private readonly ISongService _service;

    public SongController(ISongService service)
    {
        _service = service;
    }

    [HttpGet("GetBySongName")]
    public async Task<IActionResult> GetBySongName([FromQuery] string songName)
    {
        try
        {
            var response = await _service.GetByName(songName);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("GetById")]
    public async Task<IActionResult> GetById([FromQuery] string songId)
    {
        try
        {
            var response = await _service.GetById(songId);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}