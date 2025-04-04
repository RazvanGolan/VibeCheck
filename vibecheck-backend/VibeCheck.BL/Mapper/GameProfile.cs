using AutoMapper;
using VibeCheck.DAL.Dtos.Games;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Enums;

namespace VibeCheck.BL.Mapper
{
    public class GameProfile : Profile
    {
        public GameProfile() {
            CreateMap<CreateGameDto, Game>();

            CreateMap<Game, GameDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (GameStatus)src.Status)); // map int to enum

            CreateMap<UpdateGameDto, Game>();
        }
    }
}
