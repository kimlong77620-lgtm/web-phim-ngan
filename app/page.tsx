"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";


// ==========================================
// 1. KHO DỮ LIỆU CỦA TIÊN SINH
// ==========================================
const danhSachPhim = [
  {
    id: 1,
    title: "Sau Khi Ẩn Hôn Với Thương Tổng, Hình Tượng Lạnh Lùng Của Anh Ấy Sụp Đổ - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/thumbnail_dad53ad2.jpg", // Link ảnh Poster phim
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/playlist.m3u8",
    audioSrc: "https://vz-f76c4946-df1.b-cdn.net/95270cae-75f8-4f2a-91bf-96ad5cf8fb96/play_720p.mp4",
  },
  {
    id: 2,
    title: "Trọng Sinh Vả Mặt Tổng Tài - Bản Full",
    thumb: "https://via.placeholder.com/300x450/1f2937/fbbf24?text=Poster+Phim+2", // Link ảnh Poster phim
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/2c7d772d-92ec-4df8-a0cf-a76c7ed88b43/playlist.m3u8",
    audioSrc: "LINK_MP3_THUYET_MINH_2",
  },
  // Thêm phim mới thì copy khối ở trên dán xuống đây
];

// ==========================================
// 2. GIAO DIỆN PHÒNG CHIẾU (Khi ấn vào xem phim)
function PhongChieu({ phim, onClose }: { phim: any; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isThuyetMinh, setIsThuyetMinh] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. FACEBOOK SDK CHO BÌNH LUẬN
  useEffect(() => {
    if (!document.getElementById('fb-sdk')) {
      const script = document.createElement('script');
      script.id = 'fb-sdk';
      script.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v19.0";
      script.async = true; script.defer = true; script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    } else if ((window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, []);

  // 2. BỘ GIẢI MÃ BẢO MẬT BUNNY STREAM (HLS.JS)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Nếu trình duyệt hỗ trợ HLS.js (Chrome, Cốc Cốc, Edge, Firefox)
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(phim.videoSrc); // Load link .m3u8
      hls.attachMedia(video);
      return () => hls.destroy(); // Dọn dẹp khi đóng phim
    } 
    // Dành cho Safari (tự hỗ trợ m3u8 không cần giải mã)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = phim.videoSrc;
    }
  }, [phim.videoSrc]);

  // 3. CƠ CHẾ TỰ ẨN GIAO DIỆN
  const resetTimer = useCallback(() => {
    setShowUI(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowUI(false), 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resetTimer]);

  // 4. ĐỒNG BỘ ÂM THANH (CHỈNH VOLUME NHẠC GỐC 30%)
  const syncAudioWithVideo = useCallback(() => {
    if (isThuyetMinh && videoRef.current && audioRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      videoRef.current.volume = 0.3; 
      audioRef.current.volume = 1.0; 
      if (!videoRef.current.paused) {
        audioRef.current.play().catch(() => console.log("Cần chạm màn hình"));
      }
    }
  }, [isThuyetMinh]);

  useEffect(() => {
    if (isThuyetMinh) {
      syncAudioWithVideo();
    } else if (videoRef.current) {
      videoRef.current.volume = 1.0; 
      audioRef.current?.pause();
    }
  }, [isThuyetMinh, syncAudioWithVideo]);

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black overflow-y-auto z-50">
      {/* ================= KHU VỰC CHIẾU PHIM TỐI GIẢN ================= */}
      <div 
        className="relative w-full h-[100dvh] flex items-center justify-center bg-black overflow-hidden shrink-0"
        onMouseMove={resetTimer} onTouchStart={resetTimer} onClick={resetTimer}
      >
        <video
          ref={videoRef}
          className="w-full max-h-full object-contain z-10"
          controls
          playsInline
          autoPlay
          onPlay={() => isThuyetMinh && audioRef.current?.play()}
          onPause={() => audioRef.current?.pause()}
          onSeeking={() => isThuyetMinh && audioRef.current && videoRef.current ? (audioRef.current.currentTime = videoRef.current.currentTime) : null}
        />
        <audio ref={audioRef} src={phim.audioSrc} preload="auto" className="hidden" />

        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={`absolute top-4 left-4 z-50 p-2 bg-black/30 rounded-full text-white hover:bg-black/60 transition-all duration-500 backdrop-blur-sm ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className={`absolute right-3 bottom-24 flex flex-col gap-4 items-center z-50 transition-all duration-500 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="flex flex-col items-center group">
            <div className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white text-lg shadow-lg border border-white/20">❤️</div>
            <span className="text-white text-[10px] mt-1 font-medium drop-shadow">67k</span>
          </button>

          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="flex flex-col items-center group relative">
            <div className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white text-lg group-hover:bg-blue-600 transition-colors shadow-lg border border-white/20">🔗</div>
            <span className="text-white text-[10px] mt-1 font-medium drop-shadow">Chia sẻ</span>
            {isCopied && <span className="absolute -left-16 top-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">Đã chép</span>}
          </button>

          <button onClick={(e) => { e.stopPropagation(); const status = !isThuyetMinh; setIsThuyetMinh(status); if (status && videoRef.current) { videoRef.current.currentTime += 0.01; setTimeout(() => syncAudioWithVideo(), 100); } }} className="flex flex-col items-center group">
            <div className={`p-2 rounded-full border transition-all duration-300 backdrop-blur-sm shadow-lg ${isThuyetMinh ? "border-yellow-500 bg-yellow-500/30" : "border-white/30 bg-black/40"}`}>
              <span className="text-[10px] font-bold text-white uppercase leading-none">{isThuyetMinh ? "TM" : "SUB"}</span>
            </div>
            <span className="text-white text-[10px] mt-1 font-medium drop-shadow">Chế độ</span>
          </button>
        </div>
      </div>

      {/* ================= KHU VỰC BÌNH LUẬN FACEBOOK ================= */}
      <div className="w-full bg-white p-4 min-h-[50vh]">
        <h3 className="text-black font-bold text-lg mb-2 border-b-2 border-blue-500 inline-block pb-1">💬 Đánh giá & Bình luận</h3>
        <p className="text-xs text-gray-500 mb-4">Sử dụng tài khoản Facebook của bạn để thảo luận về bộ phim này nhé!</p>
        <div className="fb-comments w-full" data-href={`https://sapnhazhaodi.vercel.app/phim/${phim.id}`} data-width="100%" data-numposts="5" data-colorscheme="light"></div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TRANG CHỦ MẶC ĐỊNH (Có Tìm Kiếm & Poster Phim)
// ==========================================
export default function Home() {
  const [phimDangXem, setPhimDangXem] = useState<any>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  
  const [showMenu, setShowMenu] = useState(false);
  const danhMuc = ["Tất cả", "Hệ Thống", "Trọng Sinh", "Vả Mặt", "Cổ Trang", "Ngôn Tình"];
  const dienVien = ["Triệu Lộ Tư", "Vương Hạc Đệ", "Bạch Lộc", "Ngu Thư Hân", "Trương Lăng Hách"]; 
  
  const menuRef = useRef<HTMLDivElement>(null);

  // === TIÊN SINH DÁN (CTRL + V) ĐOẠN MÃ VÀO NGAY ĐÂY ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);
  // ====================================================

  // Bộ lọc tìm kiếm
  const phimHienThi = danhSachPhim.filter((phim) =>
  // ...
    phim.title.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  // Nếu có phim đang xem -> Bật Phòng Chiếu
  if (phimDangXem) {
    return <PhongChieu phim={phimDangXem} onClose={() => setPhimDangXem(null)} />;
  }

  // Nếu không có phim nào đang xem -> Hiện Trang Chủ
  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4 pb-20">
      
{/* Phần Header & Tìm kiếm */}
      <header className="sticky top-0 z-40 bg-[#0b0f19] pt-4 pb-4 px-4 border-b border-gray-800 shadow-md">
        
        {/* Hàng 1: Tên Sạp & Đăng Nhập */}
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-wide">
            Sạp nhà Zhaodi
          </h1>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-full text-sm transition-all shadow-[0_0_10px_rgba(234,179,8,0.3)] flex items-center gap-2">
            <span className="text-lg">👤</span> 
            <span className="hidden md:inline">Đăng nhập</span>
          </button>
        </div>

        {/* Hàng 2: Menu 3 Gạch & Thanh Tìm Kiếm */}
        <div className="max-w-4xl mx-auto flex gap-3 relative z-50">
          
          {/* CỤM MENU CÓ GẮN CON MẮT THEO DÕI (menuRef) */}
          <div ref={menuRef} className="relative flex-none">
            
            {/* Nút 3 gạch */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-500 px-3 py-2 rounded-lg border border-gray-700 flex items-center gap-2 transition-all whitespace-nowrap h-full"
            >
              <span className="text-xl leading-none">☰</span>
              <span className="hidden sm:inline text-sm font-bold text-white">Danh mục</span>
            </button>

            {/* Bảng Dropdown */}
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
                
                {/* Thể Loại */}
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-800/80 sticky top-0">
                  🎬 Thể Loại
                </div>
                {danhMuc.map((item, idx) => (
                  <button 
                    key={`cat-${idx}`}
                    onClick={() => {
                      setTuKhoa(item === "Tất cả" ? "" : item);
                      setShowMenu(false); 
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-yellow-500 hover:text-black transition-colors"
                  >
                    {item}
                  </button>
                ))}

                <div className="border-t border-gray-700 my-1"></div>

                {/* Diễn Viên */}
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-800/80 sticky top-0">
                  🎭 Diễn Viên
                </div>
                {dienVien.map((actor, idx) => (
                  <button 
                    key={`actor-${idx}`}
                    onClick={() => {
                      setTuKhoa(actor); 
                      setShowMenu(false); 
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-yellow-500 hover:text-black transition-colors"
                  >
                    {actor}
                  </button>
                ))}

              </div>
            )}
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm phim..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              className="w-full h-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded-lg py-2.5 px-4 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* Lưới Hiển Thị Phim */}
      <div className="max-w-4xl mx-auto mt-6">
        <h2 className="text-lg font-bold mb-4 border-l-4 border-yellow-500 pl-2">
          Phim Mới Cập Nhật
        </h2>
        
        {phimHienThi.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Không tìm thấy phim nào!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {phimHienThi.map((phim) => (
              <div 
                key={phim.id} 
                onClick={() => setPhimDangXem(phim)} // Bấm vào là xem
                className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all shadow-lg"
              >
                {/* Ảnh Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={phim.thumb} 
                    alt={phim.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    FULL
                  </div>
                  {/* Lớp mờ đen bên dưới ảnh để nổi chữ (nếu muốn dán chữ lên ảnh) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                
                {/* Tên Phim */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {phim.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}