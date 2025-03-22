import React from 'react';
import SongCard from './SongCard';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  isLoading: boolean;
  onSongSelect: (song: Song) => void;
  currentSong: Song | null;
}

function SongList({ songs, isLoading, onSongSelect, currentSong }: SongListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No songs found. Try searching for something else!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
      {songs.map((song) => (
        <SongCard 
          key={song.id} 
          song={song} 
          onSelect={() => onSongSelect(song)}
          isActive={currentSong ? currentSong.id === song.id : false}
        />
      ))}
    </div>
  );
}

export default SongList;
