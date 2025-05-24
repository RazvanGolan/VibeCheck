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
  const [roundEndingCountdown, setRoundEndingCountdown] = useState<number | null>(null);
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
        setRoundEndingCountdown(null);
        
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
  }, [signalR, game, user?.id, gameId, isHost, navigate]);

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
  }, [gameId, endTimeRef.current]);

  // Re-sync time every 10 seconds to prevent drift and stay synchronized
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (gameId) {
        signalR.requestRoundTimeSync(gameId);
      }
    }, 10000);
    
    return () => clearInterval(syncInterval);
  }, [gameId, signalR]);

  useEffect(() => {
    if (roundEndingCountdown === null) return;
      
    // If countdown reaches zero, start the next round
    if (roundEndingCountdown === 0) {    
      // Start the next round
      if (signalR.connection && gameId && isHost) {
        (async () => {
          try {
            if (signalR.connection && gameId)
              await signalR.connection.invoke("StartRound", gameId);
          } catch (err) {
            console.error("Error starting next round:", err);
            // Reset states if there's an error so we can try again
            setNextRoundTriggered(false);
            setRoundEndingCountdown(null);
            roundCompleteTriggeredRef.current = false;
          }
        })();
      }
      return;
    }
    
    // Set up the interval to decrement the countdown
    const intervalId = setInterval(() => {
      setRoundEndingCountdown(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up the interval when the component unmounts or when countdown changes
    return () => clearInterval(intervalId);
  }, [roundEndingCountdown, signalR.connection, gameId, isHost]);

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
    // Find the song submission
    const submission = submissions.find(sub => sub.deezerSongId === songId);
    
    // Return if user can't vote or if this is the user's submission
    if (!gameId || !user || !currentRound || userHasVoted || (submission && submission.isUserSubmitter)) return;

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

  // Handle round completion
  const handleRoundComplete = () => {
    if (roundCompleteTriggeredRef.current) return;
    roundCompleteTriggeredRef.current = true;
    setNextRoundTriggered(true);

    // Show results popup with winner immediately
    if (submissions.length > 0) {
      const winner = submissions[0];
      setRoundWinner(winner);
      setShowResultsPopup(true);
      
      // Auto-play the winning song
      if (audioRef.current && winner.song.previewUrl) {
        audioRef.current.pause();
        audioRef.current.src = winner.song.previewUrl;
        audioRef.current.play().catch(err => {
          console.error('Error playing winning song:', err);
        });
        setCurrentlyPlaying(winner.id);
      }
    }

    if (game && game.currentRound === game.totalRounds) {
      setGameEnded(true);
      // Calculate final scores
      calculateFinalScores();
      return;
    }

    // Set up popup timer to show for exactly 10 seconds
    popupTimerRef.current = setTimeout(() => {
      setShowResultsPopup(false);
      setRoundEndingCountdown(10);
    }, 10000);
  };

  const calculateFinalScores = () => {
    if (!game) return;
    
    const scores: {[userId: string]: {user: User, points: number}} = {};
    
    // Initialize scores for all participants
    game.participants.forEach(participant => {
      scores[participant.userId] = {
        user: {
          id: participant.userId,
          username: participant.username,
          avatar: participant.avatar
        },
        points: 0
      };
    });
    
    // Calculate points from all rounds
    game.rounds.forEach(round => {
      round.songs.forEach(song => {
        // Award points to submitters based on votes received
        song.users?.forEach(submitter => {
          if (scores[submitter.userId]) {
            scores[submitter.userId].points += song.voteCount;
          }
        });
      });
    });
    
    // Convert to array and sort by points
    const sortedScores = Object.values(scores).sort((a, b) => b.points - a.points);
    setPlayerScores(sortedScores);
    
    // Show final leaderboard after 10 seconds
    popupTimerRef.current = setTimeout(() => {
      setShowResultsPopup(false);
      setShowFinalLeaderboard(true);
    }, 10000);
  };

  // Clean up popup timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

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
          
          {!gameEnded && roundEndingCountdown !== null && (
            <div className="next-round-info">
              <p className="countdown-text">Next round starting in</p>
              <div className="countdown-timer">{roundEndingCountdown}</div>
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
                        <div className="submitter-info">
                          {submission.users.length > 0 ? (
                            <>
                              <div className="submitter-avatars">
                                {submission.users.map((user, i) => (
                                  <img 
                                    key={user.userId}
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
                                  <span key={user.userId}>
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