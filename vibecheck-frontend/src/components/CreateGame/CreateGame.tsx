import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateGame.css';
import { GameMode, GameSettings, defaultGameSettings } from '../../types/gameSettings';

interface LocationState {
  username?: string;
}

const CreateRoom = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const username = state?.username || '';
  const navigate = useNavigate();
  
  const [gameMode, setGameMode] = useState<GameMode>(defaultGameSettings.gameMode);
  const [rounds, setRounds] = useState<number>(defaultGameSettings.rounds);
  const [timePerRound, setTimePerRound] = useState<number>(defaultGameSettings.timePerRound);
  const [playersLimit, setPlayersLimit] = useState<number>(defaultGameSettings.playersLimit);
  const [privacy, setPrivacy] = useState<string>(defaultGameSettings.privacy);
  const [selectedThemeCategories, setSelectedThemeCategories] = useState<string[]>(defaultGameSettings.selectedThemeCategories);
  const [customThemes, setCustomThemes] = useState<string[]>(defaultGameSettings.customThemes);
  
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [themeFeedback, setThemeFeedback] = useState<string>('');

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

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    const gameSettings: Partial<GameSettings> & { customThemeInput?: string } = {
      gameMode,
      rounds,
      timePerRound,
      playersLimit,
      privacy,
      customThemes,
    };
    if (gameMode !== GameMode.Classic) {
      gameSettings.selectedThemeCategories = selectedThemeCategories;
    }
    console.log('Game created with settings:', gameSettings);
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

          <form onSubmit={handleCreateGame} className="create-room-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gameMode">Game Mode</label>
                <select 
                  id="gameMode" 
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="privacy">Privacy</label>
                <select 
                  id="privacy" 
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option>Public</option>
                  <option>Private</option>
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
                />
                <button 
                  type="button" 
                  className="add-button"
                  onClick={handleAddCustomTheme}
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
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="back-button" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="create-game-button">
                Create Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
