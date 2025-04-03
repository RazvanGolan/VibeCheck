import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateGame.css';

interface LocationState {
  username?: string;
}

const CreateRoom = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const username = state?.username || '';
  const navigate = useNavigate();

  const [gameName, setGameName] = useState('');
  const [gameMode, setGameMode] = useState('Classic Mode');
  const [rounds, setRounds] = useState('3 Rounds');
  const [timePerRound, setTimePerRound] = useState('1 Minute');
  const [playersLimit, setPlayersLimit] = useState('8');
  const [privacy, setPrivacy] = useState('Public');
  const [themes, setThemes] = useState<string[]>([]);
  const [customThemes, setCustomThemes] = useState<string[]>([]);
  const [customThemeInput, setCustomThemeInput] = useState('');

  const themeCategories = [
    'Road Trip', 'Party', 'Workout', 
    'Romance', 'Decades', 'Movies'
  ];

  const handleThemeToggle = (theme: string) => {
    setThemes(prevThemes => 
      prevThemes.includes(theme) 
        ? prevThemes.filter(t => t !== theme)
        : [...prevThemes, theme]
    );
  };

  const handleAddCustomTheme = () => {
    if (customThemeInput.trim() && !customThemes.includes(customThemeInput)) {
      setCustomThemes([...customThemes, customThemeInput]);
      setCustomThemeInput('');
    }
  };

  const handleRemoveCustomTheme = (theme: string) => {
    setCustomThemes(customThemes.filter(t => t !== theme));
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Game created with settings:', {
      gameName,
      gameMode,
      rounds,
      timePerRound,
      playersLimit,
      privacy,
      themes,
      customThemes
    });
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="create-room-container">
      <div className="create-room-card">

        <div className="create-room-content">
          <h1>Create New Game</h1>

          <form onSubmit={handleCreateGame} className="create-room-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gameName">Game Name</label>
                <input 
                  type="text" 
                  id="gameName" 
                  placeholder="Enter game name" 
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gameMode">Game Mode</label>
                <select 
                  id="gameMode" 
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                >
                  <option>Classic Mode</option>
                  <option>Party Mode</option>
                  <option>Challenge Mode</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rounds">Number of Rounds</label>
                <select 
                  id="rounds" 
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                >
                  <option>3 Rounds</option>
                  <option>5 Rounds</option>
                  <option>7 Rounds</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timePerRound">Time per Round</label>
                <select 
                  id="timePerRound" 
                  value={timePerRound}
                  onChange={(e) => setTimePerRound(e.target.value)}
                >
                  <option>30 Seconds</option>
                  <option>1 Minute</option>
                  <option>2 Minutes</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="playersLimit">Players Limit</label>
                <input 
                  type="number" 
                  id="playersLimit" 
                  value={playersLimit}
                  onChange={(e) => setPlayersLimit(e.target.value)}
                  min="2"
                  max="16"
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

            <div className="theme-section">
              <label>Theme Categories</label>
              <div className="theme-options">
                {themeCategories.map(theme => (
                  <div key={theme} className="theme-checkbox">
                    <input
                      type="checkbox"
                      id={theme}
                      checked={themes.includes(theme)}
                      onChange={() => handleThemeToggle(theme)}
                    />
                    <label htmlFor={theme}>{theme}</label>
                  </div>
                ))}
              </div>
            </div>

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
