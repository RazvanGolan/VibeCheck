using System.ComponentModel.DataAnnotations;
using VibeCheck.DAL.Enums;

namespace VibeCheck.DAL.Dtos.Games
{
    public class UpdateGameDto
    {
        [Required]
        public GameStatus Status { get; set; }

        [Range(1, 20)]
        public int Rounds { get; set; }

        [Range(2, 16)]
        public int PlayersLimit { get; set; }

        [Range(15, 180)]
        public int TimePerRound { get; set; }

        [Required]
        public PrivacyType Privacy { get; set; } // "Public" or "Private"

        [Required]
        public GameMode Mode { get; set; }

        public List<string> SelectedThemeCategories { get; set; } = new();
        public List<string> CustomThemes { get; set; } = new();
    }
}
