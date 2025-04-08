using Microsoft.EntityFrameworkCore;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Repositories
{
    public class GameRepository : BaseRepository<Game>
    {
        public GameRepository(VibeCheckContext context) : base(context)
        {
        }
        public override async Task<Game?> GetByIdAsync(Guid id)
        {
            return await _context.Games
                .Include(g => g.Participants)
                .FirstOrDefaultAsync(g => g.GameId == id);
        }
    }
}
