using Microsoft.AspNetCore.SignalR;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Enums;

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
        var updatedGame = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("GameStarted", updatedGame);
    }
    
    public async Task EndGame(string gameCode)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("GameEnded", game);
    }
    
    public async Task SubmitSong(string gameCode, SongDto song)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("SongSubmitted", game, song);
    }
    
    public async Task VoteSong(string gameCode, SongDto song, string userId)
    {
        var game = await _gameService.GetGameByCodeAsync(gameCode);
        await Clients.Group(gameCode).SendAsync("SongVoted", game, song, userId);
    }
    
    // Synchronize round timing across all clients
    public async Task SyncRoundTime(string gameId)
    {
        var game = await _gameService.GetGameByIdAsync(Guid.Parse(gameId));
        var currentRound = game.Rounds.FirstOrDefault(r => r.RoundNumber == game.CurrentRound);

        if (game.Status is not GameStatus.Active)
        {
            await Task.Delay(100);
        }
        
        if (currentRound != null)
        {
            var serverTime = DateTime.UtcNow;
            var roundStartTime = currentRound.StartTime;
            
            var selectionPhaseEndTime = roundStartTime.AddSeconds(game.TimePerRound);
            
            var roundEndTime = selectionPhaseEndTime.AddSeconds(game.Participants.Count * 20);
            
            var totalTimeRemaining = Math.Max(0, (roundEndTime - serverTime).TotalSeconds);
            var selectionTimeRemaining = Math.Max(0, (selectionPhaseEndTime - serverTime).TotalSeconds);
            
            var isInSelectionPhase = serverTime < selectionPhaseEndTime;
            var phase = isInSelectionPhase ? "selection" : "voting";
            
            await Clients.Group(game.Code).SendAsync("RoundTimeSync", 
                new { 
                    ServerTime = serverTime,
                    SelectionPhaseEndTime = selectionPhaseEndTime,
                    RoundEndTime = roundEndTime,
                    TotalTimeRemaining = totalTimeRemaining,
                    SelectionTimeRemaining = selectionTimeRemaining,
                    CurrentPhase = phase
                });
        }
    }
}