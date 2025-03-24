import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', email, password);
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
          <p className="login-subtitle">Sign in to start playing</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signin-button">Sign In</button>
          </form>

          <div className="signup-option">
            <span>Don't have an account?</span>
            <a href="/signup">Sign up</a>
          </div>

          <div className="spotify-login">
            <button className="spotify-button">
              <div className="spotify-icon">●</div>
              Continue with Spotify
            </button>
          </div>
        </div>

        <div className="footer">
          <div className="logo-small">
            <span className="music-icon">♪</span>
            <span>VibeCheck</span>
          </div>
          <p className="copyright">© 2023 VibeCheck. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 