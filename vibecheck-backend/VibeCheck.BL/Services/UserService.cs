using AutoMapper;
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

        public UserService(IRepository<User> userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            var user = _mapper.Map<User>(createUserDto);
            user.CreatedAt = DateTime.UtcNow;

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

        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id {id} not found");
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

        private async Task<bool> UsernameExistsAsync(string username) // in case we ever want users to have unique usernames
        {
            var users = await _userRepository.GetAllAsync();
            return users.Any(u => u.Username == username);
        }

        #endregion

    }

}
