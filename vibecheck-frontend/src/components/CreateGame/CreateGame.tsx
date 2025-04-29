import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateGame.css';
import { GameMode, GameSettings, defaultGameSettings, PrivacyType } from '../../types/gameSettings';
import { useAuth } from '../../context/AuthProvider';

interface LocationState {
  username?: string;
}

const CreateRoom = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gameMode, setGameMode] = useState<GameMode>(defaultGameSettings.gameMode);
  const [rounds, setRounds] = useState<number>(defaultGameSettings.rounds);
  const [timePerRound, setTimePerRound] = useState<number>(defaultGameSettings.timePerRound);
  const [playersLimit, setPlayersLimit] = useState<number>(defaultGameSettings.playersLimit);
  const [privacy, setPrivacy] = useState<PrivacyType>(defaultGameSettings.privacy);
  const [selectedThemeCategories, setSelectedThemeCategories] = useState<string[]>(defaultGameSettings.selectedThemeCategories);
  const [customThemes, setCustomThemes] = useState<string[]>(defaultGameSettings.customThemes);
  
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [themeFeedback, setThemeFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const themeCategories = [
    'Road Trip', 'Party', 'Workout', 
    'Romance', 'Decades', 'Movies'
  ];

  const handleThemeToggle = (theme: string) => {
    setSelectedThemeCategories(prevThemes => 
      prevThemes.includes(theme) 
        ? prevThemes.filter(t => t !== theme)
        : [...prevThemes, theme]
    );
  };

  useEffect(() => {
    if (themeFeedback) {
      const timer = setTimeout(() => {
        setThemeFeedback('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [themeFeedback]);

  const handleAddCustomTheme = () => {
    const themeToAdd = customThemeInput.trim();
    if (!themeToAdd) {
      setThemeFeedback('Theme cannot be empty.');
      return; 
    }
    
    if (customThemes.includes(themeToAdd)) {
      setThemeFeedback(`Theme "${themeToAdd}" already added!`);
      return;
    }

    setCustomThemes([...customThemes, themeToAdd]);
    setCustomThemeInput('');
    setThemeFeedback('');
  };

  const handleRemoveCustomTheme = (theme: string) => {
    setCustomThemes(customThemes.filter(t => t !== theme));
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be logged in to create a game.");
      return;
    }

    setIsLoading(true);

    const payload = {
      hostUserId: user.id,
      rounds,
      playersLimit,
      timePerRound,
      privacy,
      mode: gameMode,
      selectedThemeCategories: gameMode === GameMode.Classic ? [] : selectedThemeCategories,
      customThemes
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/Game/CreateGame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text(); 
        throw new Error(errorData || 'Failed to create game');
      }

      const newGame = await response.json();
      
      if (newGame && newGame.gameId) {
        navigate(`/lobby/${newGame.gameId}`);
      } else {
        throw new Error('Game created, but no game ID received.');
      }

    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const showThemeCategories = gameMode !== GameMode.Classic;

  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === '') {
        setter('' as unknown as number);
      }
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        setter(value);
      }
  };

  return (
    <div className="create-room-container">
      <div className="create-room-card">
        <div className="create-room-content">
          <h1>Create New Game</h1>
          {error && <p className="error-message">Error: {error}</p>}

          <form onSubmit={handleCreateGame} className="create-room-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gameMode">Game Mode</label>
                <select 
                  id="gameMode" 
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
                  disabled={isLoading}
                >
                  <option value={GameMode.Classic}>{GameMode.Classic}</option>
                  <option value={GameMode.Party}>{GameMode.Party}</option>
                  <option value={GameMode.Challenge}>{GameMode.Challenge}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rounds">Number of Rounds</label>
                <input 
                  type="number" 
                  id="rounds" 
                  value={rounds} 
                  onChange={handleNumberChange(setRounds)}
                  min="1"
                  max="20"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timePerRound">Time per Round (Seconds)</label>
                <input 
                  type="number" 
                  id="timePerRound" 
                  value={timePerRound}
                  onChange={handleNumberChange(setTimePerRound)}
                  min="15"
                  step="15"
                  max="180"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="playersLimit">Players Limit</label>
                <input 
                  type="number" 
                  id="playersLimit" 
                  value={playersLimit}
                  onChange={handleNumberChange(setPlayersLimit)}
                  min="2"
                  max="16"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="privacy">Privacy</label>
                <select 
                  id="privacy" 
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as PrivacyType)}
                  disabled={isLoading}
                >
                  <option value={PrivacyType.Public}>{PrivacyType.Public}</option>
                  <option value={PrivacyType.Private}>{PrivacyType.Private}</option>
                </select>
              </div>
            </div>

            {showThemeCategories && (
              <div className="theme-section">
                <label>Theme Categories</label>
                <div className="theme-options">
                  {themeCategories.map(theme => (
                    <div key={theme} className="theme-checkbox">
                      <input
                        type="checkbox"
                        id={theme}
                        checked={selectedThemeCategories.includes(theme)}
                        onChange={() => handleThemeToggle(theme)}
                        disabled={isLoading}
                      />
                      <label htmlFor={theme}>{theme}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="custom-themes-section">
              <label>Custom Themes</label>
              <div className="custom-theme-input">
                <input
                  type="text"
                  placeholder="Add custom theme..."
                  value={customThemeInput}
                  onChange={(e) => setCustomThemeInput(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="add-button"
                  onClick={handleAddCustomTheme}
                  disabled={isLoading}
                >
                  Add
                </button>
              </div>
              {themeFeedback && <p className="input-feedback error">{themeFeedback}</p>}
              <div className="custom-themes-list">
                {customThemes.map(theme => (
                  <div key={theme} className="custom-theme-tag">
                    <span>{theme}</span>
                    <button 
                      type="button" 
                      className="remove-button"
                      onClick={() => handleRemoveCustomTheme(theme)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="back-button" onClick={handleBack} disabled={isLoading}>
                Back
              </button>
              <button type="submit" className="create-game-button" disabled={isLoading}>
                {isLoading ? 'Creating Game...' : 'Create Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
