"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";

// ==========================================
// 1. KHO DỮ LIỆU PHIM (Giữ nguyên của Zhaodi)
// ==========================================
const danhSachPhim = [
  {
    id: 1,
    title: "Sau Khi Ẩn Hôn Với Thương Tổng, Hình Tượng Lạnh Lùng Của Anh Ấy Sụp Đổ - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/thumbnail_94d3bddb.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/playlist.m3u8",
    audioSrc: "https://vz-f76c4946-df1.b-cdn.net/95270cae-75f8-4f2a-91bf-96ad5cf8fb96/play_720p.mp4",
  },
  {
    id: 2,
    title: "Trọng Sinh Vả Mặt Tổng Tài - Bản Full",
    thumb: "https://via.placeholder.com/300x450/1f2937/fbbf24?text=Poster+Phim+2",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/2c7d772d-92ec-4df8-a0cf-a76c7ed88b43/playlist.m3u8",
    audioSrc: "LINK_MP3_THUYET_MINH_2",
  },
];

// ==========================================
// 2. GIAO DIỆN PHÒNG CHIẾU (Đồng bộ tuyệt đối)
// ==========================================
function PhongChieu({ phim, onClose, isActive }: { phim: any; onClose: () => void; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isThuyetMinh, setIsThuyetMinh] = useState(false);
  const [isMuted, setIsMuted] = useState(isActive); // Khắc phục lỗi image_92e051.png
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 1. Đồng bộ Tốc độ (Playback Rate)
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // 2. Chống âm thanh "đi lạc" khi vuốt phim
  useEffect(() => {
    if (!isActive) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current?.play().catch(() => {});
    }
  }, [isActive]);

  // 3. Giải mã Bunny Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(phim.videoSrc);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [phim.videoSrc, isActive]);

  // 4. Hàm đồng bộ Thuyết minh cực mạnh
  const forceSync = useCallback(() => {
    if (isActive && isThuyetMinh && videoRef.current && audioRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      videoRef.current.volume = 0.1;
      if (!videoRef.current.paused) audioRef.current.play().catch(() => {});
    }
  }, [isThuyetMinh, isActive]);

  useEffect(() => {
    if (isThuyetMinh) forceSync();
    else if (videoRef.current) { videoRef.current.volume = 1.0; audioRef.current?.pause(); }
  }, [isThuyetMinh, forceSync]);

  return (
    <div className="relative w-full h-[100dvh] bg-black flex items-center justify-center overflow-hidden" onClick={() => setIsMuted(false)}>
      <video
        ref={videoRef}
        poster={phim.thumb}
        className="w-full h-full object-contain z-10"
        playsInline loop autoPlay muted={isMuted}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onSeeking={forceSync} // Tua là Audio nhảy theo ngay
        onSeeked={forceSync}  // Tua xong khớp lệnh lần nữa
        onWaiting={() => audioRef.current?.pause()} // Video lag thì Audio đợi
        onPlaying={() => { if (isThuyetMinh && isActive && !isMuted) audioRef.current?.play().catch(() => {}); }}
      />
      <audio ref={audioRef} src={phim.audioSrc} preload="auto" className="hidden" />

      {/* NÚT QUAY LẠI RÕ ĐẸP */}
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-6 left-6 z-[100] text-white/70 hover:text-white flex items-center gap-2">
        <span className="text-2xl">←</span> <span className="text-sm font-bold">Quay lại</span>
      </button>

      {/* THANH THỜI GIAN SIÊU MỎNG */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-50">
        <div className="h-full bg-yellow-500 transition-all duration-100" style={{ width: `${(currentTime / duration) * 100}%` }} />
      </div>

      {/* CỘT NÚT ĐIỀU KHIỂN BÊN PHẢI */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-50">
        <button onClick={(e) => { e.stopPropagation(); setPlaybackRate(r => r === 1 ? 1.25 : r === 1.25 ? 1.5 : 1); }} className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full border border-white/10 text-[10px] font-bold text-white">{playbackRate}x</div>
          <span className="text-white text-[10px] mt-1 font-bold">Tốc độ</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); setIsThuyetMinh(!isThuyetMinh); }} className="flex flex-col items-center">
          <div className={`p-3 rounded-full border transition-all ${isThuyetMinh ? "bg-yellow-500 border-yellow-400" : "bg-black/40 border-white/20"}`}>
            <span className="text-[10px] font-black text-white">{isThuyetMinh ? "TM" : "SUB"}</span>
          </div>
          <span className="text-white text-[10px] mt-1 font-bold">Chế độ</span>
        </button>
      </div>

      <div className="absolute left-4 bottom-10 z-50">
        <h2 className="text-white font-black text-lg drop-shadow-lg">@sapnhazhaodi</h2>
        <p className="text-white/90 text-sm max-w-[280px] line-clamp-2 leading-tight font-medium">{phim.title}</p>
      </div>
    </div>
  );
}

// ==========================================
// 3. TRANG CHỦ (GIỮ NGUYÊN THIẾT KẾ GRID RÕ ĐẸP)
// ==========================================
export default function Home() {
  const [phimDangXem, setPhimDangXem] = useState<any>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);

  // Cảm biến cuộn: Video nào hiện ra mới được phát tiếng
  useEffect(() => {
    if (!phimDangXem) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveId(Number(e.target.getAttribute("data-id"))); }),
      { threshold: 0.6 }
    );
    document.querySelectorAll(".film-section").forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [phimDangXem]);

  if (phimDangXem) {
    return (
      <div className="fixed inset-0 bg-black overflow-y-scroll snap-y snap-mandatory hide-scrollbar z-[100]">
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div className="film-section h-[100dvh]" data-id={phimDangXem.id}>
          <PhongChieu phim={phimDangXem} onClose={() => setPhimDangXem(null)} isActive={activeId === phimDangXem.id} />
        </div>
        {danhSachPhim.filter(p => p.id !== phimDangXem.id).map(p => (
          <div key={p.id} className="film-section h-[100dvh]" data-id={p.id}>
            <PhongChieu phim={p} onClose={() => setPhimDangXem(null)} isActive={activeId === p.id} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4">
      {/* HEADER GỐC RÕ ĐẸP */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 pt-4 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-yellow-500 italic drop-shadow-lg">Sạp nhà Zhaodi</h1>
        <div className="flex gap-3">
          <input 
            type="text" placeholder="Tìm kiếm phim..." value={tuKhoa} onChange={e => setTuKhoa(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-yellow-500 w-48"
          />
          <button className="bg-yellow-500 text-black font-bold py-2 px-5 rounded-full text-sm shadow-lg">Đăng nhập</button>
        </div>
      </header>

      {/* LƯỚI POSTER RÕ ĐẸP */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold mb-6 border-l-4 border-yellow-500 pl-3">Phim Mới Cập Nhật</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[...danhSachPhim].reverse().filter(p => p.title.toLowerCase().includes(tuKhoa.toLowerCase())).map((p) => (
            <div key={p.id} onClick={() => { setPhimDangXem(p); setActiveId(p.id); }} className="cursor-pointer group">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-yellow-500 transition-all shadow-2xl relative">
                <img src={p.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-red-600 text-[10px] font-extrabold px-2 py-1 rounded-md">FULL</div>
              </div>
              <p className="mt-3 text-sm font-bold line-clamp-2 group-hover:text-yellow-400 transition-colors leading-snug">{p.title}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}