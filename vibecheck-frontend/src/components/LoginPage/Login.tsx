import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import './Login.css';

interface LocationState {
  from?: string;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const state = location.state as LocationState;
  const from = state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setErrorMessage('Username is required');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const success = await signIn(username);
      if (success) {
        navigate(from);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage && e.target.value.trim()) {
                    setErrorMessage('');
                  }
                }}
              />
            </div>

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="button-group">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Submit'}
              </button>
            </div>
            <button className="login-back-button" type="button" onClick={handleBack}>
              ← Back
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;