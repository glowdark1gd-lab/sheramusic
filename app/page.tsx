'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import SearchBar from './components/SearchBar';
import KaraokePlayer from './components/KaraokePlayer';
import PlaylistView from './components/PlaylistView';

export default function Home() {
  const [queue, setQueue] = useState([]);
  const [isTVMode, setIsTVMode] = useState(false);
  const [addedSongModal, setAddedSongModal] = useState(null);
  const [controlChannel, setControlChannel] = useState(null);

  useEffect(() => {
    // 1. Fetch Playlist
    const fetchQueue = async () => {
      const { data } = await supabase.from('playlist').select('*').order('created_at', { ascending: true });
      if (data) setQueue(data);
    };

    fetchQueue();
    
    // 2. Realtime Database (Antrean Lagu)
    const dbChannel = supabase.channel('realtime-playlist')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist' }, () => {
        fetchQueue();
      }).subscribe();

    // 3. Setup Channel untuk Remote Control (Play/Pause)
    const remoteChan = supabase.channel('player-control-channel');
    remoteChan.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setControlChannel(remoteChan);
      }
    });

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(remoteChan);
    };
  }, []);

  // -- FUNGSI REMOTE CONTROL --
  const handleAddSong = async (song) => {
    const { error } = await supabase.from('playlist').insert([
      { video_id: song.videoId, title: song.title, thumbnail: song.thumbnail }
    ]);
    if (!error) {
      setAddedSongModal(song);
      setTimeout(() => setAddedSongModal(null), 2000);
    }
  };

  const handleDeleteSong = async (id) => {
    await supabase.from('playlist').delete().eq('id', id);
  };

  const handleNextSong = async () => {
    if (queue.length > 0) {
      await handleDeleteSong(queue[0].id); // Hapus lagu saat ini, otomatis lanjut lagu kedua
    }
  };

  const sendPlaybackCommand = (action) => {
    if (controlChannel) {
      controlChannel.send({
        type: 'broadcast',
        event: 'playback',
        payload: { action }
      });
    }
  };
  // ---------------------------

  const currentSong = queue.length > 0 ? queue[0] : null;

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-x-hidden">

      {/* 1. MODAL POP-UP */}
      {addedSongModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 animate-fade-in px-4">
          <div className="bg-red-950 border-2 border-red-500 p-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.6)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(34,197,94,0.8)]">
              <span className="text-white text-3xl font-bold">✓</span>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Berhasil Masuk Antrean!</h2>
            <p className="text-red-300 text-sm max-w-[250px] truncate">{addedSongModal.title}</p>
          </div>
        </div>
      )}

      {/* 2. PLAYER VIDEO */}
      <div className={`transition-all duration-700 z-50 ${isTVMode ? 'fixed inset-0 bg-black flex flex-col items-center justify-start pt-12 px-4 pb-4 overflow-y-auto' : 'relative p-4 md:p-8 flex justify-center'}`}>
         {isTVMode && (
           <>
             <button onClick={() => setIsTVMode(false)} className="absolute top-4 right-4 bg-red-900 bg-opacity-30 hover:bg-opacity-100 text-white px-4 py-2 rounded transition-all z-[60]">
               ✖ Keluar TV
             </button>
             <div className="flex flex-col items-center pb-6 animate-fade-in w-full shrink-0">
               <div className="flex items-center gap-4">
                 <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                 <h1 className="text-5xl md:text-6xl font-extrabold text-red-600 tracking-wider">SHERA <span className="text-white">MUSIC</span></h1>
               </div>
               <h2 className="text-2xl md:text-3xl mt-4 font-bold text-red-200 bg-red-900 bg-opacity-40 px-8 py-2 rounded-full shadow-lg max-w-4xl truncate text-center border border-red-800">
                 {currentSong ? currentSong.title : 'Silakan Pilih Lagu...'}
               </h2>
             </div>
           </>
         )}

         <div className={!isTVMode ? "bg-red-950 p-4 rounded-xl shadow-lg border border-red-900 w-full max-w-3xl" : "flex justify-center w-full"}>
           {!isTVMode && (
             <h2 className="text-white font-bold mb-3 flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span> Preview Layar (Remote)
             </h2>
           )}
           <div className="flex justify-center w-full">
             <KaraokePlayer currentSong={currentSong} isTVMode={isTVMode} />
           </div>
           
           {/* TAMPILAN TOMBOL KONTROL REMOTE KHUSUS DI HP/LAPTOP */}
           {!isTVMode && currentSong && (
             <div className="flex justify-center gap-3 mt-4 bg-black bg-opacity-40 p-3 rounded-lg border border-red-800">
                <button onClick={() => sendPlaybackCommand('play')} className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded-md font-bold shadow-lg transition-all">
                  ▶ Play
                </button>
                <button onClick={() => sendPlaybackCommand('pause')} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-md font-bold shadow-lg transition-all">
                  ⏸ Pause
                </button>
                <button onClick={handleNextSong} className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-md font-bold shadow-lg transition-all">
                  ⏭ Next
                </button>
             </div>
           )}

         </div>
      </div>

      {/* 3. KONTEN REMOTE */}
      <div className={`${isTVMode ? 'hidden' : 'block'} px-4 md:px-8 pb-8`}>
        <header className="flex justify-between items-center mb-8 border-b-2 border-red-800 pb-4">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider">SHERA <span className="text-white">MUSIC</span></h1>
          <button onClick={() => setIsTVMode(true)} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all">
            📺 Buka Mode TV
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SearchBar onAddSong={handleAddSong} />
          </div>
          <div className="md:col-span-1">
            <PlaylistView queue={queue} onDelete={handleDeleteSong} />
          </div>
        </div>
      </div>

    </div>
  );
}