using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Dtos.Leaderboard;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Votes;

namespace VibeCheck.BL.Interfaces
{
    public interface IGameService
    {
        Task<GameDto> CreateGameAsync(CreateGameDto createGameDto);

        Task<IEnumerable<GameDto>> GetGamesAsync();

        Task<GameDto> GetGameByIdAsync(Guid id);
        
        Task<GameDto> GetGameByCodeAsync(string gameCode);

        Task<GameDto> UpdateGameAsync(Guid id, UpdateGameDto updateGameDto);

        Task<GameDto> DeleteGameAsync(Guid id);

        Task<GameDto> JoinGameAsync(string gameCode, Guid userId);

        Task<GameDto> LeaveGameAsync(Guid gameId, Guid userId);

        Task<GameDto> RemovePlayerFromGameAsync(Guid gameId, Guid hostUserId, Guid playerToRemoveId);



        Task<SongDto> SubmitSongAsync(SubmitSongDto songDto);
        Task<bool> VoteForSongAsync(VoteDto voteDto);
        Task<LeaderboardResultDto> GetLeaderboardAndAdvanceRoundAsync(Guid gameId);
    }
}
