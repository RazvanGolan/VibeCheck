using AutoMapper;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Dtos.Leaderboard;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Themes;
using VibeCheck.DAL.Dtos.Votes;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;
using VibeCheck.DAL.Repositories;

namespace VibeCheck.BL.Services
{
    public class GameService : IGameService
    {
        private readonly IGameRepository _gameRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Theme> _themeRepository;
        private readonly IRepository<Round> _roundRepository;
        private readonly IRepository<Song> _songRepository;
        private readonly IRepository<Vote> _voteRepository;
        private readonly IRepository<PlayerScore> _playerScoreRepository;
        private readonly IMapper _mapper;
        private readonly Random _random = new();

        public GameService(
            IGameRepository gameRepository,
            IRepository<User> userRepository,
            IRepository<Theme> themeRepository,
            IRepository<Round> roundRepository,
            IRepository<Song> songRepository,
            IRepository<Vote> voteRepository,
            IRepository<PlayerScore> playerScoreRepository,
            IMapper mapper)
        {
            _gameRepository = gameRepository;
            _userRepository = userRepository;
            _themeRepository = themeRepository;
            _roundRepository = roundRepository;
            _songRepository = songRepository;
            _voteRepository = voteRepository;
            _playerScoreRepository = playerScoreRepository;
            _mapper = mapper;
        }

        public async Task<GameDto> CreateGameAsync(CreateGameDto createGameDto)
        {
            var hostUser = await _userRepository.GetByIdAsync(createGameDto.HostUserId)
                ?? throw new InvalidOperationException("Host user not found");

            var game = _mapper.Map<Game>(createGameDto);
            game.GameId = Guid.NewGuid();
            game.Code = GenerateUniqueCode();
            game.Status = GameStatus.Waiting;
            game.CreatedAt = DateTime.UtcNow;
            game.Participants = new List<User> { hostUser };
            game.CurrentRound = 1; // Set initial round to 1
            game.RoundsList = new List<Round>(); // Initialize rounds list

            // Get theme for first round (random or from custom themes)
            Theme theme;
            if (game.CustomThemes.Any())
            {
                // Use first custom theme
                theme = await GetOrCreateThemeAsync(game.CustomThemes.First());
            }
            else
            {
                // Use random theme
                theme = await GetRandomThemeAsync(game.SelectedThemeCategories);
            }

            // Create first round
            var firstRound = new Round
            {
                RoundId = Guid.NewGuid(),
                GameId = game.GameId,
                ThemeId = theme.ThemeId,
                RoundNumber = 1,
                Status = RoundStatus.Submitting,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddSeconds(game.TimePerRound)
            };

            game.RoundsList.Add(firstRound);

            var createdGame = await _gameRepository.AddAsync(game);
            var gameDto = _mapper.Map<GameDto>(createdGame);

            // Include first round theme in the response
            if (gameDto.Rounds.Any())
            {
                gameDto.Rounds.First().Theme = _mapper.Map<ThemeDto>(theme);
            }

            return gameDto;
        }

        public async Task<IEnumerable<GameDto>> GetGamesAsync()
        {
            var games = await _gameRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<GameDto>>(games);
        }

        public async Task<GameDto> GetGameByIdAsync(Guid id)
        {
            var game = await _gameRepository.GetByIdWithDetailsAsync(id)
                ?? throw new KeyNotFoundException($"Game with id {id} not found");

            return _mapper.Map<GameDto>(game);
        }

