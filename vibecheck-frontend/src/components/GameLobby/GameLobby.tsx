import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import './GameLobby.css';
import { UserDto } from '../../types/user';
import { GameDetails } from '../../types/gameTypes';
import QRCode from 'react-qr-code';

const GameLobby: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signalR = useSignalR();
  
  const [game, setGame] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [pendingGameJoin, setPendingGameJoin] = useState<string | null>(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const CURRENT_URL = window.location.origin;

  // Check if the current user is a participant in the game
  const checkAuthorization = useCallback((gameData: GameDetails | null) => {
    if (!gameData || !user) return true;
    
    if (pendingGameJoin)
      return true;

    const isParticipant = gameData.participants.some(participant => participant.userId === user.id);
    
    if (!isParticipant) {
      setIsAuthorized(false);
      return false;
    }
    
    return true;
  }, [user, pendingGameJoin]);

  const fetchGameDetails = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/Game/GetGame/${gameId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      
      const gameData: GameDetails = await response.json();
      setGame(gameData);
      
      if (user) {
        setIsHost(gameData.hostUserId === user.id);
      }
      
      checkAuthorization(gameData);
      
      return gameData;
    } catch (err) {
      setError('Failed to load game data. Please try again.');
      return null;
    }
  }, [gameId, user, API_BASE_URL, checkAuthorization]);

  const setupSignalRHandlers = useCallback(() => {
    if (!signalR.connection || !signalR.isConnected) {
      return;
    }
    
    signalR.removeEventListener("PlayerJoined");
    signalR.removeEventListener("PlayerLeft");
    signalR.removeEventListener("GameStateChanged");
    signalR.removeEventListener("GameStarted");
    
    signalR.onPlayerJoined((updatedParticipants: UserDto[]) => {
      setGame(prevGame => {
        if (!prevGame) return null;
        return {
          ...prevGame,
          participants: updatedParticipants
        };
      });
    });
    
    signalR.onPlayerLeft((updatedParticipants: UserDto[]) => {
      setGame(prevGame => {
        if (!prevGame) return null;
        return {
          ...prevGame,
          participants: updatedParticipants
        };
      });
    });
    
    signalR.onGameStateChanged((gameStatus: string) => {
      setGame(prevGame => {
        if (!prevGame) return null;
        return {
          ...prevGame,
          status: gameStatus
        };
      });
      
      if (gameStatus === 'Active') {
        navigate(`/gameroom/${gameId}`);
      }
    });
    
    signalR.onGameStarted((gameData: GameDetails) => {
      setGame(gameData);
      // Redirect all users to the select page of the game
      navigate(`/select/${gameId}`);
    });
  }, [signalR, gameId, navigate]);

  useEffect(() => {
    const initializeLobby = async () => {
      if (!gameId || !user || initialSetupComplete) return;
      
      try {
        setIsLoading(true);
        
        if (!signalR.isConnected) {
          await signalR.connectToHub();
        }
        
        const gameData = await fetchGameDetails();
        if (!gameData) {
          return;
        }

        checkAuthorization(gameData);
        setupSignalRHandlers();
        
        if (signalR.isConnected && gameData.code && !hasJoinedGroup) {
          const joined = await signalR.joinGameGroup(gameData.code);
          if (joined) {
            setHasJoinedGroup(true);
            setInitialSetupComplete(true);
          } else {
            setError("Failed to join game communications. Please try again.");
          }
        }
      } catch (err) {
        setError('Failed to set up game lobby. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLobby();
  }, [
    gameId, 
    user, 
    fetchGameDetails, 
    signalR.isConnected,
    signalR,
    hasJoinedGroup, 
    setupSignalRHandlers, 
    initialSetupComplete,
    checkAuthorization,
    navigate
  ]);

  useEffect(() => {
    if (signalR.isConnected) {
      setupSignalRHandlers();
    }
  }, [signalR.isConnected, setupSignalRHandlers]);

  useEffect(() => {
    const joinGameGroupWhenConnected = async () => {
      if (signalR.isConnected && game?.code && !hasJoinedGroup) {
        const joined = await signalR.joinGameGroup(game.code);
        if (joined) {
          setHasJoinedGroup(true);
        } else {
          setError("Failed to join game communications. Please try again.");
        }
      }
    };

    joinGameGroupWhenConnected();
  }, [signalR.isConnected, game?.code, hasJoinedGroup, signalR]);

  useEffect(() => {
    return () => {
      if (signalR.connection && hasJoinedGroup && game?.code) {
        signalR.removeEventListener("PlayerJoined");
        signalR.removeEventListener("PlayerLeft");
        signalR.removeEventListener("GameStateChanged");
        
        signalR.leaveGameGroup(game.code).then(success => {
        });
      }
    };
  }, [signalR, hasJoinedGroup, game?.code]);

  const handleLeaveGame = async () => {
    if (!gameId || !user || !game) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Game/LeaveGame/${gameId}/${user.id}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to leave game');
      }
      
      if (hasJoinedGroup && game.code) {
        await signalR.leaveGameGroup(game.code);
      }
      
      navigate('/');
    } catch (err) {
      setError('Failed to leave game. Please try again.');
    }
  };

  const handleStartGame = async () => {
    if (!gameId || !isHost || !game) return;
      
    // Trigger the StartGame event on the hub to notify all players
    if (signalR.connection && signalR.isConnected && game.code) {
      try {
        await signalR.connection.invoke("StartGame", game.code);
        // The navigation will happen in the GameStarted event handler
      } catch (err) {
        console.error("Error starting game:", err);
        setError("Failed to start game. Please try again.");
      }
    } else {
      console.error("SignalR connection is not established.");
      setError("Failed to start game. Please try again.");
    }
  };

  const handleCopyCode = () => {
    if (game?.code) {
      navigator.clipboard.writeText(game.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (game?.code) {
      const inviteLink = `${CURRENT_URL}/lobby/${gameId}?invite=${game.code}`;
      navigator.clipboard.writeText(inviteLink).then(() => {
        setCopiedInviteLink(true);
        setTimeout(() => setCopiedInviteLink(false), 1500);
      }).catch(err => {
        console.error('Failed to copy invite link: ', err);
      });
    }
  };

  const toggleQRCodeModal = () => {
    setShowQRCodeModal(prev => !prev);
  };

  // Handle authentication and join game process
  useEffect(() => {
    const joinGameWithToken = async () => {
      if (pendingGameJoin && user && isAuthenticated) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/Game/JoinGame/${pendingGameJoin}/${user.id}`,
            { method: 'POST' }
          );
          
          if (response.ok) {
            const gameData = await response.json();
            navigate(`/lobby/${gameData.gameId}`, { replace: true });
          } else {
            setError('Failed to join game. The invite might be invalid or expired.');
          }
        } catch (err) {
          setError('An error occurred while joining the game.');
        }
      }
    };
    
    if (!isAuthenticated && pendingGameJoin) {
      navigate('/login', { 
        state: { 
          from: `/lobby/${gameId}?invite=${pendingGameJoin}` 
        } 
      });
      return;
    }

    joinGameWithToken();
  }, [pendingGameJoin, user, isAuthenticated, API_BASE_URL, gameId, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const inviteToken = searchParams.get('invite');
    
    if (inviteToken) {
      setPendingGameJoin(inviteToken);
    }

    if (!isAuthorized && !pendingGameJoin) {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 3500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthorized, location.search, navigate, pendingGameJoin]);

  if (isLoading) {
    return <div className="loading">Loading game lobby...</div>;
  }

  if (!isAuthorized && !pendingGameJoin) {
    return (
      <div>
        <div style={{fontSize: "30px", color: "red", fontFamily:"cursive", fontWeight:"500"}}>You are not authorized to access this game. Leave now or you shall regret it.</div>
        <img src="https://media1.tenor.com/m/Rv-IfOOXPSIAAAAC/you-shall-not-pass-lotr.gif" alt="Gandalf - You Shall Not Pass" style={{marginTop: "60px", width: "100%", textAlign: "center"}}/>
      </div>
    );
  }

  if (error || !game) {
    return <div className="error-message">{error || 'Game not found'}</div>;
  }

  return (
    <div className="lobby-wrapper">
      <div className="lobby-container">
        <h1 className="lobby-title">Game Lobby</h1>
        <p className="lobby-subtitle wave-text">
          {'Waiting for players to join...'.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>

        <div className="lobby-top-info">
          <div className="info-item">
            <span className="info-label">Room Code</span>
            <div className="info-value-container clickable" onClick={handleCopyCode} title="Click to copy code">
              <span className="info-value code">{game.code}</span>
              <span className="copy-icon">{copied ? '✅' : '📋'}</span> 
              {copied && <span className="copied-text">Copied!</span>}
            </div>
          </div>
          <div className="info-item text-right">
            <span className="info-label">Players</span>
            <span className="info-value">{game.participants.length}/{game.playersLimit} joined</span>
          </div>
        </div>

        <div className="invite-link-container">
            <div className="invite-link-wrapper">
              <button className="copy-invite-link-button" onClick={handleCopyInviteLink}>
                {copiedInviteLink ? 'Copied!' : 'Copy Invite Link'}
              </button>
              <button className="qr-code-button" onClick={toggleQRCodeModal}>
                Show QR Code
              </button>
            </div>
          </div>

          {showQRCodeModal && (
            <div className="qr-code-modal-overlay" onClick={toggleQRCodeModal}>
              <div className="qr-code-modal" onClick={e => e.stopPropagation()}>
                <h3>Scan QR Code to Join</h3>
                <div className="qr-code-container">
                  {game?.code && (
                    <QRCode
                      value={`${CURRENT_URL}/lobby/${gameId}?invite=${game.code}`}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                    />
                  )}
                </div>
                <button className="close-qr-button" onClick={toggleQRCodeModal}>Close</button>
              </div>
            </div>
          )}

        <div className="settings-grid">
          <div className="setting-box">
            <span className="setting-label">Rounds</span>
            <span className="setting-value">{game.rounds.length}</span>
          </div>
          <div className="setting-box">
            <span className="setting-label">Time per Round</span>
            <span className="setting-value">{game.timePerRound}s</span>
          </div>
        </div>

        <div className="player-grid">
          {game.participants.map((participant) => (
            <div className="player-slot" key={participant.userId}>
              <img
                src={participant.avatar || "/avatars/1.png"}
                alt={`${participant.username}'s avatar`}
                className="player-avatar-small"
              />
              <span>
                {participant.username} 
                {participant.userId === game.hostUserId && (
                  <span className="host-indicator">
                    <svg className="crown-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                    </svg>
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {isHost && (
          <button
            className="start-game-button"
            onClick={handleStartGame}
            disabled={game.participants.length < 1}
          >
            Start Game
          </button>
        )}
        
         <button className="leave-game-button" onClick={handleLeaveGame}>
            Leave Game
          </button>
      </div>
    </div>
  );
};

export default GameLobby;
