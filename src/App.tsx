import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TrackCard from './components/TrackCard';
import Player from './components/Player';
import Queue from './components/Queue';
import { GenreExplorer, HeroSection, StatsBar } from './components/Sections';
import { Track, SearchState } from './types';
import { searchTracks, getGenreTracks, getRecommendations } from './api';

function App() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Memoize all tracks for navigation
  const allTracks = useMemo(() => {
    const combined = [...searchResults];
    // Add recommendations that aren't already in search results
    const searchIds = new Set(searchResults.map(t => t.trackId));
    for (const rec of recommendations) {
      if (!searchIds.has(rec.trackId)) {
        combined.push(rec);
      }
    }
    return combined;
  }, [searchResults, recommendations]);

  const handleSearch = async (query: string) => {
    setSearchState('loading');
    setSearchQuery(query);
    setSelectedGenre(null);
    setErrorMessage('');
    setIsPlaying(false);

    try {
      const tracks = await searchTracks(query, 50);
      
      if (tracks.length === 0) {
        setSearchState('error');
        setErrorMessage(`No results found for "${query}". Try a different search term.`);
        setSearchResults([]);
        setRecommendations([]);
        return;
      }

      setSearchResults(tracks);
      setSearchState('success');

      // Get recommendations based on search results
      const seedTracks = tracks.slice(0, Math.min(5, tracks.length));
      const recs = getRecommendations(seedTracks, tracks, 10);
      setRecommendations(recs);
    } catch (error) {
      setSearchState('error');
      setErrorMessage('Something went wrong. Please try again.');
      setSearchResults([]);
      setRecommendations([]);
    }
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setSearchState('loading');
    setSearchQuery(genre);
    setErrorMessage('');
    setIsPlaying(false);

    try {
      const tracks = await getGenreTracks(genre, 50);
      
      if (tracks.length === 0) {
        setSearchState('error');
        setErrorMessage(`No tracks found for genre "${genre}".`);
        setSearchResults([]);
        setRecommendations([]);
        return;
      }

      setSearchResults(tracks);
      setSearchState('success');

      const seedTracks = tracks.slice(0, Math.min(5, tracks.length));
      const recs = getRecommendations(seedTracks, tracks, 10);
      setRecommendations(recs);
    } catch (error) {
      setSearchState('error');
      setErrorMessage('Something went wrong. Please try again.');
      setSearchResults([]);
      setRecommendations([]);
    }
  };

  // Use functional updates to avoid stale closures
  const handlePlay = useCallback((track: Track) => {
    setCurrentTrack(prev => {
      if (prev?.trackId === track.trackId) {
        // Toggle play/pause for same track
        setIsPlaying(playing => !playing);
        return prev;
      }
      // Play new track
      setIsPlaying(true);
      return track;
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrack(prev => {
      if (!prev || allTracks.length === 0) return prev;
      
      const currentIndex = allTracks.findIndex(t => t.trackId === prev.trackId);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % allTracks.length;
      setIsPlaying(true);
      return allTracks[nextIndex];
    });
  }, [allTracks]);

  const handlePrevious = useCallback(() => {
    setCurrentTrack(prev => {
      if (!prev || allTracks.length === 0) return prev;
      
      const currentIndex = allTracks.findIndex(t => t.trackId === prev.trackId);
      const prevIndex = currentIndex <= 0 ? allTracks.length - 1 : currentIndex - 1;
      setIsPlaying(true);
      return allTracks[prevIndex];
    });
  }, [allTracks]);

  const handleAddToQueue = useCallback((track: Track) => {
    setQueue(prev => {
      if (prev.some(t => t.trackId === track.trackId)) return prev;
      return [...prev, track];
    });
  }, []);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePlayFromQueue = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const handleLogoClick = useCallback(() => {
    setSearchState('idle');
    setSearchResults([]);
    setRecommendations([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    setQueue([]);
    setSearchQuery('');
    setSelectedGenre(null);
    setErrorMessage('');
  }, []);

  const hasResults = searchState === 'success' && searchResults.length > 0;

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      <Header onLogoClick={handleLogoClick} />
      
      <HeroSection>
        <SearchBar onSearch={handleSearch} isLoading={searchState === 'loading'} />
        
        <div className="mt-10">
          <GenreExplorer onSelectGenre={handleGenreSelect} selectedGenre={selectedGenre} />
        </div>
      </HeroSection>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading state */}
        {searchState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#282828] rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-[#1DB954] rounded-full absolute inset-0 animate-spin"></div>
            </div>
            <p className="mt-4 text-[#B3B3B3] text-sm">Finding the perfect songs for you...</p>
          </div>
        )}

        {/* Error state */}
        {searchState === 'error' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-circle text-red-400 text-2xl"></i>
            </div>
            <p className="text-[#B3B3B3] text-center max-w-md">{errorMessage}</p>
            <button
              onClick={handleLogoClick}
              className="mt-4 px-6 py-2 bg-[#282828] hover:bg-[#3E3E3E] text-white rounded-full text-sm transition-all"
            >
              Go Back Home
            </button>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="py-6">
            {/* Recommendations section */}
            {recommendations.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-green-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-magic text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Recommended For You</h2>
                    <p className="text-xs text-[#B3B3B3]">Based on "{searchQuery}"</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {recommendations.map((track, index) => (
                    <div
                      key={`rec-${track.trackId}-${index}`}
                      className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all card-hover cursor-pointer animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                      onClick={() => handlePlay(track)}
                    >
                      <div className="relative mb-3">
                        <img
                          src={track.artworkUrl100.replace('100x100', '300x300')}
                          alt={track.collectionName}
                          className="w-full aspect-square rounded-md object-cover shadow-lg"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 hover:bg-[#1ED760]">
                            <i className="fas fa-play text-black text-sm ml-0.5"></i>
                          </div>
                        </div>
                        {currentTrack?.trackId === track.trackId && isPlaying && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center animate-pulse-glow">
                              <i className="fas fa-music text-black text-[8px]"></i>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className={`text-sm font-semibold truncate ${currentTrack?.trackId === track.trackId ? 'text-[#1DB954]' : 'text-white'}`}>
                        {track.trackName}
                      </p>
                      <p className="text-xs text-[#B3B3B3] truncate mt-1">{track.artistName}</p>
                      <p className="text-[10px] text-[#6A6A6A] mt-1">{track.primaryGenreName}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All results */}
            <section>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg flex items-center justify-center">
                  <i className="fas fa-search text-white"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Search Results</h2>
                  <p className="text-xs text-[#B3B3B3]">All matches for "{searchQuery}"</p>
                </div>
              </div>

              <StatsBar totalResults={searchResults.length} currentTrack={currentTrack} />

              <div className="mt-2">
                {searchResults.map((track, index) => (
                  <TrackCard
                    key={`result-${track.trackId}-${index}`}
                    track={track}
                    index={index}
                    isPlaying={currentTrack?.trackId === track.trackId && isPlaying}
                    onPlay={handlePlay}
                    onAddToQueue={handleAddToQueue}
                  />
                ))}
              </div>
            </section>

            {/* Queue */}
            <Queue
              queue={queue}
              currentTrack={currentTrack}
              onRemoveFromQueue={handleRemoveFromQueue}
              onPlayFromQueue={handlePlayFromQueue}
            />
          </div>
        )}

        {/* Empty state */}
        {searchState === 'idle' && (
          <div className="py-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {[
                { icon: 'fa-guitar', label: 'Rock', color: 'from-red-500 to-orange-500' },
                { icon: 'fa-microphone', label: 'Pop', color: 'from-pink-500 to-rose-500' },
                { icon: 'fa-headphones', label: 'Electronic', color: 'from-cyan-500 to-blue-500' },
                { icon: 'fa-drum', label: 'Hip-Hop', color: 'from-purple-500 to-indigo-500' },
                { icon: 'fa-music', label: 'Jazz', color: 'from-emerald-500 to-teal-500' },
                { icon: 'fa-compact-disc', label: 'Classical', color: 'from-slate-400 to-gray-500' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleGenreSelect(item.label)}
                  className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg`}
                >
                  <i className={`fas ${item.icon} text-2xl text-white mb-2`}></i>
                  <p className="text-white text-sm font-bold">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Player */}
      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}

export default App;
