import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with username:', username);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // navigate('/create-room', { state: { username } });   TO BE IMPLEMENTED
      navigate('/login', { state: { username } });
    } else {
      alert('Please enter a username');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header">
          <div className="logo-small">
            <span className="music-icon">♪</span>
            <span>VibeCheck</span>
          </div>
        </div>

        <div className="login-content">
          <div className="music-icon-large">♪</div>
          <h1>Welcome to VibeCheck</h1>
          <p className="login-subtitle">Choose your name to start playing</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="play-button">Play!</button>
              <button type="button" className="create-room-button" onClick={handleCreateRoom}>Create Room</button>
            </div>
          </form>

        </div>

        <div className="footer">
          <div className="logo-small">
            <span className="music-icon">♪</span>
            <span>VibeCheck</span>
          </div>
          <p className="copyright">© 2025 VibeCheck. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 