using VibeCheck.DAL.Dtos.Users;
using VibeCheck.DAL.Dtos.Votes;

namespace VibeCheck.DAL.Dtos.Songs
{
    public class SongDto
    {
        public string SongId { get; set; } = string.Empty; // for Deezer ID
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string? AlbumName { get; set; }
        public string? AlbumCoverSmall { get; set; }
        public string? AlbumCoverBig { get; set; }
        public string? PreviewUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
        public int VoteCount { get; set; }
        public List<VoteDto> Votes { get; set; } = []; // including votes in response
        public List<UserDto> Users { get; set; } = []; // including users in response
    }
}
