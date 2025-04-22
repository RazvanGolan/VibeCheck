import React, { useState } from 'react';
import Layout from '../Layout/Layout';
import './GameLobby.css';


// Dummy Player Type for test only ..... CHANGE
interface Player {
    id: number;
    name: string;
    isHost: boolean;
}

const GameLobby = () => {
    // Placeholder state - replace with actual data/props later
    const [rounds, setRounds] = useState(5);
    const [timePerRound, setTimePerRound] = useState(60);
    const roomCode = "ABC123";
    // Use the Player interface
    const players: Player[] = [
        { id: 1, name: 'Player 1', isHost: true },
        { id: 2, name: 'Player 2', isHost: false },
        { id: 3, name: 'Player 3', isHost: false },
        { id: 4, name: 'Player 4', isHost: false },
    ];
    const maxPlayers = 8;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        // Optional: show a notification "Code copied!"
    };

    // Create an array representing all player slots
    const playerSlots = Array.from({ length: maxPlayers }).map((_, index) => {
        return players[index] ? players[index] : null; // Fill with player data or null
    });

    // Determine if the current user is the host (assuming first player is host for placeholder logic)
    const isCurrentUserHost = players[0]?.isHost ?? false;

    const waitingText = "Waiting...";

    return (
        <Layout>
            <div className="game-lobby-container">
                <h1 className="lobby-title">Game Lobby</h1>
                <p className="lobby-subtitle">Waiting for players to join...</p>

                <div className="lobby-info-section">
                    <div className="info-item room-code">
                        <span>Room Code</span>
                        <div className="room-code-value">
                            <strong>{roomCode}</strong>
                            <button onClick={handleCopyCode} className="copy-button" aria-label="Copy room code">
                                {/* <FaClipboard /> */} 📄 {/* Changed icon slightly */} 
                            </button>
                        </div>
                    </div>
                    <div className="info-item player-count">
                        <span>Players</span>
                        <strong>{players.length}/{maxPlayers} joined</strong>
                    </div>
                </div>

                <div className="lobby-settings-section">
                    <div className="setting-item">
                        <label>Rounds</label>
                        <div className="setting-control">
                            <button onClick={() => setRounds(r => Math.max(1, r - 1))} disabled={!isCurrentUserHost}>-</button>
                            <span>{rounds}</span>
                            <button onClick={() => setRounds(r => r + 1)} disabled={!isCurrentUserHost}>+</button>
                        </div>
                    </div>
                    <div className="setting-item">
                        <label>Time per Round</label>
                        <div className="setting-control">
                            <button onClick={() => setTimePerRound(t => Math.max(30, t - 15))} disabled={!isCurrentUserHost}>-</button>
                            <span>{timePerRound}s</span>
                            <button onClick={() => setTimePerRound(t => t + 15)} disabled={!isCurrentUserHost}>+</button>
                        </div>
                    </div>
                </div>

                <div className="player-list-section">
                    {/* Map over the combined playerSlots array */}
                    {playerSlots.map((player, index) => (
                        <div key={player ? `player-${player.id}` : `placeholder-${index}`} 
                             className={`player-card ${!player ? 'placeholder' : ''}`}>
                            <div className="player-avatar">
                                {player ? (player.isHost ? '👩‍💼' : '🧑') : '❓'}
                            </div>
                            {player ? (
                                <span className="player-name">{player.name}</span>
                            ) : (
                                <span className="player-name waiting-text">
                                    {waitingText.split('').map((letter, letterIndex) => (
                                        <span 
                                            key={letterIndex} 
                                            className="wavy-letter"
                                            style={{ animationDelay: `${letterIndex * 0.1}s` }} // Stagger the animation
                                        >
                                            {letter === ' ' ? '\u00A0' : letter}
                                        </span>
                                    ))}
                                </span>
                            )}
                            {player?.isHost && (
                                <div className="host-indicator" aria-label="Host">
                                    {/* <FaCrown /> */} 👑
                                </div>
                            )}
                            {player && !player.isHost && (
                                 <div className="player-icon" aria-label="Player">
                                     🎤
                                 </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="lobby-actions">
                     {/* Disable button if not host or not enough players */} 
                    <button className="start-game-button" disabled={!isCurrentUserHost || players.length < 2}>
                        Start Game
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default GameLobby; 