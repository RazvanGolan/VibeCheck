import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import { SubmitVote, Vote } from '../../types/vote';
import { Song, SongDto, SongSubmission } from '../../types/song';
import { GameDetails, RoundDto } from '../../types/gameTypes';
import './VotingPage.css';
import { User } from '../../types/user';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VotingPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const signalR = useSignalR();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [submissions, setSubmissions] = useState<SongSubmission[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
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

  // Fetch game data and song submissions
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
          
          const songSubmissions: SongSubmission[] = [];
          
          for (const song of round.songs) {
            const voteCount = song.voteCount;
            const hasVoted = song.votes?.some((vote: any) => vote.voterUserId === user?.id) || false;
            const votedByIds = song.votes?.map((vote: any) => vote.voterUserId) || [];
            
            // Get user information if available
            const submitters = song.users || [];
            
            songSubmissions.push({
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: submitters,
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds
            });
          }
          
          // Sort by vote count (descending)
          setSubmissions(songSubmissions.sort((a, b) => b.votes - a.votes));
          setUserHasVoted(songSubmissions.some(sub => sub.hasUserVoted));
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId, user?.id]);

  // Setup SignalR connection for real-time updates
  useEffect(() => {
    if (!signalR.connection || !signalR.isConnected) {
      signalR.connectToHub();
    }

    if (game?.code) {
      const joinGroup = async () => {
        await signalR.joinGameGroup(game.code);
      };
      joinGroup();
    }

    // Listen for vote updates and song submissions
    if (signalR.connection) {
      // When a song is voted
      signalR.connection.on("SongVoted", (updatedGame: GameDetails, votedSong: Song, voter: User) => {
        setGame(updatedGame);
        
        // Find the current round in the updated game data
        const updatedRound = updatedGame.rounds.find((r: RoundDto) => r.roundNumber === updatedGame.currentRound);
        if (updatedRound) {
          setCurrentRound(updatedRound);
          
          // Process songs and their votes
          const updatedSubmissions: SongSubmission[] = updatedRound.songs.map((song: SongDto) => {
            const voteCount = song.voteCount;
            const hasVoted = song.votes?.some((vote: Vote) => vote.voterUserId === user?.id) || false;
            const votedByIds = song.votes?.map((vote: Vote) => vote.voterUserId) || [];

            return {
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: song.users || [],
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds
            };
          });
          
          setSubmissions(updatedSubmissions.sort((a, b) => b.votes - a.votes));
          setUserHasVoted(updatedSubmissions.some(sub => sub.hasUserVoted));
        }
      });
      
      // When a new song is submitted
      signalR.connection.on("SongSubmitted", (updatedGame: GameDetails, newSong: Song) => {        
        setGame(updatedGame);
        
        // Find the current round in the updated game data
        const updatedRound = updatedGame.rounds.find((r: RoundDto) => r.roundNumber === updatedGame.currentRound);
        if (updatedRound) {
          setCurrentRound(updatedRound);
          
          // Process songs and their votes
          const updatedSubmissions: SongSubmission[] = updatedRound.songs.map((song: SongDto) => {
            const voteCount = song.voteCount;
            const hasVoted = song.votes?.some((vote: Vote) => vote.voterUserId === user?.id) || false;
            const votedByIds = song.votes?.map((vote: Vote) => vote.voterUserId) || [];
            
            return {
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: song.users || [],
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds
            };
          });
          
          setSubmissions(updatedSubmissions.sort((a, b) => b.votes - a.votes));
          setUserHasVoted(updatedSubmissions.some(sub => sub.hasUserVoted));
        }
      });

      signalR.connection.on("RoundEnded", () => {
        // Handle round ended (could navigate to results or next round)
      });
    }

    return () => {
      if (game?.code) {
        signalR.leaveGameGroup(game.code);
      }
      if (signalR.connection) {
        signalR.connection.off("SongSubmitted");
        signalR.connection.off("SongVoted");
        signalR.connection.off("RoundEnded");
      }
    };
  }, [signalR, game, user?.id]);

  // Update the timer and handle auto-navigation when time runs out
  useEffect(() => {
    if (!game || !gameId) return;
    
    const votingTimeSeconds = game.timePerRound;
    let timeLeft = votingTimeSeconds;
    
    const updateTimeRemaining = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        // Handle voting ended - could navigate to results or next round
      }
      
      timeLeft -= 1;
    };
    
    updateTimeRemaining();
    const timerInterval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(timerInterval);
  }, [game, gameId]);

  const handlePlayToggle = (submission: SongSubmission) => {
    if (currentlyPlaying === submission.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = submission.song.previewUrl;
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        setCurrentlyPlaying(submission.id);
      }
    }
  };

  const handleVote = async (songId: string) => {
    if (!gameId || !user || !currentRound || userHasVoted) return;

    try {
      // Create vote object
      const voteData: SubmitVote = {
        gameId: gameId,
        voterUserId: user.id,
        deezerSongId: songId
      };

      // API call to submit vote
      const response = await fetch(`${API_BASE_URL}/api/Game/Vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      // Optimistically update UI
      setSubmissions(prev => prev.map(submission => {
        if (submission.id === songId) {
          return { 
            ...submission, 
            votes: submission.votes + 1, 
            hasUserVoted: true,
            votedBy: [...(submission.votedBy || []), user.id]
          };
        }
        return submission;
      }).sort((a, b) => b.votes - a.votes));
      
      setUserHasVoted(true);
      
      // Notify other players via SignalR
      if (signalR.connection && game?.code) {
        const votedSong = submissions.find(sub => sub.deezerSongId === songId)?.song;
        if (votedSong) {
          // Call the VoteSong method on the server with the correct parameters
          await signalR.connection.invoke("VoteSong", game.code, votedSong, user.id);
        }
      }
      
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className="voting-page-container">
      {loading ? (
        <div className="loading-state">Loading voting data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !game || !currentRound ? (
        <div className="error-message">Game data not found or round not available</div>
      ) : (
        <>
          <div className="voting-header">
            <div className="round-info">
              <div className="round-number">Round {currentRound.roundNumber}</div>
              <div className="theme">Theme: {currentRound.theme?.name || "Unknown Theme"}</div>
              <div className="time-remaining">⏱ {timeRemaining || "0:00"} remaining</div>
            </div>
            <h1 className="voting-title">Vote for the best song</h1>
            <p className="voting-instructions">
              Listen to each song and vote for the one that best fits the theme.
              {userHasVoted && <span className="voted-message"> You've cast your vote!</span>}
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="no-songs-message">No songs have been submitted yet.</div>
          ) : (
            <div className="vote-list">
              {submissions.map((submission, index) => (
                <div key={submission.id} className={`vote-card ${submission.hasUserVoted ? 'user-voted' : ''}`}>
                  <div className="vote-rank">{index + 1}</div>
                  <div className="vote-content">
                    <div className="song-details">
                      <img
                        src={submission.song.albumCoverBig}
                        alt={`${submission.song.title} cover`}
                        className="song-cover"
                      />
                      <div className="song-info">
                        <h3 className="song-title" title={submission.song.title}>
                          {submission.song.title.length > 30 
                            ? submission.song.title.substring(0, 27) + '...' 
                            : submission.song.title}
                        </h3>
                        <p className="song-artist" title={submission.song.artistName}>
                          {submission.song.artistName}
                        </p>
                        <div className="submitter-info">
                          {submission.users.length > 0 ? (
                            <>
                              <div className="submitter-avatars">
                                {submission.users.map((user, i) => (
                                  <img 
                                    key={user.id}
                                    src={user.avatar || '/avatars/1.png'} 
                                    alt={`${user.username}'s avatar`}
                                    className="submitter-avatar"
                                    style={{marginLeft: i > 0 ? '-8px' : '0'}}
                                  />
                                ))}
                              </div>
                              <span className="submitter-name">
                                Submitted by <b>
                                {submission.users.map((user, i) => (
                                  <span key={user.id}>
                                    {i > 0 && (i === submission.users.length - 1 ? " & " : ", ")}
                                    {user.username}
                                  </span>
                                ))}
                                </b>
                              </span>
                            </>
                          ) : (
                            <>
                              <img 
                                src="/avatars/1.png" 
                                alt="Default avatar"
                                className="submitter-avatar" 
                              />
                              <span className="submitter-name">
                                Submitted by <b>Unknown User</b>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="vote-actions">
                      <button
                        className={`song-preview-button ${currentlyPlaying === submission.id ? 'playing' : ''}`}
                        onClick={() => handlePlayToggle(submission)}
                      >
                        {currentlyPlaying === submission.id ? (
                          <>
                            <span className="pause-icon">◼</span> Pause
                          </>
                        ) : (
                          <>
                            <span className="play-icon">▶</span> Play
                          </>
                        )}
                      </button>
                      
                      <div className="vote-count">
                        <span className="votes">{submission.votes}</span>
                        <span className="vote-label">votes</span>
                      </div>
                      
                      <button
                        className={`vote-button ${submission.hasUserVoted ? 'voted' : ''} ${userHasVoted && !submission.hasUserVoted ? 'disabled' : ''}`}
                        onClick={() => handleVote(submission.deezerSongId)}
                        disabled={userHasVoted || timeRemaining === '0:00'}
                      >
                        {submission.hasUserVoted ? 'Voted ✓' : 'Vote'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {timeRemaining === '0:00' && submissions.length > 0 && (
            <div className="voting-results">
              <h2 className="results-title">Voting Complete!</h2>
              <p className="winner-announcement">
                The winner is "{submissions[0].song.title}" by {submissions[0].song.artistName}, 
                submitted by {submissions[0].users.length > 0 
                  ? submissions[0].users.map((user, i) => (
                      <span key={user.id}>
                        {i > 0 && (i === submissions[0].users.length - 1 ? " & " : ", ")}
                        <b>{user.username}</b>
                      </span>
                    ))
                  : <b>Unknown User</b>}!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VotingPage;
