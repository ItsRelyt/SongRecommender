import React from 'react';
import { Track } from '../types';

interface GenreBubbleProps {
  genre: string;
  isSelected: boolean;
  onClick: () => void;
}

const GenreBubble: React.FC<GenreBubbleProps> = ({ genre, isSelected, onClick }) => {
  const colors: Record<string, string> = {
    'Pop': 'from-pink-500 to-rose-500',
    'Rock': 'from-red-600 to-orange-600',
    'Hip-Hop': 'from-purple-600 to-indigo-600',
    'R&B': 'from-violet-500 to-purple-600',
    'Electronic': 'from-cyan-500 to-blue-500',
    'Country': 'from-amber-500 to-yellow-600',
    'Latin': 'from-orange-500 to-red-500',
    'Jazz': 'from-emerald-500 to-teal-600',
    'Classical': 'from-slate-400 to-gray-500',
    'Alternative': 'from-green-500 to-emerald-600',
  };

  const gradient = colors[genre] || 'from-[#1DB954] to-green-600';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
        isSelected
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105`
          : 'bg-[#282828] text-[#B3B3B3] hover:text-white hover:bg-[#3E3E3E] border border-white/5'
      }`}
    >
      {genre}
    </button>
  );
};

interface GenreExplorerProps {
  onSelectGenre: (genre: string) => void;
  selectedGenre: string | null;
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ onSelectGenre, selectedGenre }) => {
  const genres = ['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Country', 'Latin', 'Jazz', 'Classical', 'Alternative'];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <i className="fas fa-compass text-[#1DB954]"></i>
        Explore by Genre
      </h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {genres.map((genre) => (
          <GenreBubble
            key={genre}
            genre={genre}
            isSelected={selectedGenre === genre}
            onClick={() => onSelectGenre(genre)}
          />
        ))}
      </div>
    </div>
  );
};

interface HeroSectionProps {
  children: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#121212] to-[#121212]"></div>
      
      {/* Animated circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#1DB954]/5 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 pt-28 sm:pt-32 pb-12 sm:pb-16 px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Discover Your Next
            <span className="block bg-gradient-to-r from-[#1DB954] to-[#1ED760] bg-clip-text text-transparent">
              Favorite Song
            </span>
          </h1>
          <p className="text-[#B3B3B3] text-base sm:text-lg max-w-xl mx-auto">
            Search for any artist or song, and we'll find personalized recommendations just for you.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

interface StatsBarProps {
  totalResults: number;
  currentTrack: Track | null;
}

const StatsBar: React.FC<StatsBarProps> = ({ totalResults, currentTrack }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-white/5">
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#B3B3B3]">
          <span className="text-white font-semibold">{totalResults}</span> songs found
        </span>
        {currentTrack && (
          <span className="hidden sm:inline text-xs text-[#1DB954] items-center gap-1">
            <i className="fas fa-music text-[10px]"></i>
            Now: {currentTrack.trackName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6A6A6A]">
          <i className="fas fa-headphones mr-1"></i>
          30s previews
        </span>
      </div>
    </div>
  );
};

export { GenreExplorer, HeroSection, StatsBar };
