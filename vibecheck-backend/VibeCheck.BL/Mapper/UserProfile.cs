using AutoMapper;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Entities;

namespace VibeCheck.BL.Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile() {
            CreateMap<User, UserDto>();

            CreateMap<CreateUserDto, User>();

            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
