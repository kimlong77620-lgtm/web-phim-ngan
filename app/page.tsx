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
    thumb: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/thumbnail_94d3bddb.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/7e8dbf83-e9d7-4b26-812f-9723d066a3a6/playlist.m3u8",
    theLoai: ["Ngôn Tình", "hoán đổi"],
    dienVien: ["Triệu Lộ Tư"]
  },
  {
    id: 2,
    title: "Nụ Hôn Ánh Trăng Của Thiên Tuế Đại Nhân - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/3f32b4e6-450d-45d0-989f-724a5547bd2a/thumbnail_4b03d11f.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/3f32b4e6-450d-45d0-989f-724a5547bd2a/playlist.m3u8",
    theLoai: ["Huyền Huyễn", "Ngôn Tình"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 3,
    title: "Xuyên Thành Bạn Gái Cũ Tâm Cơ Của Nam Chính - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/2933f93d-cdbb-4bd9-9eb1-628d99cb9394/thumbnail_3e21ea7c.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/2933f93d-cdbb-4bd9-9eb1-628d99cb9394/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 4,
    title: "Giang Sơn Như Họa, Thất Phượng Cùng Ta Đoạt Thiên Hạ - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/5c0a3382-c740-4830-8324-21fac7e18ee1/thumbnail.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/5c0a3382-c740-4830-8324-21fac7e18ee1/playlist.m3u8",
    theLoai: ["Xuyên Không", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 5,
    title: "Tuyệt Tình Chưởng Môn Ngã Vào Lòng Ta - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/9f4d0e7a-d3cb-4085-bc9f-53d7a91d2129/thumbnail.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/9f4d0e7a-d3cb-4085-bc9f-53d7a91d2129/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  }
];

// ==========================================
// 2. GIAO DIỆN PHÒNG CHIẾU (Vuốt cuộn Hongguo & UI Tối giản)
// ==========================================

// --- COMPONENT CON: Xử lý riêng từng Video ---
function TrinhPhatVideo({ phim, isActive, onClose }: { phim: any; isActive: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [progress, setProgress] = useState(0);
  const [isThuyetMinh, setIsThuyetMinh] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const [qualities, setQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setShowUI(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowUI(false);
      setShowVolumeSlider(false);
      setShowQualityMenu(false);
    }, 3500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resetTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = data.levels.map((level: any, index: number) => ({
          height: level.height,
          index: index
        }));
        availableQualities.sort((a, b) => b.height - a.height);
        setQualities(availableQualities);
      });

      hls.loadSource(phim.videoSrc);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = phim.videoSrc;
    }

    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [phim.videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, isMuted, volume]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    resetTimer();
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const tuaNhanh = (giay: number) => {
    if (videoRef.current) videoRef.current.currentTime += giay;
    resetTimer();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const phanTram = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(phanTram || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
    resetTimer();
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTimer();
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setPlaybackRate(nextSpeed);
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTimer();
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?phimId=${phim.id}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Không thể copy", err);
    }
  };

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTimer();
    const newStatus = !isThuyetMinh;
    setIsThuyetMinh(newStatus);
    
    if (hlsRef.current) {
      hlsRef.current.audioTrack = newStatus ? 1 : 0;
    } else if (videoRef.current && (videoRef.current as any).audioTracks) {
      const tracks = (videoRef.current as any).audioTracks;
      if (tracks.length > 1) {
        for (let i = 0; i < tracks.length; i++) tracks[i].enabled = (i === (newStatus ? 1 : 0));
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex justify-center items-center overflow-hidden" onMouseMove={resetTimer} onTouchStart={resetTimer}>
      
      <video
        ref={videoRef}
        playsInline
        loop
        className="w-full max-h-full object-contain z-10"
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="absolute inset-0 z-20" onClick={togglePlay} />

      <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="pointer-events-auto absolute top-6 left-4 p-2.5 bg-black/40 rounded-full text-white hover:bg-black/80 transition-all backdrop-blur-md shadow-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="pointer-events-auto absolute right-4 bottom-32 flex flex-col gap-5 items-center">
          
          <button onClick={cycleSpeed} className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg font-bold text-xs">
            {playbackRate}x
          </button>

          {qualities.length > 1 && (
            <div className="relative flex items-center justify-center">
              {showQualityMenu && (
                <div className="absolute right-full mr-2 bg-black/80 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md shadow-lg z-50 min-w-[70px]">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(hlsRef.current) hlsRef.current.currentLevel = -1;
                      setCurrentQuality(-1); 
                      setShowQualityMenu(false); 
                      resetTimer(); 
                    }}
                    className={`text-xs font-bold py-1.5 px-2 rounded transition-colors ${currentQuality === -1 ? 'bg-yellow-500 text-black' : 'text-white hover:bg-white/20'}`}
                  >
                    Auto
                  </button>
                  {qualities.map((q) => (
                    <button
                      key={q.index}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if(hlsRef.current) hlsRef.current.currentLevel = q.index;
                        setCurrentQuality(q.index); 
                        setShowQualityMenu(false); 
                        resetTimer(); 
                      }}
                      className={`text-xs font-bold py-1.5 px-2 rounded transition-colors ${currentQuality === q.index ? 'bg-yellow-500 text-black' : 'text-white hover:bg-white/20'}`}
                    >
                      {q.height}p
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowQualityMenu(!showQualityMenu); 
                  setShowVolumeSlider(false);
                  resetTimer(); 
                }}
                className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg font-bold text-[10px]"
              >
                {currentQuality === -1 ? 'AUTO' : `${qualities.find(q => q.index === currentQuality)?.height}p`}
              </button>
            </div>
          )}

          <button onClick={handleToggleAudio} className={`p-2.5 rounded-full border transition-all duration-300 backdrop-blur-md shadow-lg ${isThuyetMinh ? "border-yellow-500 bg-yellow-500/30 text-yellow-400" : "border-white/30 bg-black/50 text-white"}`}>
            <span className="text-[10px] font-extrabold uppercase leading-none block w-6 text-center">{isThuyetMinh ? "TM" : "SUB"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            {showVolumeSlider && (
              <div 
                className="absolute right-full mr-2 transition-all duration-300 w-28 bg-black/60 p-3 rounded-full flex items-center backdrop-blur-md shadow-lg z-50"
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); resetTimer(); }}
              >
                <input
                  type="range"
                  min="0" max="1" step="0.01"
                  value={isMuted ? 0 : volume}
                  onInput={(e) => {
                    e.stopPropagation();
                    const val = parseFloat(e.currentTarget.value);
                    setVolume(val);
                    setIsMuted(val === 0);
                    if (videoRef.current) {
                      videoRef.current.volume = val;
                      videoRef.current.muted = (val === 0);
                    }
                    resetTimer();
                  }}
                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500 relative z-50 touch-none"
                />
              </div>
            )}

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                resetTimer();
                setShowVolumeSlider(!showVolumeSlider);
                setShowQualityMenu(false);
              }} 
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-3 bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg relative z-10"
            >
              {isMuted || volume === 0 ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : volume < 0.5 ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
          </div>

          <button onClick={handleCopy} className="relative p-3 bg-black/50 rounded-full text-white hover:bg-blue-600 transition-colors backdrop-blur-md shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            {isCopied && <span className="absolute -left-[70px] top-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">Đã chép link</span>}
          </button>
        </div>

        <div className="pointer-events-auto absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-8 px-6" onPointerDown={(e) => e.stopPropagation()}>
          
          <div className="flex justify-center items-center gap-12 mb-6">
            <button onClick={(e) => { e.stopPropagation(); tuaNhanh(-10); }} className="text-white/70 hover:text-white transition-transform active:scale-90">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            </button>
            
            <button onClick={(e) => togglePlay(e)} className="p-4 bg-white/20 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-all active:scale-90 backdrop-blur-md border border-white/30 shadow-xl">
              {isPlaying ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button onClick={(e) => { e.stopPropagation(); tuaNhanh(10); }} className="text-white/70 hover:text-white transition-transform active:scale-90">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            </button>
          </div>

          <input
            type="range"
            min="0" max="100" step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:h-2 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT CHA: Quản lý danh sách cuộn ---
function PhongChieu({ phim: initialPhim, onClose }: { phim: any; onClose: () => void }) {
  const [activeId, setActiveId] = useState(initialPhim.id);

  const danhSachPhimHienThi = [...danhSachPhim].sort((a, b) => b.id - a.id);

  useEffect(() => {
    const el = document.getElementById(`snap-video-${initialPhim.id}`);
    if (el) el.scrollIntoView({ behavior: 'instant' });
  }, [initialPhim.id]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const newId = Number(entry.target.getAttribute('data-id'));
          setActiveId(newId);
          window.history.replaceState(null, '', `?phimId=${newId}`);
        }
      });
    }, { threshold: 0.6 });

    const elements = document.querySelectorAll('.snap-video-item');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[100dvh] bg-black z-50 overflow-y-scroll snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {danhSachPhimHienThi.map((phimItem) => (
        <div
          key={phimItem.id}
          id={`snap-video-${phimItem.id}`}
          data-id={phimItem.id}
          className="snap-video-item relative w-full h-[100dvh] snap-start snap-always shrink-0 bg-black"
        >
          <TrinhPhatVideo 
            phim={phimItem} 
            isActive={activeId === phimItem.id} 
            onClose={() => {
              window.history.replaceState(null, '', window.location.pathname);
              onClose();
            }} 
          />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 3. TRANG CHỦ MẶC ĐỊNH
// ==========================================
export default function Home() {
  const [phimDangXem, setPhimDangXem] = useState<any>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  
  const danhMuc = ["Tất cả", "Hệ Thống", "Trọng Sinh", "Vả Mặt", "Cổ Trang", "Ngôn Tình"];
  const dienVien = ["Triệu Lộ Tư", "Vương Hạc Đệ", "Bạch Lộc", "Ngu Thư Hân", "Trương Lăng Hách"]; 
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('phimId');
    if (id) {
      const foundPhim = danhSachPhim.find(p => p.id === Number(id));
      if (foundPhim) setPhimDangXem(foundPhim); 
    }
  }, []);

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

  const phimHienThi = danhSachPhim
    .filter((phim) => {
      const keyword = tuKhoa.toLowerCase();
      const titleMatch = phim.title.toLowerCase().includes(keyword);
      const theLoaiMatch = phim.theLoai?.some(tl => tl.toLowerCase().includes(keyword));
      const dienVienMatch = phim.dienVien?.some(dv => dv.toLowerCase().includes(keyword));
      return titleMatch || theLoaiMatch || dienVienMatch;
    })
    .sort((a, b) => b.id - a.id);

  if (phimDangXem) {
    return <PhongChieu phim={phimDangXem} onClose={() => setPhimDangXem(null)} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4 pb-20">
      <header className="sticky top-0 z-40 bg-[#0b0f19] pt-4 pb-4 px-4 border-b border-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-wide">
            Sạp nhà Zhaodi
          </h1>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-full text-sm transition-all shadow-[0_0_10px_rgba(234,179,8,0.3)] flex items-center gap-2">
            <span className="text-lg">👤</span> 
            <span className="hidden md:inline">Đăng nhập</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto flex gap-3 relative z-50">
          <div ref={menuRef} className="relative flex-none">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-500 px-3 py-2 rounded-lg border border-gray-700 flex items-center gap-2 transition-all whitespace-nowrap h-full"
            >
              <span className="text-xl leading-none">☰</span>
              <span className="hidden sm:inline text-sm font-bold text-white">Danh mục</span>
            </button>

            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-800/80 sticky top-0">🎬 Thể Loại</div>
                {danhMuc.map((item, idx) => (
                  <button key={`cat-${idx}`} onClick={() => { setTuKhoa(item === "Tất cả" ? "" : item); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-yellow-500 hover:text-black transition-colors">{item}</button>
                ))}
                <div className="border-t border-gray-700 my-1"></div>
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-800/80 sticky top-0">🎭 Diễn Viên</div>
                {dienVien.map((actor, idx) => (
                  <button key={`actor-${idx}`} onClick={() => { setTuKhoa(actor); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-yellow-500 hover:text-black transition-colors">{actor}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Tìm kiếm phim..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full h-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded-lg py-2.5 px-4 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm shadow-inner" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-6">
        <h2 className="text-lg font-bold mb-4 border-l-4 border-yellow-500 pl-2">Phim Mới Cập Nhật</h2>
        {phimHienThi.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Không tìm thấy phim nào!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {phimHienThi.map((phim) => (
              <div key={phim.id} onClick={() => setPhimDangXem(phim)} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all shadow-lg">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img src={phim.thumb} alt={phim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">FULL</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors">{phim.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}