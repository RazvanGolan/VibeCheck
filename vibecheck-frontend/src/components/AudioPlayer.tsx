import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';

interface AudioPlayerProps {
  song: Song;
}

function AudioPlayer({ song }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (audioRef.current) {
      // Reset and play when song changes
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setIsPlaying(true);
      setProgress(0);
    }
  }, [song]);

  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const updateProgress = () => {
      setProgress(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = (): void => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <img 
            src={song.album.cover_small} 
            alt={song.album.title}
            className="w-12 h-12 object-cover rounded"
          />
          
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <h4 className="font-medium truncate mr-2">{song.title}</h4>
              <span className="text-sm text-gray-500 truncate">{song.artist.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{formatTime(progress)}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{formatTime(duration)}</span>
            </div>
          </div>
          
          <button 
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <audio ref={audioRef}>
        <source src={song.preview} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;