'use client';

export default function PlaylistView({ queue, onDelete }) {
  if (queue.length === 0) return null;

  // Lewati lagu urutan pertama (index 0) karena sedang diputar di Player
  const upcomingSongs = queue.slice(1);

  return (
    <div className="bg-red-950 p-4 rounded-lg shadow-lg">
      <h2 className="text-white font-bold text-xl mb-4 border-b-2 border-red-600 pb-2">Antrean Selanjutnya</h2>
      {upcomingSongs.length === 0 ? (
        <p className="text-red-300 italic">Kosong. Ayo tambah lagu!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcomingSongs.map((song, index) => (
            <li key={song.id} className="flex items-center gap-3 bg-red-900 p-2 rounded">
              <span className="text-red-400 font-bold text-lg w-6">{index + 1}.</span>
              <img src={song.thumbnail} alt={song.title} className="w-16 h-auto rounded" />
              <p className="text-white text-sm flex-1">{song.title}</p>
              <button 
                onClick={() => onDelete(song.id)}
                className="text-red-300 hover:text-white bg-red-800 px-2 py-1 rounded"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}