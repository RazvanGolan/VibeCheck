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
  rounds: number;
  timePerRound: number;
  playersLimit: number;
  gameMode: string;
  status: string;
  participants: User[];
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
      console.error('Error fetching game details:', err);
      setError('Failed to load game data. Please try again.');
      return null;
    }
  }, [gameId, user, API_BASE_URL]);

  useEffect(() => {
    
    const setupSignalRHandlers = () => {
      if (!signalR.connection || !signalR.isConnected) {
        console.log('SignalR not connected yet, will try again when connected');
        return;
      }
            
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
    };

    setupSignalRHandlers();
  }, [signalR.isConnected]);

  useEffect(() => {
    const initializeLobby = async () => {
      if (!gameId || !user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch game details first
        const gameData = await fetchGameDetails();
        if (!gameData) return;
        
        // Manually initiate SignalR connection if not already connected
        if (!signalR.isConnected) {
          await signalR.connectToHub();
        }
        
        // Only try to join if we're connected and haven't joined already
        if (signalR.isConnected && gameData.code && !hasJoinedGroup) {
          const joined = await signalR.joinGameGroup(gameData.code);
          if (joined) {
            setHasJoinedGroup(true);
          } else {
            setError("Failed to join game communications. Please try again.");
          }
        }
      } catch (err) {
        console.error('Error initializing game lobby:', err);
        setError('Failed to set up game lobby. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLobby();
  }, [gameId, user, fetchGameDetails, signalR, hasJoinedGroup]);

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
      console.error('Error leaving game:', err);
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
      console.error('Error starting game:', err);
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
            <span className="setting-value">{game.rounds} rounds</span>
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
