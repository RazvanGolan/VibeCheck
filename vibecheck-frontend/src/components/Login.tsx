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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          <div className="music-icon-large">♪</div>
          <h1 className="title">Welcome to VibeCheck</h1>
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
              <button type="submit" className="submit-button">Submit</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login; 