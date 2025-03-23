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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;
      
      try {
        setIsLoading(true);
        // Reset and prepare audio
        audioRef.current.pause();
        audioRef.current.load();
        setProgress(0);
        
        // Wait for audio to be ready
        if (audioRef.current.readyState < 2) {
          await new Promise(resolve => {
            audioRef.current?.addEventListener('canplay', resolve, { once: true });
          });
        }
        
        // Play audio
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Playback failed:", e);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    playAudio();
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

  const togglePlayPause = async (): Promise<void> => {
    if (!audioRef.current || isLoading) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error("Playback failed:", e);
    }
  };

  const stopAudio = (): void => {
    if (!audioRef.current || isLoading) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setProgress(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed-bottom bg-white border-top shadow p-3">
      <div className="container">
        <div className="d-flex align-items-center">
          <img 
            src={song.album.cover_small} 
            alt={song.album.title}
            className="rounded me-3"
            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
          />
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <h5 className="fw-medium text-truncate me-2 mb-0">{song.title}</h5>
              <span className="small text-muted text-truncate">{song.artist.name}</span>
            </div>
            
            <div className="d-flex align-items-center">
              <span className="small text-muted me-2">{formatTime(progress)}</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary"
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="small text-muted ms-2">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="d-flex ms-3">
            <button 
              onClick={togglePlayPause}
              disabled={isLoading}
              className={`btn ${isLoading ? 'btn-secondary' : 'btn-primary'} btn-sm rounded-circle me-2`}
              style={{ width: '38px', height: '38px' }}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-fill" viewBox="0 0 16 16">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
              )}
            </button>
            
            <button 
              onClick={stopAudio}
              disabled={isLoading || (!isPlaying && progress === 0)}
              className={`btn ${isLoading || (!isPlaying && progress === 0) ? 'btn-secondary' : 'btn-danger'} btn-sm rounded-circle`}
              style={{ width: '38px', height: '38px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stop-fill" viewBox="0 0 16 16">
                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
              </svg>
            </button>
          </div>
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