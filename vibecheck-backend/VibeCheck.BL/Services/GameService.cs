using AutoMapper;
using Microsoft.EntityFrameworkCore;
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
        private readonly IRepository<User> _userRepository;
        private readonly IMapper _mapper;
        private readonly Random _random = new();

        public GameService(IRepository<Game> gameRepository, IRepository<User> userRepository, IMapper mapper)
        {
            _gameRepository = gameRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<GameDto> CreateGameAsync(CreateGameDto createGameDto)
        {
            var hostUser = await _userRepository.GetByIdAsync(createGameDto.HostUserId)
                ?? throw new InvalidOperationException("Host user not found");

            var game = _mapper.Map<Game>(createGameDto);
            game.Code = GenerateUniqueCode();
            game.Status = GameStatus.Waiting;
            game.CreatedAt = DateTime.UtcNow;
            game.Participants = new List<User> { hostUser };

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
            var game = await _gameRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Game with id {id} not found");

            return _mapper.Map<GameDto>(game);
        }

        public async Task<GameDto> UpdateGameAsync(Guid id, UpdateGameDto updateGameDto)
        {
            var game = await _gameRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Game with id {id} not found");

            ValidateUpdateDto(updateGameDto);
            _mapper.Map(updateGameDto, game);

            var updatedGame = await _gameRepository.UpdateAsync(game);
            return _mapper.Map<GameDto>(updatedGame);
        }

        public async Task<GameDto> DeleteGameAsync(Guid id)
        {
            var game = await _gameRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException($"Game with id {id} not found");
            await _gameRepository.DeleteByIdAsync(id);
            return _mapper.Map<GameDto>(game);
        }

        public async Task<GameDto> JoinGameAsync(Guid gameId, Guid userId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId)
                ?? throw new KeyNotFoundException($"Game with id {gameId} not found");
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new InvalidOperationException("User not found");

            ValidateJoinGame(game, user);

            game.Participants.Add(user);
            await _gameRepository.UpdateAsync(game);

            return _mapper.Map<GameDto>(game);
        }

        public async Task<GameDto> LeaveGameAsync(Guid gameId, Guid userId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId) ?? throw new KeyNotFoundException($"Game with id {gameId} not found");
            var user = game.Participants.FirstOrDefault(u => u.UserId == userId)
                ?? throw new InvalidOperationException("User not in game");

            ValidateLeaveGame(game);

            var wasHost = game.HostUserId == user.UserId; //true if the user is the host
            game.Participants.Remove(user);

            if(wasHost && game.Participants.Count > 0)
            {
                // we transfer host to the first participant
                game.HostUserId = game.Participants.First().UserId;
            }

            if(game.Participants.Count == 0)
            {
                await _gameRepository.DeleteByIdAsync(gameId);
            }
            else
            {
                await _gameRepository.UpdateAsync(game);
            }

            return _mapper.Map<GameDto>(game);
        }

        #region Private Methods

        private string GenerateUniqueCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            string code;

            do
            {
                code = new string(Enumerable.Repeat(chars, 6)
                    .Select(s => s[_random.Next(s.Length)]).ToArray());
            } while (_gameRepository.GetAllAsync().Result.Any(g => g.Code == code)); // generate random code until unique

            return code;
        }

        private void ValidateUpdateDto(UpdateGameDto dto)
        {
            if (!Enum.IsDefined(typeof(GameStatus), dto.Status))
                throw new InvalidOperationException("Invalid game status");

            if (dto.PlayersLimit is < 2 or > 16)
                throw new InvalidOperationException("Players limit must be between 2-16");

            if (dto.TimePerRound is < 15 or > 180)
                throw new InvalidOperationException("Time per round must be between 15-180 seconds");
        }

        private void ValidateJoinGame(Game game, User user)
        {
            if (game.Status != GameStatus.Waiting)
                throw new InvalidOperationException("Game is not accepting new players");

            if (game.Participants.Count >= game.PlayersLimit)
                throw new InvalidOperationException("Game is full");

            if (game.Participants.Any(p => p.UserId == user.UserId))
                throw new InvalidOperationException("User already in game");
        }

        private void ValidateLeaveGame(Game game)
        {
            if (game.Status == GameStatus.Finished)
                throw new InvalidOperationException("Cannot leave finished game");
        }

        #endregion
    }
}