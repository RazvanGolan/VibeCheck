import React from 'react';
import SpotifySearch from './components/SpotifySearch';
import './App.css';

function App() {
  // Read API credentials from environment variables
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID || '';
  const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET || '';
  
  const isConfigured = clientId && clientSecret;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {!isConfigured ? (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <h1 className="text-2xl font-bold mb-3">Missing Spotify API Credentials</h1>
            <p className="mb-2">
              Please set your Spotify API credentials in the <code>.env</code> file:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
              REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret_here
            </pre>
            <p className="mt-3">
              You can get these credentials from the{' '}
              <a 
                href="https://developer.spotify.com/dashboard/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Spotify Developer Dashboard
              </a>.
            </p>
          </div>
        ) : (
          <SpotifySearch clientId={clientId} clientSecret={clientSecret} />
        )}
      </div>
    </div>
  );
}

export default App;