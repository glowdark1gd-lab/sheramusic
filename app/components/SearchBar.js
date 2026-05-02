'use client';
import { useState } from 'react';

export default function SearchBar({ onAddSong }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Memanggil API internal kita sendiri dengan membawa Token Keamanan
    const res = await fetch(`/api/search?q=${query}`, {
      headers: {
        'Authorization': 'Bearer shera_aman_123' // Sama dengan APP_SECRET_TOKEN di .env
      }
    });
    
    const data = await res.json();
    if (data.songs) setResults(data.songs);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-red-900 rounded-lg shadow-lg">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari lagu karaoke..." 
          className="w-full p-2 rounded text-black outline-none border-2 border-red-500 focus:border-red-700"
        />
        <button 
          type="submit" 
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {/* Hasil Pencarian */}
      <div className="mt-4 flex flex-col gap-2">
        {results.map((song) => (
          <div key={song.videoId} className="flex items-center gap-3 bg-red-800 p-2 rounded hover:bg-red-700">
            <img src={song.thumbnail} alt={song.title} className="w-24 h-auto rounded" />
            <h3 className="text-white text-sm flex-1">{song.title}</h3>
            <button 
              onClick={() => onAddSong(song)}
              className="bg-white text-red-700 px-3 py-1 rounded font-bold text-sm hover:bg-gray-200"
            >
              + Antrean
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}