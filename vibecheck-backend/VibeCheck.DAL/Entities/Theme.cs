

namespace VibeCheck.DAL.Entities
{
    public class Theme
    {
        public Guid ThemeId { get; set; }
        public string? Name { get; set; } 
        public string? Category { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
