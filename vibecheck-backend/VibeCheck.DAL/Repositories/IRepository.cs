

namespace VibeCheck.DAL.Repositories
{
    public interface IRepository<IEntity> where IEntity : class
    {
        Task<IEnumerable<IEntity>> GetAllAsync();
        Task<IEntity?> GetByIdAsync(Guid id);
        Task<IEntity> AddAsync(IEntity entity);
        Task<IEntity> UpdateAsync(IEntity entity);
        Task DeleteByIdAsync(Guid id);

    }
}
