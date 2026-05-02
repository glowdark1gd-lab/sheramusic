'use client';
import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { supabase } from '../lib/supabase';

export default function KaraokePlayer({ currentSong, isTVMode }) {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!player) return;

    const channel = supabase.channel('player-control-channel')
      .on('broadcast', { event: 'playback' }, ({ payload }) => {
        if (payload.action === 'play') {
          player.playVideo();
        } else if (payload.action === 'pause') {
          player.pauseVideo();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [player]);

  const handleSongEnd = async () => {
    if (currentSong) {
      await supabase.from('playlist').delete().eq('id', currentSong.id);
    }
  };

  const handleReady = (event) => {
    setPlayer(event.target);
    event.target.playVideo();
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  // SAAT ANTREAN KOSONG
  if (!currentSong) {
    if (isTVMode) {
      // Screensaver TV (Ukuran Dinamis)
      return (
        <div className="flex flex-col items-center justify-center border-4 border-red-700 bg-black rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all duration-500 w-[95%] max-w-[1100px] aspect-video max-h-[75vh]">
          <div className="animate-pulse flex flex-col items-center scale-75 md:scale-100">
             <h2 className="text-5xl md:text-6xl font-extrabold text-red-600 tracking-wider mb-6 drop-shadow-lg">
               SHERA <span className="text-white">MUSIC</span>
             </h2>
             <p className="text-xl md:text-3xl text-gray-200 bg-red-950 bg-opacity-80 px-8 py-4 rounded-full border-2 border-red-800 shadow-2xl flex items-center gap-3">
               <span>📞</span> Booking via Telp/WhatsApp: 
               <span className="text-green-400 font-black tracking-widest">08117873878</span>
             </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center text-red-500 font-bold border-4 border-red-700 bg-black rounded-xl shadow-2xl transition-all duration-500 w-full aspect-video max-h-[300px]">
          Belum ada lagu di antrean
        </div>
      );
    }
  }

  // TAMPILAN LAPTOP (Thumbnail)
  if (!isTVMode) {
    return (
      <div className="w-full aspect-video max-h-[300px] relative rounded-xl overflow-hidden border-4 border-red-800 shadow-xl flex items-center justify-center bg-black group">
         <img 
           src={currentSong.thumbnail.replace('default.jpg', 'hqdefault.jpg')} 
           alt="Thumbnail" 
           className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-all" 
         />
         <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="flex items-center gap-2 bg-green-900 bg-opacity-70 px-4 py-1 rounded-full mb-3 border border-green-500 shadow-lg">
               <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-green-100 font-bold text-sm tracking-wider">SEDANG DIPUTAR DI TV</span>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] px-2">
              {currentSong.title}
            </h3>
         </div>
      </div>
    );
  }

  // TAMPILAN TV (Memutar Video, Dinamis)
  return (
    <div className="border-4 border-red-700 bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-500 flex justify-center items-center w-[95%] max-w-[1100px] aspect-video max-h-[75vh]">
      <YouTube 
        videoId={currentSong.video_id} 
        opts={opts} 
        onEnd={handleSongEnd}
        onReady={handleReady}
        className="w-full h-full flex justify-center items-center pointer-events-none"
      />
    </div>
  );
}