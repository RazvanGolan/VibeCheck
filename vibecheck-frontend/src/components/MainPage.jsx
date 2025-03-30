import './MainPage.css';
import { useAuth } from '../context/AuthProvider';
import { useState } from 'react';

function MainPage() {
    const { isAuthenticated, user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);

    // Mock games data - this would come from your SignalR hub
    const mockGames = [
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

    // Calculate pagination
    const gamesPerPage = 3;
    const pageCount = Math.ceil(mockGames.length / gamesPerPage);
    const visibleGames = mockGames.slice(
        currentPage * gamesPerPage, 
        (currentPage + 1) * gamesPerPage
    );

    // Navigation handlers
    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % pageCount);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + pageCount) % pageCount);
    };

    return (
        <div className="container">
            <div className="start-playing">
                <div className="start-playing-content">
                    <h1 className="hero-title">Battle with Music, Win with Taste</h1>
                    <p className="hero-subtitle">Compete with friends to find the perfect song for any moment. Vote, rank, and crown the ultimate music curator!</p>
                    <button className="play-button">Start Playing</button>
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

                    <div className={`games-container`}>
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
            <div className="create-account">

            </div>
        </div>
    );
}

export default MainPage;
