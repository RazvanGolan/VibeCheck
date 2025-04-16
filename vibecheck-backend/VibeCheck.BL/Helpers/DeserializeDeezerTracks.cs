using System.Text.Json;
using VibeCheck.DAL.Dtos.Songs;

namespace VibeCheck.BL.Helpers;

public static class DeserializeDeezerTracks
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };
    
    public static IEnumerable<DeezerTrack> Deserialize(string json)
    {
        List<DeezerTrack> deezerTracks = [];
        var doc = JsonDocument.Parse(json);

        try
        {
            if (doc.RootElement.TryGetProperty("error", out var _))
            {
                var errorResponse = JsonSerializer.Deserialize<DeezerErrorResponse>(json, JsonSerializerOptions);
                throw new Exception($"Deezer API error: Type: {errorResponse?.Error.Type} Message: {errorResponse?.Error.Message} (Code: {errorResponse?.Error.Code})");
            }
            
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                // Direct array of tracks
                var tracks = JsonSerializer.Deserialize<IEnumerable<DeezerTrack>>(json, JsonSerializerOptions);
        
                if (tracks == null)
                {
                    throw new JsonException("Failed to deserialize tracks.");
                }
        
                return tracks;
            }
            else if (doc.RootElement.TryGetProperty("data", out var dataElement) && dataElement.ValueKind == JsonValueKind.Array)
            {
                // Array wrapped in a "data" property, this is the case for the Deezer API
                var response = JsonSerializer.Deserialize<DeezerResponse>(json, JsonSerializerOptions);
        
                if (response == null)
                {
                    throw new JsonException("Failed to deserialize tracks.");
                }

                return response.Data;
            }
            else
            {
                // Single track object
                var track = JsonSerializer.Deserialize<DeezerTrack>(json, JsonSerializerOptions);
        
                if (track == null)
                {
                    throw new JsonException("Failed to deserialize tracks.");
                }

                return [track];
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}

public class DeezerErrorResponse
{
    public DeezerError Error { get; set; }
}

public class DeezerError
{
    public string Type { get; set; }
    public string Message { get; set; }
    public int Code { get; set; }
}
