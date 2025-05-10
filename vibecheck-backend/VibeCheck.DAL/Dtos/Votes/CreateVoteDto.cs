
namespace VibeCheck.DAL.Dtos.Votes
{
    public class CreateVoteDto
    {
        public Guid GameId { get; set; }
        public string SongId { get; set; } = string.Empty; // for Deezer ID
        public Guid VoterUserId { get; set; }
    }
}
