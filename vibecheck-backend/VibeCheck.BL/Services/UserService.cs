using AutoMapper;
using Microsoft.AspNetCore.Identity;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Repositories;

namespace VibeCheck.BL.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(IRepository<User> userRepository, IMapper mapper, IPasswordHasher<User> passwordHasher)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            var user = _mapper.Map<User>(createUserDto);
            user.PasswordHash = _passwordHasher.HashPassword(user, createUserDto.Password);

            var createdUser = await _userRepository.AddAsync(user);
            return _mapper.Map<UserDto>(createdUser);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return _mapper.Map<UserDto>(user);
        }

        // user can have the same email but not the same username
        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
        {
            if(await UsernameExistsAsync(updateUserDto.Username))
            {
                throw new ArgumentException($"Username {updateUserDto.Username} already exists");
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id {id} not found");
            }


            if (user.Email != updateUserDto.Email && await EmailExistsAsync(updateUserDto.Email))
            {
                throw new ArgumentException($"Email {updateUserDto.Email} already exists");
            }

            user = _mapper.Map(updateUserDto, user);
            var updatedUser = await _userRepository.UpdateAsync(user);
            return _mapper.Map<UserDto>(updatedUser);
        }

        public async Task<UserDto> DeleteUserAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id {id} not found");
            }
            await _userRepository.DeleteByIdAsync(id);
            return _mapper.Map<UserDto>(user);
        }

        #region Private Methods

        private async Task<bool> UsernameExistsAsync(string username)
        {
            var users = await _userRepository.GetAllAsync();
            return users.Any(u => u.Username == username);
        }

        private async Task<bool> EmailExistsAsync(string email)
        {
            var users = await _userRepository.GetAllAsync();
            return users.Any(u => u.Email == email);
        }

        #endregion

    }

}
