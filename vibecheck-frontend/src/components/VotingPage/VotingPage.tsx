import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import { SubmitVote, Vote } from '../../types/vote';
import { Song, SongDto, SongSubmission } from '../../types/song';
import { GameDetails, RoundDto } from '../../types/gameTypes';
import { User } from '../../types/user';
import './VotingPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VotingPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const signalR = useSignalR();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [submissions, setSubmissions] = useState<SongSubmission[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [nextRoundTriggered, setNextRoundTriggered] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  // const [roundEndingCountdown, setRoundEndingCountdown] = useState<number | null>(null); // REMOVED
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  
  // New states for popup and leaderboard
  const [showResultsPopup, setShowResultsPopup] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<SongSubmission | null>(null);
  const [showFinalLeaderboard, setShowFinalLeaderboard] = useState<boolean>(false);
  const [playerScores, setPlayerScores] = useState<Array<{user: User, points: number}>>([]);
  
  // Add refs to prevent multiple triggers
  const roundCompleteTriggeredRef = useRef<boolean>(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      // Clear any pending timers on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
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
            
            // Check if current user is a submitter of this song
            const isUserSubmitter = user ? submitters.some(submitter => submitter.userId === user.id) : false;
            songSubmissions.push({
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: submitters,
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds,
              isUserSubmitter: isUserSubmitter
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
  }, [gameId, user?.id, user]);

  // Setup SignalR connection for real-time updates
  useEffect(() => {
    if (!signalR.connection || !signalR.isConnected) {
      signalR.connectToHub();
    }

    if (game?.code && gameId) {
      const joinGroup = async () => {
        await signalR.joinGameGroup(game.code);
        await signalR.requestRoundTimeSync(gameId);
      };
      joinGroup();

      // Check if user is the host
      if (user && game.hostUserId === user.id) {
        setIsHost(true);
      }
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
            
            // Check if current user is a submitter of this song
            const isUserSubmitter = user ? (song.users || []).some(submitter => submitter.userId === user.id) : false;
            
            return {
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: song.users || [],
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds,
              isUserSubmitter: isUserSubmitter
            };
          });
          
          setSubmissions(updatedSubmissions.sort((a, b) => b.votes - a.votes));
          setUserHasVoted(updatedSubmissions.some(sub => sub.hasUserVoted));
          
          // Check if all users have voted
          const totalVotes = updatedRound.songs.reduce((acc, song) => acc + song.voteCount, 0);
          const allVoted = totalVotes === updatedGame.participants.length;

          if (allVoted && !roundCompleteTriggeredRef.current) {
            setTimeRemaining('0:00');
            handleRoundComplete();
          }
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
            // Check if current user is a submitter of this song
            const isUserSubmitter = user ? (song.users || []).some(submitter => submitter.userId === user.id) : false;
            
            return {
              id: song.id,
              deezerSongId: song.deezerSongId,
              song: song,
              users: song.users || [],
              votes: voteCount,
              hasUserVoted: hasVoted,
              votedBy: votedByIds,
              isUserSubmitter: isUserSubmitter
            };
          });
          
          setSubmissions(updatedSubmissions.sort((a, b) => b.votes - a.votes));
          setUserHasVoted(updatedSubmissions.some(sub => sub.hasUserVoted));
          
          // Check if all users have voted
          const totalVotes = updatedRound.songs.reduce((acc, song) => acc + song.voteCount, 0);
          const allVoted = totalVotes === updatedGame.participants.length;
            
          if (allVoted && !roundCompleteTriggeredRef.current) {
            setTimeRemaining('0:00');
            handleRoundComplete();
          }
        }
      });

      // Listen for time sync updates
      signalR.onRoundTimeSync((timeInfo) => {
        if (timeInfo) {
          const { totalTimeRemaining, roundEndTime } = timeInfo;

          const endTimeDate = new Date(roundEndTime);
          endTimeRef.current = endTimeDate;

          const minutes = Math.floor(totalTimeRemaining / 60);
          const seconds = Math.floor(totalTimeRemaining % 60);
          setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          
          // If timer has reached zero and this user is the host, schedule next round
          if (totalTimeRemaining <= 0 && !roundCompleteTriggeredRef.current) {
            handleRoundComplete();
          }
        }
      });

      // Listen for round started event
      signalR.connection.on("RoundStarted", (updatedGame: GameDetails) => {
        // Reset all round completion states
        roundCompleteTriggeredRef.current = false;
        setNextRoundTriggered(false);
        setShowResultsPopup(false);
        setRoundWinner(null);
        // setRoundEndingCountdown(null); // REMOVED
        
        // Clear any existing popup timer
        if (popupTimerRef.current) {
          clearTimeout(popupTimerRef.current);
          popupTimerRef.current = null;
        }
        
        navigate(`/select/${gameId}`);
      });
    }

    return () => {
      if (game?.code) {
        signalR.leaveGameGroup(game.code);
      }
      if (signalR.connection) {
        signalR.connection.off("SongSubmitted");
        signalR.connection.off("SongVoted");
        signalR.connection.off("RoundStarted");
      }
    };
  }, [signalR, game, user?.id, gameId, navigate]); // Removed isHost from dependencies as it's set based on game and user

  // Update the timer based on endTimeRef
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
      
      // Update the display
      const minutes = Math.floor(currentSecondsRemaining / 60);
      const seconds = currentSecondsRemaining % 60;
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      
      // Check if time has reached zero
      if (currentSecondsRemaining <= 0 && !roundCompleteTriggeredRef.current) {
        handleRoundComplete();
      }
    };
    
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    timerRef.current = intervalId;    

    return () => {
      if (timerRef.current) {
        clearInterval(intervalId);
      }
    };
  }, [gameId, endTimeRef.current]); // handleRoundComplete removed from deps, use ref or useCallback if needed. It's stable for now.

  // Re-sync time every 10 seconds to prevent drift and stay synchronized
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (gameId && signalR.isConnected) { // Ensure signalR is connected before requesting
        signalR.requestRoundTimeSync(gameId);
      }
    }, 10000);
    
    return () => clearInterval(syncInterval);
  }, [gameId, signalR]);

  // REMOVED useEffect for roundEndingCountdown

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
    const submission = submissions.find(sub => sub.deezerSongId === songId);
    if (!gameId || !user || !currentRound || userHasVoted || (submission && submission.isUserSubmitter)) return;

    try {
      const voteData: SubmitVote = {
        gameId: gameId,
        voterUserId: user.id,
        deezerSongId: songId
      };

      const response = await fetch(`${API_BASE_URL}/api/Game/Vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData)
      });
      
      if (!response.ok) throw new Error('Failed to submit vote');
      
      setSubmissions(prev => prev.map(s => 
        s.id === songId ? { ...s, votes: s.votes + 1, hasUserVoted: true, votedBy: [...(s.votedBy || []), user.id] } : s
      ).sort((a, b) => b.votes - a.votes));
      
      setUserHasVoted(true);
      
      if (signalR.connection && game?.code) {
        const votedSongDetails = submissions.find(sub => sub.deezerSongId === songId)?.song;
        if (votedSongDetails) {
          await signalR.connection.invoke("VoteSong", game.code, votedSongDetails, user.id);
        }
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
    }
  };

  // Handle round completion
  const handleRoundComplete = () => {
    if (roundCompleteTriggeredRef.current) return;
    roundCompleteTriggeredRef.current = true;
    setNextRoundTriggered(true); 

    if (submissions.length > 0) {
      const winner = submissions[0];
      setRoundWinner(winner);
      setShowResultsPopup(true);
      
      if (audioRef.current && winner.song.previewUrl) {
        audioRef.current.pause();
        audioRef.current.src = winner.song.previewUrl;
        audioRef.current.play().catch(err => console.error('Error playing winning song:', err));
        setCurrentlyPlaying(winner.id);
      }
    }

    if (game && game.currentRound === game.totalRounds) {
      setGameEnded(true);
      calculateFinalScores();
      return; 
    }

    // For non-final rounds: Show popup for 10s, then host starts next round
    popupTimerRef.current = setTimeout(() => {
      setShowResultsPopup(false); 

      if (isHost && signalR.connection && gameId) {
        (async () => {
          try {
            console.log("Host is attempting to start the next round after popup.");
            if (signalR.connection) {
              await signalR.connection.invoke("StartRound", gameId);
            }
          } catch (err) {
            console.error("Error starting next round from handleRoundComplete:", err);
            setError("Failed to start the next round. The host may need to retry.");
            setNextRoundTriggered(false);
            roundCompleteTriggeredRef.current = false; 
          }
        })();
      }
    }, 10000); 
  };

  const calculateFinalScores = () => {
    if (!game) return;
    
    const scores: {[userId: string]: {user: User, points: number}} = {};
    
    game.participants.forEach(participant => {
      scores[participant.userId] = {
        user: { id: participant.userId, username: participant.username, avatar: participant.avatar },
        points: 0
      };
    });
    
    game.rounds.forEach(round => {
      round.songs.forEach(song => {
        song.users?.forEach(submitter => {
          if (scores[submitter.userId]) {
            scores[submitter.userId].points += song.voteCount;
          }
        });
      });
    });
    
    const sortedScores = Object.values(scores).sort((a, b) => b.points - a.points);
    setPlayerScores(sortedScores);
    
    popupTimerRef.current = setTimeout(() => {
      setShowResultsPopup(false);
      setShowFinalLeaderboard(true);
    }, 10000);
  };

  const ResultsPopup = () => {
    if (!showResultsPopup || !roundWinner) return null;

    return (
      <div className="results-popup-overlay">
        <div className="results-popup">
          <div className="popup-header">
            <h2 className="popup-title">🎉 Round Winner! 🎉</h2>
          </div>
          
          <div className="winner-card">
            <img
              src={roundWinner.song.albumCoverBig}
              alt={`${roundWinner.song.title} cover`}
              className="winner-cover"
            />
            <div className="winner-info">
              <h3 className="winner-song-title">{roundWinner.song.title}</h3>
              <p className="winner-artist">{roundWinner.song.artistName}</p>
              <div className="winner-submitters">
                <span>Submitted by </span>
                {roundWinner.users.map((user, i) => (
                  <span key={user.userId} className="winner-submitter">
                    {i > 0 && (i === roundWinner.users.length - 1 ? " & " : ", ")}
                    <strong>{user.username}</strong>
                  </span>
                ))}
              </div>
              <div className="winner-votes">
                <span className="votes-count">{roundWinner.votes}</span>
                <span className="votes-label"> votes</span>
              </div>
            </div>
          </div>
          
          {!gameEnded && (
            <div className="next-round-info">
              <p className="countdown-text">Preparing next round...</p>
            </div>
          )}
          
          {gameEnded && (
            <div className="game-complete-info">
              <p className="game-complete-text">🎊 Game Complete! 🎊</p>
              <p className="leaderboard-text">Preparing final results...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FinalLeaderboard = () => {
    if (!showFinalLeaderboard) return null;

    return (
      <div className="leaderboard-overlay">
        <div className="leaderboard-popup">
          <div className="leaderboard-header">
            <h2 className="leaderboard-title">🏆 Final Results 🏆</h2>
          </div>
          
          <div className="leaderboard-list">
            {playerScores.map((player, index) => (
              <div key={player.user.id} className={`leaderboard-item ${index === 0 ? 'winner' : ''}`}>
                <div className="player-rank">
                  {index === 0 ? '👑' : `#${index + 1}`}
                </div>
                <img
                  src={player.user.avatar || '/avatars/1.png'}
                  alt={`${player.user.username}'s avatar`}
                  className="player-avatar"
                />
                <div className="player-info">
                  <span className="player-name">{player.user.username}</span>
                  {index === 0 && <span className="winner-badge">Champion!</span>}
                </div>
                <div className="player-points">
                  <span className="points-value">{player.points}</span>
                  <span className="points-label">pts</span>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="close-leaderboard-btn"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
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
                        className={`vote-button ${submission.hasUserVoted ? 'voted' : ''} ${userHasVoted && !submission.hasUserVoted ? 'disabled' : ''} ${submission.isUserSubmitter ? 'disabled' : ''}`}
                        onClick={() => handleVote(submission.deezerSongId)}
                        disabled={userHasVoted || timeRemaining === '0:00' || submission.isUserSubmitter}
                      >
                        {submission.hasUserVoted ? 'Voted ✓' : submission.isUserSubmitter ? 'Your Song' : 'Vote'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ResultsPopup />
          <FinalLeaderboard />
        </>
      )}
    </div>
  );
};

export default VotingPage;