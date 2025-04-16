using AutoMapper;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;

namespace VibeCheck.BL.Mapper
{
    public class GameProfile : Profile
    {
        public GameProfile()
        {
            CreateMap<CreateGameDto, Game>();

            CreateMap<Game, GameDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ReverseMap();

            CreateMap<UpdateGameDto, Game>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Rounds, opt => opt.MapFrom(src => src.Rounds))
                .ForMember(dest => dest.PlayersLimit, opt => opt.MapFrom(src => src.PlayersLimit))
                .ForMember(dest => dest.TimePerRound, opt => opt.MapFrom(src => src.TimePerRound))
                .ForMember(dest => dest.Privacy, opt => opt.MapFrom(src => src.Privacy))
                .ForMember(dest => dest.Mode, opt => opt.MapFrom(src => src.Mode))
                .ForMember(dest => dest.SelectedThemeCategories, opt => opt.MapFrom(src => src.SelectedThemeCategories))
                .ForMember(dest => dest.CustomThemes, opt => opt.MapFrom(src => src.CustomThemes));

            // or can write direcly CreateMap<UpdateGameDto, Game>(); because the names are the same
        }
    }
}
