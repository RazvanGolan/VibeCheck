import { useState, useEffect, useRef } from 'react';
import { Song } from '../../types/song';
import './SongSelect.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Default songs to display when no search query is entered
const defaultSongs: Song[] = [
  {
    id: "781592622",
    title: "Never Gonna Give You Up",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3?hdnea=exp=1744463486~acl=/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3*~data=user_id=0,application_id=42~hmac=a72f371c913c8c283fefecf2df7817f31af0095cd69c22b9d12d143fc9df2c7b",
    artistName: "Rick Astley",
    albumName: "The Best of Me",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/500x500-000000-80-0-0.jpg"
  },
  {
    id: "2404839565",
    title: "Ciocolata",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3?hdnea=exp=1744463502~acl=/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3*~data=user_id=0,application_id=42~hmac=68b5d7a7c9a680b19692efe29059bbfe3795dc7b8c319e1c0cc90c0460808444",
    artistName: "Tzanca Uraganu",
    albumName: "Ciocolata",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/500x500-000000-80-0-0.jpg"
  },
  {
    id: "10199904",
    title: "Animal I Have Become",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3?hdnea=exp=1744463537~acl=/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3*~data=user_id=0,application_id=42~hmac=3db73e9968519857c15e7a4571db1cd18e63c135beb45ed6da16e179fc96e157",
    artistName: "Three Days Grace",
    albumName: "One-X",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/500x500-000000-80-0-0.jpg"
  }
];

const SongSelect = () => {
  const [songs, setSongs] = useState<Song[]>(defaultSongs);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Static data for now - these would come from the game state in a real scenario
  const roundNumber = 1;
  const theme = "Road Trip Vibes";
  const timeRemaining = "1:30";

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setCurrentlyPlaying(null);
        });
      }
    };
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!searchQuery.trim()) {
        setSongs(defaultSongs);
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Song/GetBySongName?songName=${encodeURIComponent(searchQuery)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        
        const data: Song[] = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSongs();
} else {
        setSongs(defaultSongs);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handlePlayToggle = (song: Song) => {
    if (currentlyPlaying === song.id) {
        if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = song.previewUrl;
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        setCurrentlyPlaying(song.id);
      }
    }
  };

  const handleSelectSong = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Here an API call to submit the song
    alert(`Selected: ${song.title} by ${song.artistName}`);
  };

  return (
    <div className="song-select-container">
      <div className="round-info">
        <div className="round-number">Round {roundNumber}</div>
        <div className="theme">Theme: {theme}</div>
        <div className="time-remaining">⏱ {timeRemaining} remaining</div>
      </div>

      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a song..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">Loading songs...</div>
      ) : songs.length === 0 && searchQuery.trim() !== '' ? (
        <div className="no-results">No songs found. Try another search.</div>
      ) : (
        <div className="song-grid">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <img
                src={song.albumCoverBig}
                alt={`${song.title} cover`}
                className="album-cover"
              />
              <div className="song-info">
                <h3 className="song-title">{song.title}</h3>
                <p className="artist-name">{song.artistName}</p>
                <div className="song-controls">
                  <button
                    className={`play-button ${currentlyPlaying === song.id ? 'playing' : ''}`}
                    onClick={() => handlePlayToggle(song)}
                  >
                    {currentlyPlaying === song.id ? (
                      <>
                        <span className="pause-icon">◼</span> Pause
                      </>
                    ) : (
                      <>
                        <span className="play-icon">▶</span> Play
                      </>
                    )}
                  </button>
                </div>
                <button className="select-song-button" onClick={() => handleSelectSong(song)}>
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongSelect;