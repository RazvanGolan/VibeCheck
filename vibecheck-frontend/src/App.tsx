import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import AudioPlayer from './components/AudioPlayer';
import { Song } from './types';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const searchSongs = async (query: string): Promise<void> => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would be your backend proxy endpoint
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      console.log('Data:', data);
      setSongs(data.data || []);
    } catch (err) {
      console.error('Error searching songs:', err);
      setError('Failed to search songs. Please try again later.');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongSelect = (song: Song): void => {
    setCurrentSong(song);
  };

  return (
    <div className="container py-4 mb-5">
      <header className="text-center mb-4">
        <h1 className="display-5 fw-bold">VibeCheck</h1>
        <p className="text-muted">Search and preview your favorite songs</p>
      </header>
      
      <SearchBar onSearch={searchSongs} isLoading={loading} />
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <SongList 
        songs={songs} 
        isLoading={loading} 
        onSongSelect={handleSongSelect}
        currentSong={currentSong}
      />
      
      {currentSong && <AudioPlayer song={currentSong} />}
    </div>
  );
}

export default App;