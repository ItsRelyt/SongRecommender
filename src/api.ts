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
  return data.results || [];
}

export async function getArtistTracks(artistName: string, limit: number = 50): Promise<Track[]> {
  const params = new URLSearchParams({
    term: artistName,
    media: 'music',
    entity: 'song',
    limit: limit.toString(),
  });

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to get artist tracks');
  }

  const data = await response.json();
  return data.results || [];
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
  return data.results || [];
}

export function getRecommendations(
  seedTracks: Track[],
  allTracks: Track[],
  count: number = 20
): Track[] {
  if (seedTracks.length === 0) return [];

  // Get genres and artists from seed tracks
  const seedGenres = new Set(seedTracks.map(t => t.primaryGenreName));
  const seedArtists = new Set(seedTracks.map(t => t.artistName.toLowerCase()));

  // Score each track based on similarity
  const scored = allTracks
    .filter(track => !seedTracks.some(seed => seed.trackId === track.trackId))
    .map(track => {
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
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(s => s.track);
}
