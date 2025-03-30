namespace VibeCheck.DAL.Dtos.Users
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
