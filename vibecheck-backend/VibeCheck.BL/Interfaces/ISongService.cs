using VibeCheck.DAL.Dtos.Songs;

namespace VibeCheck.BL.Interfaces;

public interface ISongService
{
    public Task<IEnumerable<SongResponse>> GetByName(string songName);
    public Task<SongResponse> GetById(string songId);
}