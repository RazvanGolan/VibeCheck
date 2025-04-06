using AutoMapper;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;
using VibeCheck.DAL.Repositories;

namespace VibeCheck.BL.Services
{
    public class GameService : IGameService
    {
        private readonly IRepository<Game> _gameRepository;
        private readonly IMapper _mapper;

        public GameService(IRepository<Game> gameRepository, IMapper mapper)
        {
            _gameRepository = gameRepository;
            _mapper = mapper;
        }

        public async Task<GameDto> CreateGameAsync(CreateGameDto createGameDto)
        {
            // Check if a game with the same code already exists
            var existingGame = await _gameRepository.GetAllAsync();
            if (existingGame.Any(g => g.Code == createGameDto.Code))
            {
                throw new InvalidOperationException("A game with the same code already exists.");
            }

            // the length of the code is checked in the CreateGameDto with [MaxLength(6)] attribute

            var game = _mapper.Map<Game>(createGameDto);
            game.Status = (int)GameStatus.Waiting; // default status is waiting for players
            game.CreatedAt = DateTime.UtcNow;

            var createdGame = await _gameRepository.AddAsync(game);
            return _mapper.Map<GameDto>(createdGame);
        }

        public async Task<IEnumerable<GameDto>> GetGamesAsync()
        {
            var games = await _gameRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<GameDto>>(games);
        }

        public async Task<GameDto> GetGameByIdAsync(Guid id)
        {
            var game = await _gameRepository.GetByIdAsync(id);
            return _mapper.Map<GameDto>(game);
        }

        public async Task<GameDto> UpdateGameAsync(Guid id, UpdateGameDto updateGameDto)
        {
            var game = await _gameRepository.GetByIdAsync(id);
            if (game == null)
            {
                throw new KeyNotFoundException($"Game with id {id} not found");
            }
            if (!Enum.IsDefined(typeof(GameStatus), updateGameDto.Status))
            {
                throw new InvalidOperationException("Invalid game status, status must be: Waiting(0), Active(1), or Finished(2)");
            }

            game.Status = (int)updateGameDto.Status; // or game = _mapper.Map(updateGameDto, game);
            var updatedGame = await _gameRepository.UpdateAsync(game);
            return _mapper.Map<GameDto>(updatedGame);
        }

        public async Task<GameDto> DeleteGameAsync(Guid id)
        {
            var game = await _gameRepository.GetByIdAsync(id);
            if (game == null)
            {
                throw new KeyNotFoundException($"Game with id {id} not found");
            }
            await _gameRepository.DeleteByIdAsync(id);
            return _mapper.Map<GameDto>(game);
        }
    }
}
