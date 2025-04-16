﻿using Microsoft.EntityFrameworkCore;
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
    }
}
