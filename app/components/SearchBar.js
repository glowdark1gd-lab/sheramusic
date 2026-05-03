'use client';
import { useState } from 'react';

// Hapus tulisan : { onAddSong: any }
export default function SearchBar({ onAddSong }) {
  const [query, setQuery] = useState('');
  // Hapus tulisan <any[]>
  const [results, setResults] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hapus tulisan : any pada (e: any)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setResults([]);

    const apiKeys = [
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_3,
    ].filter(Boolean); 

    if (apiKeys.length === 0) {
      setErrorMsg('Sistem belum memiliki API Key YouTube.');
      setIsLoading(false);
      return;
    }

    let isSuccess = false;

    for (let i = 0; i < apiKeys.length; i++) {
      try {
        console.log(`Mencoba pencarian dengan API Key ke-${i + 1}...`);
        
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(query + ' karaoke')}&type=video&key=${apiKeys[i]}`);
        const data = await response.json();

        if (data.error && data.error.errors[0].reason === 'quotaExceeded') {
          console.warn(`⚠️ API Key ke-${i + 1} habis kuota! Otomatis mencoba key berikutnya...`);
          continue; 
        }

        if (data.error) {
          console.error(`Error pada API Key ke-${i + 1}:`, data.error.message);
          continue; 
        }

        // Hapus tulisan : any pada (item: any)
        const formattedResults = data.items.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
        }));

        setResults(formattedResults);
        isSuccess = true;
        break; 
        
      } catch (error) {
        console.error(`Gagal menghubungi server pada percobaan ke-${i + 1}:`, error);
      }
    }

    if (!isSuccess) {
      setErrorMsg('Maaf, server sedang sibuk atau semua kuota pencarian telah habis hari ini.');
    }

    setIsLoading(false);
  };

// ... (Sisa kode return HTML di bawahnya tetap sama persis) ...
  return (
    <div className="bg-red-950 p-6 rounded-xl shadow-lg border border-red-900 mb-6">
      <h2 className="text-white font-bold mb-4 text-xl flex items-center gap-2">
        🔍 Cari Lagu YouTube
      </h2>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik judul lagu atau penyanyi..."
          className="flex-1 px-4 py-3 rounded-lg bg-black text-white border border-red-700 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder-red-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${isLoading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-lg'}`}
        >
          {isLoading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {errorMsg && (
        <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* Hasil Pencarian */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map((song) => (
            <div key={song.videoId} className="flex gap-3 bg-black bg-opacity-40 p-3 rounded-lg border border-red-900 hover:border-red-500 transition-all group items-center">
              <img src={song.thumbnail} alt="Thumbnail" className="w-16 h-12 object-cover rounded-md" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate" dangerouslySetInnerHTML={{ __html: song.title }}></p>
              </div>
              <button 
                onClick={() => onAddSong(song)}
                className="bg-green-700 hover:bg-green-500 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 shadow-lg"
                title="Tambahkan ke Antrean"
              >
                ➕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}