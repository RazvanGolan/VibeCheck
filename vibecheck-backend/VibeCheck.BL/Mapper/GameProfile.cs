using AutoMapper;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Dtos.Leaderboard;
using VibeCheck.DAL.Dtos.Rounds;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.DAL.Dtos.Themes;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;

namespace VibeCheck.BL.Mapper
{
    public class GameProfile : Profile
    {
        public GameProfile()
        {
            CreateMap<Game, GameDto>()
            .ForMember(dest => dest.TotalRounds, opt => opt.MapFrom(src => src.TotalRounds))
            .ForMember(dest => dest.Rounds, opt => opt.MapFrom(src =>
                src.RoundsList.OrderBy(r => r.RoundNumber)));

            CreateMap<UpdateGameDto, Game>();

            // Round mappings  
            CreateMap<Round, RoundDto>();

            // Theme mappings
            CreateMap<Theme, ThemeDto>();

            // Song mappings
            CreateMap<Song, SongDto>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.SongTitle))
                .ForMember(dest => dest.UserName, opt => opt.Ignore())
                .ForMember(dest => dest.VoteCount, opt => opt.Ignore());

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
