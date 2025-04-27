namespace VibeCheck.DAL.Dtos.Songs
{
    public class SubmitSongDto
    {
        public Guid GameId { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string SpotifyUri { get; set; } = string.Empty;
        public string? AlbumName { get; set; }
        public string? AlbumCoverSmall { get; set; }
        public string? AlbumCoverBig { get; set; }
        public string? PreviewUrl { get; set; }
    }
}
