namespace VibeCheck.DAL.Dtos.Songs;

public sealed class SongResponse
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string PreviewUrl { get; set; }
    public required string ArtistName { get; set; }
    public required string AlbumName { get; set; }
    public required string AlbumCoverSmall { get; set; }
}