        public async Task<GameDto> GetGameByCodeAsync(string gameCode)
        {
            var game = await _gameRepository.GetByCodeAsync(gameCode)
                ?? throw new KeyNotFoundException($"Game with code {gameCode} not found");

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

        public async Task<GameDto> JoinGameAsync(string gameCode, Guid userId)
        {
            var game = await _gameRepository.GetByCodeAsync(gameCode)
                ?? throw new KeyNotFoundException($"Game with code {gameCode} not found");
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

            if (wasHost && game.Participants.Count > 0)
            {
                // we transfer host to the first participant
                game.HostUserId = game.Participants.First().UserId;
            }

            if (game.Participants.Count == 0)
            {
                await _gameRepository.DeleteByIdAsync(gameId);
            }
            else
            {
                await _gameRepository.UpdateAsync(game);
            }

            return _mapper.Map<GameDto>(game);
        }

<<<<<<< HEAD
        public async Task<GameDto> RemovePlayerFromGameAsync(Guid gameId, Guid hostUserId, Guid playerToRemoveId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId)
                ?? throw new KeyNotFoundException($"Game with id {gameId} not found");

            // Validate host identity
            if (game.HostUserId != hostUserId)
                throw new UnauthorizedAccessException("Only the host can remove players from the game");

            // Check if player is in the game
            var playerToRemove = game.Participants.FirstOrDefault(p => p.UserId == playerToRemoveId)
                ?? throw new InvalidOperationException("Player is not in this game");

            // Check if trying to remove themselves (should use LeaveGame instead)
            if (hostUserId == playerToRemoveId)
                throw new InvalidOperationException("Host cannot remove themselves, use LeaveGame instead");

            // Can't remove players from finished games
            if (game.Status == GameStatus.Finished)
                throw new InvalidOperationException("Cannot remove players from finished games");

            // Remove the player
            game.Participants.Remove(playerToRemove);
            await _gameRepository.UpdateAsync(game);

            return _mapper.Map<GameDto>(game);
        }

        //////////////////////////////////////////////////

        // Submit song implementation
        public async Task<SongDto> SubmitSongAsync(SubmitSongDto songDto)
        {
            // Get the game with rounds
            var game = await _gameRepository.GetByIdWithDetailsAsync(songDto.GameId)
                ?? throw new KeyNotFoundException($"Game with id {songDto.GameId} not found");

            // Get current round
            var currentRound = game.RoundsList.FirstOrDefault(r => r.RoundNumber == game.CurrentRound)
                ?? throw new KeyNotFoundException("Current round not found");

            // Check if user already submitted a song for this round
            var existingSongs = await _songRepository.GetAllAsync();
            var existingSong = existingSongs.FirstOrDefault(s =>
                s.RoundId == currentRound.RoundId && s.UserId == songDto.UserId);

            if (existingSong != null)
            {
                throw new InvalidOperationException("You have already submitted a song for this round");
            }

            // Check if user is part of the game
            if (!game.Participants.Any(p => p.UserId == songDto.UserId))
            {
                throw new InvalidOperationException("User is not a participant in this game");
            }

            // Create new song
            var song = new Song
            {
                SongId = Guid.NewGuid(),
                RoundId = currentRound.RoundId,
                UserId = songDto.UserId,
                SongTitle = songDto.Title,
                Artist = songDto.Artist,
                SpotifyUri = songDto.SpotifyUri,
                AlbumName = songDto.AlbumName,
                AlbumCoverSmall = songDto.AlbumCoverSmall,
                AlbumCoverBig = songDto.AlbumCoverBig,
                PreviewUrl = songDto.PreviewUrl,
                SubmittedAt = DateTime.UtcNow
            };

            await _songRepository.AddAsync(song);

            // Get user info for response
            var user = await _userRepository.GetByIdAsync(songDto.UserId);

            var songResponse = _mapper.Map<SongDto>(song);
            songResponse.UserName = user?.Username ?? "Unknown User";
            songResponse.VoteCount = 0;

            return songResponse;
        }

