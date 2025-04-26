using Microsoft.AspNetCore.SignalR;
using VibeCheck.BL.Interfaces;

namespace VibeCheck.PL.Hubs;

public class GameHub : Hub
{
    private readonly IGameService _gameService;

    public GameHub(IGameService gameService)
    {
        _gameService = gameService;
    }
    
    public async Task JoinGame(string gameCode, Guid userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
        
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        
        await Clients.Group(gameCode).SendAsync("PlayerJoined", game.Participants);
    }
    
    public async Task LeaveGame(string gameCode, Guid userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameCode);
    
        var game = await _gameService.GetGameByCodeAsync(gameCode);
    
        await Clients.Group(gameCode).SendAsync("PlayerLeft", game.Participants);
    }
    
    public async Task UpdateGame(string gameCode, string gameState)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("GameUpdated", game);
    }
    
    public async Task StartGame(string gameCode)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("GameStarted", game);
    }
    
    public async Task EndGame(string gameCode)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("GameEnded", game);
    }
    
    // TODO: implement song submission and voting logic
    public async Task SubmitSong(string gameCode, string song)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("SongSubmitted", game);
    }
    
    public async Task VoteSong(string gameCode, string song)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("SongVoted", game);
    }
}