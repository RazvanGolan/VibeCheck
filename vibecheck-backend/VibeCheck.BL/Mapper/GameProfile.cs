using AutoMapper;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Dtos.Leaderboard;
using VibeCheck.DAL.Dtos.Rounds;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Themes;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Dtos.Votes;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;

namespace VibeCheck.BL.Mapper
{
    public class GameProfile : Profile
    {
        public GameProfile()
        {
            _ = CreateMap<Game, GameDto>()
                .ForMember(dest => dest.TotalRounds, opt => opt.MapFrom(src => src.TotalRounds))
                .ForMember(dest => dest.Rounds, opt => opt.MapFrom(src =>
                    src.RoundsList.OrderBy(r => r.RoundNumber)
                    .Select(r => new RoundDto
                    {
                        RoundId = r.RoundId,
                        RoundNumber = r.RoundNumber,
                        Status = r.Status,
                        StartTime = r.StartTime,
                        EndTime = r.EndTime,
                        Theme = r.Theme != null ? new ThemeDto
                        {
                            ThemeId = r.Theme.ThemeId,
                            Name = r.Theme.Name != null ? r.Theme.Name : "Unknown Theme",
                            Category = r.Theme.Category != null ? r.Theme.Category : "Unknown Theme"

                        } : null,
                        Songs = r.Songs != null ? r.Songs.Select(s => new SongDto
                        {
                            SongId = s.SongId,
                            DeezerSongId = s.DeezerId,
                            Title = s.SongTitle,
                            Artist = s.Artist,
                            AlbumName = s.AlbumName,
                            AlbumCoverSmall = s.AlbumCoverSmall,
                            AlbumCoverBig = s.AlbumCoverBig,
                            PreviewUrl = s.PreviewUrl,
                            SubmittedAt = s.SubmittedAt,
                            VoteCount = r.Votes != null ? r.Votes.Count(v => v.DeezerSongId == s.DeezerId) : 0,
                            Votes = r.Votes != null ? r.Votes.Where(v => v.DeezerSongId == s.DeezerId)
                                .Select(v => new VoteDto
                                {
                                    GameId = r.Game != null ? r.Game.GameId : Guid.Empty, // Replace null-propagating operator  
                                    DeezerSongId = v.DeezerSongId,
                                    VoterUserId = v.VoterUserId,
                                    VoterUsername = v.VoterUser != null ? v.VoterUser.Username : "Unknown User" // Fix for CS8072
                                }).ToList() : new List<VoteDto>(),
                            Users = s.Users != null ? s.Users.Select(u => new UserDto
                            {
                                UserId = u.UserId,
                                Username = u.Username,
                            }).ToList() : new List<UserDto>(),
                        }).ToList() : new List<SongDto>()
                    }).ToList()));

            CreateMap<UpdateGameDto, Game>();

            // Round mappings    
            CreateMap<Round, RoundDto>();

            // Theme mappings  
            CreateMap<Theme, ThemeDto>();

            // Song mappings  
            CreateMap<Song, SongDto>()
                .ForMember(dest => dest.SongId, opt => opt.MapFrom(src => src.SongId))
                .ForMember(dest => dest.DeezerSongId, opt => opt.MapFrom(src => src.DeezerId))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.SongTitle))
                .ForMember(dest => dest.VoteCount, opt => opt.Ignore())
                .ForMember(dest => dest.Votes, opt => opt.MapFrom(src =>
                    src.Votes != null
                        ? src.Votes.Select(v => new VoteDto
                        {
                            GameId = src.Round != null
                                ? src.Round.GameId
                                : Guid.Empty, // Replace null-propagating operator  
                            DeezerSongId = v.DeezerSongId,
                            VoterUserId = v.VoterUserId,
                            VoterUsername =
                                v.VoterUser != null ? v.VoterUser.Username : "Unknown User" // Fix for CS8072
                        }).ToList()
                        : new List<VoteDto>()))
                .ForMember(dest => dest.Users, opt => opt.MapFrom((src =>
                    src.Users != null
                        ? src.Users.Select(u => new UserDto
                        {
                            UserId = u.UserId,
                            Username = u.Username,
                        }).ToList()
                        : new List<UserDto>())));

            // Add CreateGame to Game mapping  
            CreateMap<CreateGameDto, Game>()
                .ForMember(dest => dest.GameId, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentRound, opt => opt.MapFrom(_ => 1))
                .ForMember(dest => dest.TotalRounds, opt => opt.MapFrom(src => src.Rounds));

            // PlayerScore mappings  
            CreateMap<PlayerScore, PlayerScoreDto>()
                .ForMember(dest => dest.Username, opt => opt.Ignore())
                .ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.TotalScore));
        }
    }
}
