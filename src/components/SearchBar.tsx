import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const popularSearches = ['Taylor Swift', 'The Weeknd', 'Drake', 'Billie Eilish', 'Bad Bunny', 'Dua Lipa'];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <i className={`fas fa-search text-lg ${isLoading ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}></i>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a song, artist, or genre..."
            className="w-full pl-14 pr-32 py-4 bg-[#282828] border border-white/10 rounded-full text-white text-lg placeholder-[#6A6A6A] focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ED760] disabled:bg-[#282828] disabled:text-[#6A6A6A] text-black font-bold rounded-full transition-all text-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Searching
                </span>
              ) : (
                'Find Music'
              )}
            </button>
          </div>
        </div>
      </form>

      {!query && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-[#6A6A6A] mr-1 self-center">Try:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                onSearch(term);
              }}
              className="px-3 py-1.5 bg-[#282828] hover:bg-[#3E3E3E] text-[#B3B3B3] hover:text-white rounded-full text-xs font-medium transition-all border border-white/5"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
