import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Song } from '../../types/song';
import { GameDetails, RoundDto } from '../../types/gameTypes';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import './SongSelect.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// List of default song IDs to fetch when the component mounts
const defaultSongIds: string[] = ["781592622", "2404839565", "10199904", "1141674"]

const SongSelect = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const signalR = useSignalR();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [defaultSongs, setDefaultSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  
  // Request time sync as soon as gameId is available
  useEffect(() => {
    if (gameId && signalR.isConnected) {
      signalR.requestRoundTimeSync(gameId);
    }
  }, [gameId, signalR.isConnected, signalR]);

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

    if (game?.code && gameId) {
      const joinGroup = async () => {
        await signalR.joinGameGroup(game.code);
        await signalR.requestRoundTimeSync(gameId);
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

    // Listen for time sync updates
    signalR.onRoundTimeSync((timeInfo) => {
      if (timeInfo) {
        const { selectionTimeRemaining, selectionPhaseEndTime } = timeInfo;

        const endTimeDate = new Date(selectionPhaseEndTime);
        endTimeRef.current = endTimeDate;
        
        const minutes = Math.floor(selectionTimeRemaining / 60);
        const seconds = Math.floor(selectionTimeRemaining % 60);
        setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    });

    return () => {
      if (game?.code) {
        signalR.leaveGameGroup(game.code);
      }
    };
  }, [signalR, game, gameId]);

  // Update the timer and handle auto-navigation when time runs out
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!gameId || !endTimeRef.current) return;

    const updateTimer = () => {
      if (!endTimeRef.current) return;
      
      const now = new Date();
      const timeDiff = endTimeRef.current.getTime() - now.getTime();
      const currentSecondsRemaining = Math.max(0, Math.floor(timeDiff / 1000));   
            
      const minutes = Math.floor(currentSecondsRemaining / 60);
      const seconds = currentSecondsRemaining % 60;
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      
      if (currentSecondsRemaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        navigate(`/vote/${gameId}`);
      }
    };

    updateTimer();

    // Create a precise interval timer
    const intervalId = setInterval(updateTimer, 1000);
    timerRef.current = intervalId;
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameId, navigate, endTimeRef.current]);

  // Re-sync time every 10 seconds to prevent drift and ensure phase transitions
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (gameId) {
        signalR.requestRoundTimeSync(gameId);
      }
    }, 10000); 
    
    return () => clearInterval(syncInterval);
  }, [gameId, signalR]);

  // Fetch default songs using the defaultSongIds when component mounts
  useEffect(() => {
    const fetchDefaultSongs = async () => {
      try {
        const songsPromises = defaultSongIds.map(id => 
          fetch(`${API_BASE_URL}/api/Song/GetById?songId=${id}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch song with ID ${id}`);
              }
              return response.json();
            })
        );
        
        const fetchedSongs = await Promise.all(songsPromises);
        setDefaultSongs(fetchedSongs);
        
        // If no search query is active, set these as the displayed songs
        if (!searchQuery.trim()) {
          setSongs(fetchedSongs);
        }
        
      } catch (error) {
        console.error('Error fetching default songs:', error);
      }
    };

    fetchDefaultSongs();
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
  }, [searchQuery, defaultSongs]);

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