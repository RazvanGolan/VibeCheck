import React, { useState } from 'react';
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registration attempt with:', username, email, password);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="header">
          <div className="logo-small">
            <span className="music-icon">♪</span>
            <span>VibeCheck</span>
          </div>
        </div>

        <div className="register-content">
          <div className="music-icon-large">♪</div>
          <h1>Join VibeCheck</h1>
          <p className="register-subtitle">Create an account to start your music journey</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Choose a username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signup-button">Create Account</button>
          </form>

          <div className="login-option">
            <span>Already have an account?</span>
            <a href="/login">Sign in</a>
          </div>
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

export default Register;
