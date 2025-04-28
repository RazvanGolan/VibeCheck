import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useSignalR } from '../../context/SignalRProvider';
import './GameLobby.css';
import { User } from '../../types/user';

type GameDetails = {
  gameId: string;
  code: string;
  hostUserId: string;
  currentRound: number;
  totalRounds: number;
  timePerRound: number;
  playersLimit: number;
  gameMode: string;
  status: string;
  participants: User[];
  // Define the currentRound property that might be causing the issue
  rounds?: {
    roundId: string;
    roundNumber: number;
    status: number;
    startTime: string;
    endTime: string;
    theme: {
      id: string;
      name: string;
    };
    songs: any[];
  };
};

const GameLobby: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const signalR = useSignalR();
  
  const [game, setGame] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
      
      return gameData;
    } catch (err) {
      setError('Failed to load game data. Please try again.');
      return null;
    }
  }, [gameId, user, API_BASE_URL]);

  const setupSignalRHandlers = useCallback(() => {
    if (!signalR.connection || !signalR.isConnected) {
      return;
    }
    
    // Clean up any existing handlers to prevent duplicates
    signalR.removeEventListener("PlayerJoined");
    signalR.removeEventListener("PlayerLeft");
    signalR.removeEventListener("GameStateChanged");
    
    // Register new handlers
    signalR.onPlayerJoined((updatedParticipants: User[]) => {
      setGame(prevGame => {
        if (!prevGame) return null;
        return {
          ...prevGame,
          participants: updatedParticipants
        };
      });
    });
    
    signalR.onPlayerLeft((updatedParticipants: User[]) => {
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
    hasJoinedGroup, 
    setupSignalRHandlers, 
    initialSetupComplete
  ]);

  // This effect runs when the SignalR connection is established to set up handlers
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

  // Cleanup effect to leave the game group and remove event listeners when the component unmounts
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
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Game/UpdateGame/${gameId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'Active'
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      navigate(`/gameroom/${gameId}`);
    } catch (err) {
      setError('Failed to start the game. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading game lobby...</div>;
  }

  if (error || !game) {
    return <div className="error-message">{error || 'Game not found'}</div>;
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">Game Lobby</h1>
        <div className="game-code-display">
          Code: <span className="game-code-value">{game.code}</span>
        </div>
      </div>
      
      <div className="lobby-content">
        <div className="game-settings">
          <div className="setting-item">
            <span className="setting-icon">🎮</span>
            <span className="setting-value">{game.gameMode}</span>
          </div>
          <div className="setting-item">
            <span className="setting-icon">🔄</span>
            <span className="setting-value">{game.totalRounds} rounds</span>
          </div>
          <div className="setting-item">
            <span className="setting-icon">⏱️</span>
            <span className="setting-value">{game.timePerRound} seconds</span>
          </div>
        </div>
        
        <div className="players-section">
          <h2 className="section-title">Players ({game.participants.length}/{game.playersLimit})</h2>
          <div className="players-list">
            {game.participants.map((user) => (
              <div className="player-card" key={user.id}>
                <img 
                  src={user.avatar || "/avatars/1.png"} 
                  alt={`${user.username}'s avatar`} 
                  className="player-avatar" 
                />
                <span className="player-name">
                  {user.username}
                  {user.id === game.hostUserId && (
                    <span className="host-badge">Host</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          
          {game.participants.length < 2 && (
            <p className="waiting-message">Waiting for more players to join...</p>
          )}
        </div>
        
        <div className="lobby-actions">
          <button className="leave-button" onClick={handleLeaveGame}>
            Leave Game
          </button>
          
          {isHost && (
            <button 
              className="start-button" 
              onClick={handleStartGame}
              disabled={game.participants.length < 2}
            >
              {game.participants.length < 2 ? 'Need More Players' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
