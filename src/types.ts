export interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
  primaryGenreName: string;
  releaseDate: string;
  trackPrice?: number;
  collectionArtistName?: string;
}

export type SearchState = 'idle' | 'loading' | 'success' | 'error';
