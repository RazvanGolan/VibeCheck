﻿using VibeCheck.DAL.Dtos.Games;

namespace VibeCheck.BL.Interfaces
{
    public interface IGameService
    {
        Task<GameDto> CreateGameAsync(CreateGameDto createGameDto);

        Task<IEnumerable<GameDto>> GetGamesAsync();

        Task<GameDto> GetGameByIdAsync(Guid id);

        Task<GameDto> UpdateGameAsync(Guid id, UpdateGameDto updateGameDto);

        Task<GameDto> DeleteGameAsync(Guid id);

        Task<GameDto> JoinGameAsync(Guid gameId, Guid userId);

        Task<GameDto> LeaveGameAsync(Guid gameId, Guid userId);
    }
}
