import React, { useRef, useEffect, useState } from 'react';
import { Track } from '../types';

interface PlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Player: React.FC<PlayerProps> = ({ track, isPlaying, onPlayPause, onNext, onPrevious }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onNext);
    };
  }, [track, onNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track?.previewUrl) {
      audio.src = track.previewUrl;
      audio.volume = volume;
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  if (!track) return null;

  const getArtworkUrl = (url: string, size: number = 300) => {
    return url.replace('100x100', `${size}x${size}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-white/10 backdrop-blur-xl">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 w-1/4 min-w-0">
            <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src={getArtworkUrl(track.artworkUrl100, 140)}
                alt={track.collectionName}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.trackName}</p>
              <p className="text-xs text-[#B3B3B3] truncate">{track.artistName}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center w-2/4">
            <div className="flex items-center gap-4 mb-1">
              <button
                onClick={onPrevious}
                className="text-[#B3B3B3] hover:text-white transition-colors"
              >
                <i className="fas fa-step-backward"></i>
              </button>
              <button
                onClick={onPlayPause}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <i className="fas fa-pause text-black text-sm"></i>
                ) : (
                  <i className="fas fa-play text-black text-sm ml-0.5"></i>
                )}
              </button>
              <button
                onClick={onNext}
                className="text-[#B3B3B3] hover:text-white transition-colors"
              >
                <i className="fas fa-step-forward"></i>
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] text-[#B3B3B3] w-8 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 30}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1DB954 ${(currentTime / (duration || 30)) * 100}%, #4d4d4d ${(currentTime / (duration || 30)) * 100}%)`
                }}
              />
              <span className="text-[10px] text-[#B3B3B3] w-8">0:30</span>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 w-1/4 justify-end">
            <i className="fas fa-volume-up text-[#B3B3B3] text-sm"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #1DB954 ${volume * 100}%, #4d4d4d ${volume * 100}%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
