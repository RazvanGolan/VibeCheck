import './MainPage.css';
import { useAuth } from '../context/AuthProvider';
import { useState } from 'react';

function MainPage() {
    const { isAuthenticated } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [gameCode, setGameCode] = useState('');

    // Mock games data - this would come from your SignalR hub
    const liveGames = [
        {
            id: 'game-1',
            gameMode: 'Classic Mode',
            playerCount: 3,
            maxPlayers: 8,
            rounds: 5,
            code: 'ABC123',
            hostName: 'MusicMaster'
        },
        {
            id: 'game-2',
            gameMode: 'Speed Round',
            playerCount: 2,
            maxPlayers: 4,
            rounds: 3,
            code: 'XYZ789',
            hostName: 'BeatDropper'
        },
        {
            id: 'game-3',
            gameMode: 'Theme Battle',
            playerCount: 5,
            maxPlayers: 6,
            rounds: 7,
            code: 'LMN456',
            hostName: 'TuneTitan'
        },
        {
            id: 'game-4',
            gameMode: 'Classic Mode',
            playerCount: 4,
            maxPlayers: 8,
            rounds: 5,
            code: 'PQR321',
            hostName: 'RhythmRuler'
        },
    ];

    const gamesPerPage = 3;
    const pageCount = Math.ceil(liveGames.length / gamesPerPage);
    const visibleGames = liveGames.slice(
        currentPage * gamesPerPage, 
        (currentPage + 1) * gamesPerPage
    );

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % pageCount);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + pageCount) % pageCount);
    };

    const handleJoinGame = () => {
        if (gameCode.trim()) {
            console.log(`Joining game with code: ${gameCode}`);
            // Here you would call your API to join the game
            setGameCode('');
            setShowJoinInput(false);
        }
    };

    return (
        <div className="container">
            <div className="start-playing">
                <div className="start-playing-content">
                    <h1 className="hero-title">Battle with Music, Win with Taste</h1>
                    <p className="hero-subtitle">Compete with friends to find the perfect song for any moment. Vote, rank, and crown the ultimate music curator!</p>
                    
                    {isAuthenticated ? (
                        <div className="auth-buttons">
                            <button className="play-button create">Create a Room</button>
                            
                            <div className="join-container">
                                {showJoinInput ? (
                                    <div className="join-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Enter game code" 
                                            value={gameCode}
                                            onChange={(e) => setGameCode(e.target.value)}
                                            className="game-code-input"
                                            onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                                        />
                                        <button 
                                            className="game-code-submit" 
                                            onClick={handleJoinGame}
                                        >
                                            &#8594;
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        className="play-button join" 
                                        onClick={() => setShowJoinInput(true)}
                                    >
                                        Join a Room
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button className="play-button">Start Playing</button>
                    )}
                </div>
            </div>
            <div className="into">
                <h2 className="section-title">How VibeCheck Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/group-icon.png" alt="Group" className="step-icon" />
                        </div>
                        <h3 className="step-title">Rally Your Crew</h3>
                        <p className="step-description">Create a room and invite your friends to join the musical showdown</p>
                    </div>
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/sound-icon.png" alt="Music" className="step-icon" />
                        </div>
                        <h3 className="step-title">Pick Your Songs</h3>
                        <p className="step-description">Choose the perfect track that matches the round's theme</p>
                    </div>
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/vote-icon.png" alt="Vote" className="step-icon" />
                        </div>
                        <h3 className="step-title">Vote for the Best</h3>
                        <p className="step-description">Listen to every entry and vote for the track that nails the vibe</p>
                    </div>
                </div>
            </div>
            <div className="live-games">
                <h2 className="section-title">Live Games</h2>

                <div className="games-carousel">
                    {pageCount > 1 && currentPage > 0 && (
                        <button className="carousel-arrow left" onClick={prevPage}>
                            &lt;
                        </button>
                    )}

                    <div className={`games-container ${liveGames.length <= 2 ? 'few-items' : ''}`}>
                        {visibleGames.map((game) => (
                            <div className="game-card" key={game.id}>
                                <div className="game-header">
                                    <h3>{game.gameMode}</h3>
                                    <span className="game-code">Code: {game.code}</span>
                                </div>
                                <div className="game-details">
                                    <div className="host-info">
                                        <span className="host-label">Host</span>
                                        <span className="host-name">{game.hostName}</span>
                                    </div>
                                    <div className="game-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span className="stat-value">{game.playerCount}/{game.maxPlayers}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">🔄</span>
                                            <span className="stat-value">{game.rounds} rounds</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="join-button">Join Game</button>
                            </div>
                        ))}
                    </div>
                    
                    {pageCount > 1 && currentPage < pageCount - 1 && (
                        <button className="carousel-arrow right" onClick={nextPage}>
                            &gt;
                        </button>
                    )}
                </div>
                
                <div className="pagination-dots">
                    {Array.from({ length: pageCount }).map((_, index) => (
                        <span 
                            key={index}
                            className={`dot ${currentPage === index ? 'active' : ''}`}
                            onClick={() => setCurrentPage(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="community-banner">
                <div className="community-content">
                    <h2 className="community-title">Join Our Growing Community</h2>
                    <p className="community-description">Connect with music lovers, create memorable playlists, and discover new tracks together.</p>
                    <div className="community-stats">
                        <div className="stat-block">
                            <span className="stat-number">10k+</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-number">5k+</span>
                            <span className="stat-label">Games Played</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-number">50k+</span>
                            <span className="stat-label">Songs Shared</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainPage;
