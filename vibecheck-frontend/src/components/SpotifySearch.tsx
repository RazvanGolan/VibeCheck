import React, { useState } from 'react';
import { searchAndGetLinks, SpotifyTrackResult, SearchResult } from '../api/spotify';

interface SpotifySearchProps {
  clientId: string;
  clientSecret: string;
}

function SpotifySearch({ clientId, clientSecret }: SpotifySearchProps) {
  const [query, setQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyTrackResult[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrackResult | null>(null);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a song name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result: SearchResult = await searchAndGetLinks(query, clientId, clientSecret, searchLimit);
      
      if (!result.success) {
        setError(result.error || 'Search failed');
        setSearchResults([]);
      } else {
        setSearchResults(result.results);
        setSelectedTrack(null);
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTrackSelect = (track: SpotifyTrackResult) => {
    setSelectedTrack(track);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Spotify Song Search</h1>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter song name"
            className="flex-grow p-2 border border-gray-300 rounded"
          />
          
          <select
            value={searchLimit}
            onChange={(e) => setSearchLimit(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded"
          >
            {[1, 2, 3, 5, 10].map(num => (
              <option key={num} value={num}>{num} results</option>
            ))}
          </select>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Search Results</h2>
          <div className="grid gap-3">
            {searchResults.map((track, index) => (
              <div
                key={index}
                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedTrack === track ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => handleTrackSelect(track)}
              >
                <p className="font-medium">{track.name}</p>
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open in Spotify
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedTrack && (
        <div className="border border-gray-200 rounded p-4">
          <h2 className="text-xl font-semibold mb-3">Preview URLs for "{selectedTrack.name}"</h2>
          {selectedTrack.previewUrls.length > 0 ? (
            <div className="space-y-2">
              {selectedTrack.previewUrls.map((url, index) => (
                <div key={index} className="break-all">
                  <p className="text-sm text-gray-600">URL {index + 1}:</p>
                  <a 
                    href={url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No preview URLs found for this track.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SpotifySearch;