        // Vote for song implementation
        public async Task<bool> VoteForSongAsync(VoteDto voteDto)
        {
            // Get the game
            var game = await _gameRepository.GetByIdWithDetailsAsync(voteDto.GameId)
                ?? throw new KeyNotFoundException($"Game with id {voteDto.GameId} not found");

            // Get current round
            var currentRound = game.RoundsList.FirstOrDefault(r => r.RoundNumber == game.CurrentRound)
                ?? throw new KeyNotFoundException("Current round not found");

            // Check if song exists and belongs to current round
            var song = await _songRepository.GetByIdAsync(voteDto.SongId);

            if (song == null || song.RoundId != currentRound.RoundId)
            {
                throw new KeyNotFoundException("Song not found in current round");
            }

            // Check if user is part of the game
            if (!game.Participants.Any(p => p.UserId == voteDto.VoterUserId))
            {
                throw new InvalidOperationException("User is not a participant in this game");
            }

            // Check if user already voted in this round
            var votes = await _voteRepository.GetAllAsync();
            var existingVote = votes.FirstOrDefault(v =>
                v.RoundId == currentRound.RoundId && v.VoterUserId == voteDto.VoterUserId);

            if (existingVote != null)
            {
                throw new InvalidOperationException("You have already voted in this round");
            }

            // Prevent voting for own song
            if (song.UserId == voteDto.VoterUserId)
            {
                throw new InvalidOperationException("You cannot vote for your own song");
            }

            // Create vote
            var vote = new Vote
            {
                VoteId = Guid.NewGuid(),
                RoundId = currentRound.RoundId,
                SongId = voteDto.SongId,
                VoterUserId = voteDto.VoterUserId,
                VotedAt = DateTime.UtcNow
            };

            await _voteRepository.AddAsync(vote);
            return true;
        }

