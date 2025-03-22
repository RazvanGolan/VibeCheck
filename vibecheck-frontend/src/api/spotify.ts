import axios from 'axios';
// Remove cheerio import as we won't need it anymore
// import * as cheerio from 'cheerio';

// Define types for our Spotify API responses
export interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  external_urls: {
    spotify: string;
  };
  preview_url: string | null; // Add this field from the Spotify API
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface SpotifyTrackResult {
  name: string;
  spotifyUrl: string;
  previewUrls: string[];
}

export interface SearchResult {
  success: boolean;
  error?: string;
  results: SpotifyTrackResult[];
}

// Spotify API client
class SpotifyApi {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpirationTime: number = 0;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpirationTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken!;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async searchTracks(query: string, limit: number = 5): Promise<SpotifySearchResponse> {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw new Error('Failed to search tracks on Spotify');
    }
  }
}

// Remove the getSpotifyLinks function as we don't need it anymore

// Main function to search songs and get preview links
export async function searchAndGetLinks(
  songName: string,
  clientId: string,
  clientSecret: string,
  limit: number = 5
): Promise<SearchResult> {
  try {
    if (!songName) {
      throw new Error('Song name is required');
    }
    
    if (!clientId || !clientSecret) {
      throw new Error('Spotify client ID and client secret are required');
    }
    
    const spotifyApi = new SpotifyApi(clientId, clientSecret);
    const searchResults = await spotifyApi.searchTracks(songName, limit);
    
    if (searchResults.tracks.items.length === 0) {
      return {
        success: false,
        error: 'No songs found',
        results: []
      };
    }
    
    const tracks = searchResults.tracks.items.slice(0, limit);
    const results = tracks.map(track => {
      // Create an array of preview URLs, filtering out nulls
      const previewUrls = track.preview_url ? [track.preview_url] : [];
      
      return {
        name: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
        spotifyUrl: track.external_urls.spotify,
        previewUrls: previewUrls
      };
    });
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      results: []
    };
  }
}