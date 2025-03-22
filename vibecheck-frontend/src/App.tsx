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
    <div className="app-container max-w-4xl mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">SoundPeek</h1>
        <p className="text-gray-600">Search and preview your favorite songs</p>
      </header>
      
      <SearchBar onSearch={searchSongs} isLoading={loading} />
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
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