using AutoMapper;
using VibeCheck.BL.Interfaces;
using VibeCheck.DAL.Dtos.Songs;
using VibeCheck.BL.Helpers;

namespace VibeCheck.BL.Services;

public class SongService : ISongService
{
    private readonly HttpClient _httpClient;
    private readonly IMapper _mapper;

    public SongService(HttpClient httpClient, IMapper mapper)
    {
        _httpClient = httpClient;
        _mapper = mapper;
    }

    public async Task<IEnumerable<SongResponse>> GetByName(string songName)
    {
        if (string.IsNullOrWhiteSpace(songName))
        {
            throw new ArgumentNullException(nameof(songName));
        }

        try
        {
            var response = await _httpClient.GetAsync($"https://api.deezer.com/search?q={songName}");
            var content = await response.Content.ReadAsStringAsync();
            
            var deezerTracks =  DeserializeDeezerTracks.Deserialize(content);
            
            return _mapper.Map<IEnumerable<SongResponse>>(deezerTracks);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<SongResponse> GetById(string songId)
    {
        if (string.IsNullOrWhiteSpace(songId))
        {
            throw new ArgumentNullException(nameof(songId));
        }
        
        try
        {
            var response = await _httpClient.GetAsync($"https://api.deezer.com/track/{songId}");
            var content = await response.Content.ReadAsStringAsync();
            
            var track = DeserializeDeezerTracks.Deserialize(content).FirstOrDefault();

            return _mapper.Map<SongResponse>(track);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}