'use client';
import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { supabase } from '../lib/supabase';

export default function KaraokePlayer({ currentSong, isTVMode }) {
  const [player, setPlayer] = useState(null);

  // Menerima sinyal Play/Pause dari HP (Remote)
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

  // Dipanggil saat YouTube IFrame selesai dimuat
  const handleReady = (event) => {
    setPlayer(event.target);
    event.target.playVideo(); // Paksa otomatis Play (berguna saat halaman ter-reload)
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  if (!currentSong) {
    return (
      <div className={`flex items-center justify-center text-red-500 font-bold border-4 border-red-700 bg-black rounded-xl shadow-2xl transition-all duration-500 ${isTVMode ? 'w-[1000px] h-[560px] md:w-[1200px] md:h-[675px]' : 'w-full aspect-video max-h-[300px]'}`}>
        Belum ada lagu di antrean
      </div>
    );
  }

  return (
    <div className={`border-4 border-red-700 bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-500 flex justify-center items-center ${isTVMode ? 'w-[1000px] h-[560px] md:w-[1200px] md:h-[675px]' : 'w-full aspect-video max-h-[300px]'}`}>
      <YouTube 
        videoId={currentSong.video_id} 
        opts={opts} 
        onEnd={handleSongEnd}
        onReady={handleReady}
        className={`w-full h-full flex justify-center items-center ${isTVMode ? 'pointer-events-none' : ''}`}
      />
    </div>
  );
}