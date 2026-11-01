import React from 'react';
import { Track } from '../types';

interface QueueProps {
  queue: Track[];
  currentTrack: Track | null;
  onRemoveFromQueue: (index: number) => void;
  onPlayFromQueue: (track: Track) => void;
}

const Queue: React.FC<QueueProps> = ({ queue, currentTrack, onRemoveFromQueue, onPlayFromQueue }) => {
  if (queue.length === 0) return null;

  return (
    <div className="mt-8 bg-[#181818] rounded-xl p-5 border border-white/5">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <i className="fas fa-list-ol text-[#1DB954]"></i>
        Your Queue
        <span className="text-sm font-normal text-[#B3B3B3]">({queue.length} songs)</span>
      </h3>
      
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {queue.map((track, index) => (
          <div
            key={`${track.trackId}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer transition-all"
            onClick={() => onPlayFromQueue(track)}
          >
            <div className="w-6 text-center text-xs text-[#B3B3B3]">
              {currentTrack?.trackId === track.trackId ? (
                <i className="fas fa-volume-up text-[#1DB954] text-xs"></i>
              ) : (
                index + 1
              )}
            </div>
            <img
              src={track.artworkUrl100.replace('100x100', '60x60')}
              alt={track.collectionName}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${currentTrack?.trackId === track.trackId ? 'text-[#1DB954]' : 'text-white'}`}>
                {track.trackName}
              </p>
              <p className="text-xs text-[#B3B3B3] truncate">{track.artistName}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromQueue(index);
              }}
              className="opacity-0 group-hover:opacity-100 text-[#B3B3B3] hover:text-red-400 transition-all"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queue;
