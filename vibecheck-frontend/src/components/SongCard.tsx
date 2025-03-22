import React from 'react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onSelect: () => void;
  isActive: boolean;
}

function SongCard({ song, onSelect, isActive }: SongCardProps) {
  // Handle missing preview
  const hasPreview = Boolean(song.preview);
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden flex hover:shadow-md transition-shadow ${isActive ? 'border-blue-500 bg-blue-50' : ''}`}
      onClick={hasPreview ? onSelect : undefined}
    >
      <img 
        src={song.album.cover_medium || '/api/placeholder/120/120'} 
        alt={song.album.title}
        className="w-24 h-24 object-cover"
      />
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-lg truncate">{song.title}</h3>
        <p className="text-gray-600 truncate">{song.artist.name}</p>
        <p className="text-gray-500 text-sm truncate">{song.album.title}</p>
        
        <button
          onClick={(e) => { 
            e.stopPropagation();
            if (hasPreview) onSelect();
          }}
          className={`mt-2 px-3 py-1 rounded text-sm font-medium ${
            hasPreview 
              ? isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasPreview}
        >
          {!hasPreview 
            ? 'No preview available' 
            : isActive 
              ? 'Playing' 
              : 'Play Preview'}
        </button>
      </div>
    </div>
  );
}

export default SongCard;