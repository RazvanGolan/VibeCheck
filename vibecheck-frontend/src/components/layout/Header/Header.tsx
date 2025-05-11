import './Header.css';
import { useAuth } from '../../../context/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useSignalR } from '../../../context/SignalRProvider';
import { GameDetails } from '../../../types/gameTypes';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface HeaderProps {
  hideProfileSection?: boolean;
}

function Header({ hideProfileSection = false }: HeaderProps): React.ReactElement {
    const { isAuthenticated, user, signOut } = useAuth();
    const navigate = useNavigate();
    const signalR = useSignalR();
    const { gameId } = useParams<{ gameId: string }>();
    const [game, setGame] = useState<GameDetails | null>(null);
    const [hasJoinedGroup, setHasJoinedGroup] = useState(false);

    const fetchGameDetails = useCallback(async () => {
        if (!gameId || !user) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/Game/GetGame/${gameId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch game details');
            }
            
            const gameData: GameDetails = await response.json();
            setGame(gameData);
            
            if (signalR.isConnected && gameData.code && !hasJoinedGroup) {
                const joined = await signalR.joinGameGroup(gameData.code);
                if (joined) {
                    setHasJoinedGroup(true);
                }
            }
            
            return gameData;
        } catch (err) {
            console.error('Error fetching game details:', err);
            return null;
        }
    }, [gameId, user, signalR, hasJoinedGroup]);

    useEffect(() => {
        fetchGameDetails();
    }, [fetchGameDetails]);

    const handleNavigateToLogin = (): void => {
        navigate('/login');
    };

    const handleNavigateToHome = async (): Promise<void> => {
        if (!gameId || !user || !game) {
            navigate('/');
            return;
        }

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
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="logo-small">
                <span className="music-icon">♪</span>
                <span className="title" onClick={handleNavigateToHome} style={{ cursor: 'pointer' }}>VibeCheck</span>
            </div>

            {!hideProfileSection && (
                isAuthenticated ? (
                    <div className="user-profile">
                        <div className="avatar-container">
                            <img 
                                src={user?.avatar} 
                                alt="User avatar"
                                className="user-avatar" 
                            />
                            <img 
                                src="/assets/icons/dropdown-arrow.png" 
                                alt="Dropdown" 
                                className="dropdown-arrow"
                            />
                        </div>
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={signOut}>
                                Sign Out
                            </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={handleNavigateToLogin} className="sign-in-button">Sign In</button>
                )
            )}
        </header>
    );
}

export default Header;
