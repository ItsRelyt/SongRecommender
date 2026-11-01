import { Track } from './types';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

export async function searchTracks(query: string, limit: number = 25): Promise<Track[]> {
  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: limit.toString(),
  });

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }

  const data = await response.json();
  return (data.results || []).filter((r: Track) => r.previewUrl);
}

export async function getGenreTracks(genre: string, limit: number = 30): Promise<Track[]> {
  const params = new URLSearchParams({
    term: genre,
    media: 'music',
    entity: 'song',
    limit: limit.toString(),
  });

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to get genre tracks');
  }

  const data = await response.json();
  return (data.results || []).filter((r: Track) => r.previewUrl);
}

export function getRecommendations(
  seedTracks: Track[],
  allTracks: Track[],
  count: number = 10
): Track[] {
  if (seedTracks.length === 0 || allTracks.length === 0) return [];

  // Get genres and artists from seed tracks
  const seedGenres = new Set(seedTracks.map(t => t.primaryGenreName));
  const seedArtists = new Set(seedTracks.map(t => t.artistName.toLowerCase()));

  // Available tracks (not in seed)
  const seedIds = new Set(seedTracks.map(t => t.trackId));
  const available = allTracks.filter(track => !seedIds.has(track.trackId));

  // If we don't have enough non-seed tracks, just return some shuffled seed tracks
  if (available.length === 0) {
    return [...seedTracks].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // Score each track based on similarity
  const scored = available.map(track => {
    let score = 0;
    
    // Same genre gets points
    if (seedGenres.has(track.primaryGenreName)) {
      score += 3;
    }
    
    // Similar artist name gets points
    if (seedArtists.has(track.artistName.toLowerCase())) {
      score += 5;
    }
    
    // Random factor for variety
    score += Math.random() * 2;
    
    return { track, score };
  });

  // Sort by score descending, take top results
  scored.sort((a, b) => b.score - a.score);
  
  // Ensure we return at least some results even if count is larger than available
  return scored.slice(0, Math.min(count, scored.length)).map(s => s.track);
}
