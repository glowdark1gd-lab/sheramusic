import { NextResponse } from 'next/server';

export async function GET(request) {
  // 1. Sistem Keamanan Sederhana: Cek Token Rahasia
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.APP_SECRET_TOKEN}`) {
    return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
  }

  // 2. Ambil kata kunci pencarian dari URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Query kosong' }, { status: 400 });

  // 3. Panggil YouTube API dari sisi Server (Aman)
  const apiKey = process.env.YOUTUBE_API_KEY;
  const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + ' karaoke')}&maxResults=10&key=${apiKey}`;

  try {
    const res = await fetch(youtubeUrl);
    const data = await res.json();
    
    // Format data agar lebih bersih sebelum dikirim ke Frontend
    const songs = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    return NextResponse.json({ songs });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}