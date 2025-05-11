import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Song } from '../../types/song';
import { GameDetails, RoundDto } from '../../types/gameTypes';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import './SongSelect.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Default songs to display when no search query is entered
const defaultSongs: Song[] = [
  {
    id: "781592622",
    title: "Never Gonna Give You Up",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3?hdnea=exp=1745588479~acl=/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3*~data=user_id=0,application_id=42~hmac=c679d23427f630d2a73d67a4648143ee00ecd9835a4d585c1b86b3fbb1813189",
    artistName: "Rick Astley",
    albumName: "The Best of Me",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/500x500-000000-80-0-0.jpg"
  },
  {
    id: "2404839565",
    title: "Ciocolata",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3?hdnea=exp=1745588577~acl=/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3*~data=user_id=0,application_id=42~hmac=ff07d890c8f459470918b620093bf3ad71e5d5ffb724c1fe01df259e3d46fc00",
    artistName: "Tzanca Uraganu",
    albumName: "Ciocolata",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/500x500-000000-80-0-0.jpg"
  },
  {
    id: "10199904",
    title: "Animal I Have Become",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3?hdnea=exp=1745588618~acl=/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3*~data=user_id=0,application_id=42~hmac=7d12b94347e94de574c4ca405f8a9b2510b89588af141931b269fc10e6b88460",
    artistName: "Three Days Grace",
    albumName: "One-X",
    albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/56x56-000000-80-0-0.jpg",
    albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/500x500-000000-80-0-0.jpg"
  }
];

const SongSelect = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const signalR = useSignalR();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [songs, setSongs] = useState<Song[]>(defaultSongs);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio player
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

  // Fetch game data
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/Game/GetGame/${gameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        
        const gameData: GameDetails = await response.json();
        setGame(gameData);
        
        // Find the current round
        const round = gameData.rounds.find(r => r.roundNumber === gameData.currentRound);
        if (round) {
          setCurrentRound(round);
        }
        
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  // Setup SignalR connection for real-time updates
  useEffect(() => {
    if (!signalR.connection  || !signalR.isConnected) {
      signalR.connectToHub();
    }

    if (game?.code) {
      const joinGroup = async () => {
        await signalR.joinGameGroup(game.code);
      };
      joinGroup();
    }

    // Listen for round updates
    signalR.onRoundStarted((roundNumber) => {
      if (game) {
        const updatedRound = game.rounds.find(r => r.roundNumber === roundNumber);
        if (updatedRound) {
          setCurrentRound(updatedRound);
        }
      }
    });

    return () => {
      if (game?.code) {
        signalR.leaveGameGroup(game.code);
      }
    };
  }, [signalR, game]);

  // Update the timer and handle auto-navigation when time runs out
  useEffect(() => {
    if (!game || !gameId) return;
    
    // Initialize the timer with timePerRound from game
    const totalSeconds = game.timePerRound;
    let timeLeft = totalSeconds;
    
    const updateTimeRemaining = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        navigate(`/vote/${gameId}`);
      }
      
      timeLeft -= 1;
    };
    
    updateTimeRemaining();
    const timerInterval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(timerInterval);
  }, [game, gameId, navigate]);

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
        setSongs(data.slice(0, 24));
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

  const handleSelectSong = async (song: Song) => {
    if (!gameId || !user || !currentRound) {
      setError("Cannot submit song - missing game data");
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    }
    
    try {
      const submitSongDto = {
        gameId: gameId,
        userId: user.id,
        deezerSongId: song.id, // Changed from songId to deezerSongId to match backend DTO
        title: song.title,
        artist: song.artistName,
        albumName: song.albumName,
        albumCoverSmall: song.albumCoverSmall,
        albumCoverBig: song.albumCoverBig,
        previewUrl: song.previewUrl
      };
      
      const response = await fetch(`${API_BASE_URL}/api/Game/SubmitSong`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitSongDto)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit song');
      }
      
      const submittedSong = await response.json(); // Get the response data
      
      // Notify other players via SignalR
      if (signalR.connection && game?.code) {
        await signalR.connection.invoke("SubmitSong", game.code, submittedSong);
      }
      
      navigate(`/vote/${gameId}`);
    } catch (err) {
      console.error('Error submitting song:', err);
      setError('Failed to submit song. Please try again.');
    }
  };

  if (loading && !game) {
    return <div className="loading-state">Loading game data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!game || !currentRound) {
    return <div className="error-message">Game data not found or round not available</div>;
  }

  return (
    <div className="song-select-container">
      <div className="round-info">
        <div className="round-number">Round {currentRound.roundNumber}</div>
        <div className="theme">Theme: {currentRound.theme?.name || "Unknown Theme"}</div>
        <div className="time-remaining">⏱ {timeRemaining || "0:00"} remaining</div>
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
                    className={`play-song-button ${currentlyPlaying === song.id ? 'playing' : ''}`}
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