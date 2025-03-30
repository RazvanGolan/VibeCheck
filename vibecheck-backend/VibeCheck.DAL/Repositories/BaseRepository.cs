using Microsoft.EntityFrameworkCore;

namespace VibeCheck.DAL.Repositories
{
    public class BaseRepository<IEntity> : IRepository<IEntity> where IEntity : class
    {
        protected readonly VibeCheckContext _context;
        protected readonly DbSet<IEntity> _dbSet;

        public BaseRepository(VibeCheckContext _context)
        {
            this._context = _context;
            _dbSet = _context.Set<IEntity>(); // cache the dbSet for performance
        }

        public virtual async Task<IEnumerable<IEntity>> GetAllAsync()
        {
            try
            {
                return await _dbSet.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't retrieve entities: {ex.Message}");
            }
        }

        public virtual async Task<IEntity?> GetByIdAsync(Guid id)
        {
            try
            {
                return await _dbSet.FindAsync(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't retrieve entity: {ex.Message}");
            }
        }

        public virtual async Task<IEntity> AddAsync(IEntity entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await _context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't add entity: {ex.Message}");
            }
        }

        public virtual async Task<IEntity> UpdateAsync(IEntity entity)
        {
            try
            {
                _dbSet.Update(entity);
                await _context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't update entity: {ex.Message}");
            }
        }

        public virtual async Task DeleteByIdAsync(Guid id)
        {
            try
            {
                var entity = await GetByIdAsync(id);
                if (entity == null)
                {
                    throw new Exception("Entity not found");
                }
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't delete entity: {ex.Message}");
            }
        }

    }
}
