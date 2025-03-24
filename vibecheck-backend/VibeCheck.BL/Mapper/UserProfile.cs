using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Entities;

namespace VibeCheck.BL.Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile() { 
            CreateMap<User, UserDto>();

            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
