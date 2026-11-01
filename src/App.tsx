import { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  art: string;
  src: string;
  duration: number;
  genre: string;
  link: string;
}

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('jamendo_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentList, setCurrentList] = useState<'tracks' | 'recommendations'>('tracks');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Format time
  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Search Jamendo
  const searchJamendo = async (q: string): Promise<Track[]> => {
    if (!apiKey) throw new Error('Please enter your Jamendo API key first');
    
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${encodeURIComponent(apiKey)}` +
      `&format=json&limit=50&include=musicinfo&audioformat=mp32&search=${encodeURIComponent(q)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Search failed. Check your API key.');
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No results found');
    }
    
    return data.results.map((r: any) => ({
      id: r.id,
      title: r.name,
      artist: r.artist_name,
      album: r.album_name,
      art: r.image || r.album_image,
      src: r.audio,
      duration: r.duration,
      genre: r.musicinfo?.tags?.genres?.[0] || 'Unknown',
      link: r.shareurl
    }));
  };

  // Get recommendations
  const getRecommendations = (seedTracks: Track[], allTracks: Track[], count = 10): Track[] => {
    if (seedTracks.length === 0) return [];
    
    const seedGenres = new Set(seedTracks.map(t => t.genre));
    const seedArtists = new Set(seedTracks.map(t => t.artist.toLowerCase()));
    const seedIds = new Set(seedTracks.map(t => t.id));
    
    const available = allTracks.filter(t => !seedIds.has(t.id));
    
    if (available.length === 0) {
      return [...seedTracks].sort(() => Math.random() - 0.5).slice(0, count);
    }
    
    const scored = available.map(track => {
      let score = 0;
      if (seedGenres.has(track.genre)) score += 3;
      if (seedArtists.has(track.artist.toLowerCase())) score += 5;
      score += Math.random() * 2;
      return { track, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.min(count, scored.length)).map(s => s.track);
  };

  // Do search
  const doSearch = async (searchQuery?: string) => {
    const q = searchQuery || query.trim();
    if (!q) return;
    
    if (!apiKey) {
      setStatus('Please enter your Jamendo API key first');
      setShowApiKeyInput(true);
      return;
    }
    
    setIsLoading(true);
    setStatus('Searching...');
    setQuery(q);
    
    try {
      const results = await searchJamendo(q);
      setTracks(results);
      const recs = getRecommendations(results.slice(0, 5), results, 10);
      setRecommendations(recs);
      setStatus(`${results.length} songs found`);
    } catch (e: any) {
      setStatus(e.message);
      setTracks([]);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play track
  const playTrack = useCallback((list: 'tracks' | 'recommendations', index: number) => {
    const listData = list === 'recommendations' ? recommendations : tracks;
    if (index < 0 || index >= listData.length) return;
    
    const track = listData[index];
    setCurrentList(list);
    setCurrentIndex(index);
    setCurrentTrack(track);
    
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.play().catch(() => setStatus('Playback failed'));
    }
    setIsPlaying(true);
  }, [tracks, recommendations]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentTrack) {
      if (tracks.length > 0) playTrack('tracks', 0);
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Next track
  const nextTrack = () => {
    const list = currentList === 'recommendations' ? recommendations : tracks;
    if (list.length === 0) return;
    const nextIndex = (currentIndex + 1) % list.length;
    playTrack(currentList, nextIndex);
  };

  // Previous track
  const prevTrack = () => {
    const list = currentList === 'recommendations' ? recommendations : tracks;
    if (list.length === 0) return;
    const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    playTrack(currentList, prevIndex);
  };

  // Save API key
  const saveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      localStorage.setItem('jamendo_key', key);
      setApiKey(key);
      setShowApiKeyInput(false);
      setStatus('API key saved! You can now search for music.');
    } else {
      setStatus('Please enter a valid API key');
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => nextTrack();
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [currentIndex, currentList]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (parseFloat(e.target.value) / 100) * duration;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #121212 100%)', padding: '60px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', background: 'linear-gradient(135deg, #1db954, #1ed760)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          🎵 SoundFinder
        </h1>
        <p style={{ color: '#b3b3b3', fontSize: '1.1rem', marginBottom: '30px' }}>
          Discover and play full songs - powered by Jamendo
        </p>
        
        {/* Search */}
        <div style={{ maxWidth: '600px', margin: '0 auto 30px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3', fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search for songs, artists, or genres..."
            style={{ width: '100%', padding: '16px 140px 16px 50px', borderRadius: '50px', border: '1px solid #282828', background: '#282828', color: '#fff', fontSize: '16px', outline: 'none' }}
          />
          <button
            onClick={() => doSearch()}
            disabled={isLoading || !query.trim()}
            style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '10px 24px', border: 'none', borderRadius: '50px', background: isLoading || !query.trim() ? '#282828' : '#1db954', color: isLoading || !query.trim() ? '#b3b3b3' : '#000', fontWeight: 600, cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer', fontSize: '14px' }}
          >
            {isLoading ? 'Searching...' : 'Find Music'}
          </button>
        </div>

        {/* Quick picks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          <span style={{ color: '#b3b3b3', fontSize: '13px', alignSelf: 'center' }}>Try:</span>
          {['rock', 'pop', 'electronic', 'jazz', 'hip hop', 'classical'].map(genre => (
            <button
              key={genre}
              onClick={() => { setQuery(genre); doSearch(genre); }}
              style={{ padding: '8px 16px', background: '#282828', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50px', color: '#b3b3b3', fontSize: '13px', cursor: 'pointer' }}
            >
              {genre}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* API Key notice */}
        <div style={{ background: '#282828', border: '1px solid rgba(29, 185, 84, 0.2)', borderRadius: '12px', padding: '16px', margin: '20px auto', maxWidth: '600px', textAlign: 'center' }}>
          <strong>🎶 Full Songs Available!</strong><br />
          <small style={{ color: '#b3b3b3' }}>
            This player uses <a href="https://www.jamendo.com" target="_blank" style={{ color: '#1db954' }}>Jamendo</a> - a platform for independent artists sharing music under Creative Commons licenses. Get your free API key at <a href="https://devportal.jamendo.com/signup" target="_blank" style={{ color: '#1db954' }}>devportal.jamendo.com</a>
          </small>
        </div>

        {/* API Key input */}
        {showApiKeyInput && (
          <div style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="Enter your Jamendo client_id"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #282828', background: '#181818', color: '#fff', fontSize: '15px', marginBottom: '10px' }}
            />
            <button
              onClick={saveApiKey}
              style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#1db954', color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
            >
              Save API Key
            </button>
          </div>
        )}

        {/* Status */}
        {status && (
          <div style={{ textAlign: 'center', color: '#b3b3b3', fontSize: '14px', padding: '20px' }}>
            {status}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #282828', borderTopColor: '#1db954', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}

        {/* Recommendations */}
        {!isLoading && recommendations.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: 'linear-gradient(135deg, #1db954, #169c46)' }}>✨</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Recommended For You</div>
                <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>Based on "{query}"</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {recommendations.map((track, i) => (
                <div
                  key={`rec-${track.id}-${i}`}
                  onClick={() => playTrack('recommendations', i)}
                  style={{ background: currentList === 'recommendations' && currentIndex === i ? 'rgba(29, 185, 84, 0.1)' : '#1f1f1f', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', outline: currentList === 'recommendations' && currentIndex === i ? '2px solid #1db954' : 'none' }}
                >
                  <img src={track.art} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover', background: '#2a2a3a', marginBottom: '12px' }} />
                  <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px', color: currentList === 'recommendations' && currentIndex === i ? '#1db954' : '#fff' }}>
                    {track.title}
                  </div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist}
                  </div>
                  <div style={{ display: 'inline-block', marginTop: '8px', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px', color: '#b3b3b3' }}>
                    {track.genre}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && tracks.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>🔍</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Search Results</div>
                <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>All matches for "{query}"</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tracks.map((track, i) => (
                <div
                  key={`track-${track.id}-${i}`}
                  onClick={() => playTrack('tracks', i)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: currentList === 'tracks' && currentIndex === i ? 'rgba(29, 185, 84, 0.1)' : 'transparent' }}
                >
                  <div style={{ width: '30px', textAlign: 'center', color: currentList === 'tracks' && currentIndex === i ? '#1db954' : '#b3b3b3', fontSize: '14px' }}>
                    {currentList === 'tracks' && currentIndex === i ? '🔊' : i + 1}
                  </div>
                  <img src={track.art} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', background: '#2a2a3a' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentList === 'tracks' && currentIndex === i ? '#1db954' : '#fff' }}>
                      {track.title}
                    </div>
                    <div style={{ color: '#b3b3b3', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.artist}
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '11px', color: '#b3b3b3' }}>
                    {track.genre}
                  </div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px', width: '50px', textAlign: 'right' }}>
                    {fmt(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player */}
      {currentTrack && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#181818', borderTop: '1px solid #282828', padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px', alignItems: 'center', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <img src={currentTrack.art} alt="" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
              <div style={{ color: '#b3b3b3', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.artist}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={prevTrack} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: '16px', padding: '8px 12px' }}>⏮</button>
              <button onClick={togglePlay} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: '#000', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button onClick={nextTrack} style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: '16px', padding: '8px 12px' }}>⏭</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '12px', color: '#b3b3b3' }}>
              <span>{fmt(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={handleSeek}
                style={{ flex: 1, height: '4px', borderRadius: '2px', background: `linear-gradient(to right, #1db954 ${progressPercent}%, #4d4d4d ${progressPercent}%)`, outline: 'none' }}
              />
              <span>{fmt(duration)}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            🔊 <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width: '100px', height: '4px', borderRadius: '2px', background: `linear-gradient(to right, #1db954 ${volume * 100}%, #4d4d4d ${volume * 100}%)`, outline: 'none' }}
            />
          </div>
        </div>
      )}

      <audio ref={audioRef} preload="metadata" />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          h1 { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
