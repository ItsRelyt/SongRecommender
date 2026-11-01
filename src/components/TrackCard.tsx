import React from 'react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, index, isPlaying, onPlay, onAddToQueue }) => {
  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getArtworkUrl = (url: string, size: number = 300) => {
    if (!url) return '';
    // iTunes artwork URLs contain the size like "100x100bb"
    if (url.includes('100x100')) {
      return url.replace('100x100', `${size}x${size}`);
    }
    return url;
  };

  return (
    <div
      className="group flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
      onClick={() => onPlay(track)}
    >
      {/* Track number / Play indicator */}
      <div className="w-8 text-center flex-shrink-0">
        {isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-4">
            <div className="w-1 bg-[#1DB954] rounded-full wave-bar"></div>
            <div className="w-1 bg-[#1DB954] rounded-full wave-bar"></div>
            <div className="w-1 bg-[#1DB954] rounded-full wave-bar"></div>
            <div className="w-1 bg-[#1DB954] rounded-full wave-bar"></div>
          </div>
        ) : (
          <>
            <span className="group-hover:hidden text-sm text-[#B3B3B3]">{index + 1}</span>
            <i className="fas fa-play text-white text-xs hidden group-hover:inline"></i>
          </>
        )}
      </div>

      {/* Album art */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded overflow-hidden shadow-lg">
        <img
          src={getArtworkUrl(track.artworkUrl100, 120)}
          alt={track.collectionName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          {isPlaying && (
            <div className="w-full h-full bg-[#1DB954]/20 flex items-center justify-center">
              <i className="fas fa-volume-up text-[#1DB954] text-xs"></i>
            </div>
          )}
        </div>
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
          {track.trackName}
        </p>
        <p className="text-xs text-[#B3B3B3] truncate">{track.artistName}</p>
      </div>

      {/* Genre tag */}
      <div className="hidden lg:block flex-shrink-0">
        <span className="px-2 py-1 bg-white/5 rounded-full text-[10px] text-[#B3B3B3] font-medium">
          {track.primaryGenreName}
        </span>
      </div>

      {/* Duration */}
      <span className="text-xs text-[#B3B3B3] flex-shrink-0 w-10 text-right tabular-nums">
        {formatDuration(track.trackTimeMillis)}
      </span>

      {/* Add to queue button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToQueue(track);
        }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#B3B3B3] hover:text-white hover:scale-110 transition-all"
        title="Add to queue"
        aria-label="Add to queue"
      >
        <i className="fas fa-plus text-sm"></i>
      </button>
    </div>
  );
};

export default TrackCard;