        // Get leaderboard and advance round implementation
        public async Task<LeaderboardResultDto> GetLeaderboardAndAdvanceRoundAsync(Guid gameId)
        {
            // Get game with all details
            var game = await _gameRepository.GetByIdWithDetailsAsync(gameId)
                ?? throw new KeyNotFoundException($"Game with id {gameId} not found");

            // Get current round
            var currentRound = game.RoundsList.FirstOrDefault(r => r.RoundNumber == game.CurrentRound)
                ?? throw new KeyNotFoundException("Current round not found");

            // Get all songs for the current round with their votes
            var songs = (await _songRepository.GetAllAsync())
                .Where(s => s.RoundId == currentRound.RoundId);

            var songsWithVotes = new List<(Song Song, int VoteCount)>();
            var allVotes = await _voteRepository.GetAllAsync();

            foreach (var song in songs)
            {
                var voteCount = allVotes.Count(v => v.SongId == song.SongId);
                songsWithVotes.Add((song, voteCount));
            }

            // Find winning song
            var sortedSongs = songsWithVotes.OrderByDescending(s => s.VoteCount).ToList();
            var winningSong = sortedSongs.FirstOrDefault();
            SongDto? winningSongDto = null;

            if (winningSong.Song != null && sortedSongs.Any())
            {
                var user = await _userRepository.GetByIdAsync(winningSong.Song.UserId);
                winningSongDto = _mapper.Map<SongDto>(winningSong.Song);
                winningSongDto.UserName = user?.Username ?? "Unknown User";
                winningSongDto.VoteCount = winningSong.VoteCount;

                // Update player score
                var playerScores = await _playerScoreRepository.GetAllAsync();
                var playerScore = playerScores.FirstOrDefault(ps =>
                    ps.GameId == gameId && ps.UserId == winningSong.Song.UserId);

                if (playerScore != null)
                {
                    playerScore.TotalScore += 1;
                    await _playerScoreRepository.UpdateAsync(playerScore);
                }
                else
                {
                    await _playerScoreRepository.AddAsync(new PlayerScore
                    {
                        PlayerScoreId = Guid.NewGuid(),
                        GameId = gameId,
                        UserId = winningSong.Song.UserId,
                        TotalScore = 1
                    });
                }
            }

            // Complete current round
            currentRound.Status = RoundStatus.Completed;
            await _roundRepository.UpdateAsync(currentRound);

            // Advance to next round if not the last
            if (game.CurrentRound < game.TotalRounds) // Changed from game.Rounds to game.TotalRounds
            {
                game.CurrentRound++;

                // Create next round if it doesn't exist
                var nextRound = game.RoundsList.FirstOrDefault(r => r.RoundNumber == game.CurrentRound);
                if (nextRound == null)
                {
                    // Determine theme for next round
                    Theme theme;
                    if (game.CustomThemes.Count >= game.CurrentRound)
                    {
                        // Use custom theme if available for this round
                        var customThemeName = game.CustomThemes[game.CurrentRound - 1];
                        theme = await GetOrCreateThemeAsync(customThemeName);
                    }
                    else
                    {
                        // Otherwise use random theme
                        theme = await GetRandomThemeAsync(game.SelectedThemeCategories);
                    }

                    nextRound = new Round
                    {
                        RoundId = Guid.NewGuid(),
                        GameId = gameId,
                        ThemeId = theme.ThemeId,
                        RoundNumber = game.CurrentRound,
                        Status = RoundStatus.Submitting,
                        StartTime = DateTime.UtcNow,
                        EndTime = DateTime.UtcNow.AddSeconds(game.TimePerRound)
                    };

                    game.RoundsList.Add(nextRound);
                    await _roundRepository.AddAsync(nextRound);
                }
            }
            else
            {
                // This was the last round, mark game as finished
                game.Status = GameStatus.Finished;
            }

            // Save game changes
            await _gameRepository.UpdateAsync(game);

            // Get player scores for leaderboard
            var allPlayerScores = await _playerScoreRepository.GetAllAsync();
            var gamePlayerScores = allPlayerScores.Where(ps => ps.GameId == gameId);
            var leaderboard = new List<PlayerScoreDto>();

            foreach (var score in gamePlayerScores)
            {
                var user = await _userRepository.GetByIdAsync(score.UserId);
                leaderboard.Add(new PlayerScoreDto
                {
                    UserId = score.UserId,
                    Username = user?.Username ?? "Unknown User",
                    TotalScore = score.TotalScore
                });
            }

            return new LeaderboardResultDto
            {
                GameId = gameId,
                RoundNumber = game.CurrentRound - 1, // The round that just finished
                Leaderboard = leaderboard.OrderByDescending(l => l.TotalScore).ToList(),
                WinningSong = winningSongDto
            };
        }


=======
        public async Task<string?> RemoveUserFromGameAsync(Guid userId)
        {
            var game = await _gameRepository.GetByUserIdAsync(userId);
            
            if (game is null)
                return null;

            _ = await LeaveGameAsync(game.GameId, userId);

            return game.Code;
        }

>>>>>>> origin/main
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

        private async Task<Theme> GetRandomThemeAsync(List<string> categories)
        {
            var allThemes = await _themeRepository.GetAllAsync();
            var query = allThemes.AsQueryable();

            if (categories != null && categories.Any())
            {
                query = query.Where(t => categories.Contains(t.Category ?? string.Empty));
            }

            var count = query.Count();
            if (count == 0)
            {
                // Fallback to any theme if no matching categories
                query = allThemes.AsQueryable();
                count = query.Count();

                if (count == 0)
                {
                    // Create a default theme if no themes exist
                    return await GetOrCreateThemeAsync("Random Theme");
                }
            }

            var randomIndex = _random.Next(count);
            return query.Skip(randomIndex).FirstOrDefault()
                ?? await GetOrCreateThemeAsync("Random Theme");
        }

        private async Task<Theme> GetOrCreateThemeAsync(string themeName)
        {
            var themes = await _themeRepository.GetAllAsync();
            var theme = themes.FirstOrDefault(t => t.Name == themeName);

            if (theme == null)
            {
                theme = new Theme
                {
                    ThemeId = Guid.NewGuid(),
                    Name = themeName,
                    Category = "Custom",
                    Description = "Custom theme",
                    CreatedAt = DateTime.UtcNow
                };

                await _themeRepository.AddAsync(theme);
            }

            return theme;
        }

        #endregion
    }
}
