using AutoMapper;
using VibeCheck.DAL.Dtos.Songs;

namespace VibeCheck.BL.Mapper;

public class SongProfile : Profile
{
    public SongProfile()
    {
        CreateMap<DeezerTrack, SongResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id.ToString()))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.title))
            .ForMember(dest => dest.PreviewUrl, opt => opt.MapFrom(src => src.preview))
            .ForMember(dest => dest.ArtistName, opt => opt.MapFrom(src => src.artist.name))
            .ForMember(dest => dest.AlbumName, opt => opt.MapFrom(src => src.album.title))
            .ForMember(dest => dest.AlbumCoverSmall, opt => opt.MapFrom(src => src.album.cover_small))
            .ForMember(dest => dest.AlbumCoverBig, opt => opt.MapFrom(src => src.album.cover_big));
    }
}