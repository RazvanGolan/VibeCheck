using Microsoft.EntityFrameworkCore;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Repositories
{
    public class GameRepository : BaseRepository<Game>, IGameRepository
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

        public override async Task<IEnumerable<Game>> GetAllAsync()
        {
            return await _context.Games
                .Include(g => g.Participants)
                .ToListAsync();
        }
        
        public async Task<Game?> GetByCodeAsync(string code)
        {
            return await _context.Games
                .Include(g => g.Participants)
                .FirstOrDefaultAsync(g => g.Code == code);
        }

        public async Task<Game?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.Games
                .Include(g => g.Participants)
                .Include(g => g.RoundsList)
                    .ThenInclude(r => r.Theme)
                .Include(g => g.RoundsList)
                    .ThenInclude(r => r.Songs)
                .Include(g => g.RoundsList)
                    .ThenInclude(r => r.Votes)
                        .ThenInclude(v => v.VoterUser) 
                .Include(g => g.RoundsList)
                    .ThenInclude(r => r.Theme)
                .FirstOrDefaultAsync(g => g.GameId == id);
        }
        public async Task<Game?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Games
                .Include(g => g.Participants)
                .FirstOrDefaultAsync(g => g.Participants.Any(p => p.UserId == userId));
        }
    }
}
