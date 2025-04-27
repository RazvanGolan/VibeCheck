using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Repositories
{
    public interface IGameRepository : IRepository<Game>
    {
        Task<Game?> GetByCodeAsync(string code);
        Task<Game?> GetByIdWithDetailsAsync(Guid id);
    }
}
