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
      className={`card mb-3 ${isActive ? 'border-primary bg-light' : ''}`}
      onClick={hasPreview ? onSelect : undefined}
      style={{ cursor: hasPreview ? 'pointer' : 'default' }}
    >
      <div className="row g-0">
        <div className="col-md-4" style={{ maxWidth: '100px' }}>
          <img 
            src={song.album.cover_medium || '/api/placeholder/120/120'} 
            alt={song.album.title}
            className="img-fluid rounded-start"
            style={{ height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title text-truncate">{song.title}</h5>
            <p className="card-text text-truncate text-muted mb-1">{song.artist.name}</p>
            <p className="card-text text-truncate small">{song.album.title}</p>
            
            <button
              onClick={(e) => { 
                e.stopPropagation();
                if (hasPreview) onSelect();
              }}
              className={`btn ${
                !hasPreview 
                  ? 'btn-secondary disabled' 
                  : isActive 
                    ? 'btn-primary' 
                    : 'btn-outline-primary'
              } btn-sm mt-2`}
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
      </div>
    </div>
  );
}

export default SongCard;