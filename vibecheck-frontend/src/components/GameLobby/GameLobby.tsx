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
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  const [copied, setCopied] = useState(false);

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
    
    signalR.removeEventListener("PlayerJoined");
    signalR.removeEventListener("PlayerLeft");
    signalR.removeEventListener("GameStateChanged");
    
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

  if (isLoading) {
    return <div className="loading">Loading game lobby...</div>;
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

        <div className="settings-grid">
          <div className="setting-box">
            <span className="setting-label">Rounds</span>
            <span className="setting-value">{game.rounds}</span>
          </div>
          <div className="setting-box">
            <span className="setting-label">Time per Round</span>
            <span className="setting-value">{game.timePerRound}s</span>
          </div>
        </div>

        <div className="player-grid">
          {game.participants.map((participant) => (
            <div className="player-slot" key={participant.id}>
              <img
                src={participant.avatar || "/avatars/1.png"}
                alt={`${participant.username}'s avatar`}
                className="player-avatar-small"
              />
              <span>{participant.username}</span>
              {participant.id === game.hostUserId && <span className="host-indicator">(Host)</span>}
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
