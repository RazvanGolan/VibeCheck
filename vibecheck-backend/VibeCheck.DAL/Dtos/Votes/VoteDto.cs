namespace VibeCheck.DAL.Dtos.Votes
{
    public class VoteDto
    {
        public Guid GameId { get; set; }
        public Guid SongId { get; set; }
        public Guid VoterUserId { get; set; }
    }
}
