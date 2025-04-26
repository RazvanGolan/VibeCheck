namespace VibeCheck.DAL.Dtos.Songs;

public class DeezerResponse
{
    public List<DeezerTrack> Data { get; set; }
}

public class DeezerTrack
{
    public long id { get; set; }
    public string title { get; set; }
    public string preview { get; set; }
    public DeezerArtist artist { get; set; }
    public DeezerAlbum album { get; set; }
}

public class DeezerArtist
{
    public string name { get; set; }
}

public class DeezerAlbum
{
    public string title { get; set; }
    public string cover_small { get; set; }
    public string cover_big { get; set; }
}