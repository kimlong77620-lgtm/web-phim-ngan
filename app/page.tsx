"use client";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import { supabase } from "./supabase";

// ==========================================
// 1. KHO DỮ LIỆU & KIỂU DỮ LIỆU (TYPESCRIPT)
// ==========================================
interface Phim {
  id: number;
  title: string;
  thumb: string;
  videoSrc: string;
  theLoai: string[];
  dienVien: string[];
}

const danhSachPhim: Phim[] = [
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
  },
  {
    id: 6,
    title: "Mẹ Chồng Thôn Bá Xông Vào Kinh Thành, Được Con Dâu Công Chúa Sủng Tận Trời - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/fbb5847d-4c3a-4fa4-8d22-2e7dfc6aee04/thumbnail_f10c4c25.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/fbb5847d-4c3a-4fa4-8d22-2e7dfc6aee04/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 7,
    title: "Biện Từ Và Nhịp Đập - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/f975d824-60db-4e1c-be9a-a8dbb36fd2ed/thumbnail_a9971f3c.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/f975d824-60db-4e1c-be9a-a8dbb36fd2ed/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 8,
    title: "Đích Trưởng Nữ Địa Phủ Chớ Dại Trêu Chọc, Nàng Tróc Quỷ Vô Cùng Hung Hãn - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/105a17c8-f152-447a-bef8-dff3717bd720/thumbnail_a4711077.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/105a17c8-f152-447a-bef8-dff3717bd720/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 9,
    title: "Đông Cung tiêu điểm: Hoàn khố hoàng tử quỳ gối bái phục - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/05a621f9-f1db-4244-840a-2aa55d7fa0ae/thumbnail_caa1d9d6.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/05a621f9-f1db-4244-840a-2aa55d7fa0ae/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 10,
    title: "Hành Trình Thăng Tiến Của Quý Nữ Giả - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/a46b8a9d-2489-4190-a171-1c4c8a44705a/thumbnail_60fedd10.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/a46b8a9d-2489-4190-a171-1c4c8a44705a/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 11,
    title: "Tỷ Tỷ Là Nữ Tử Xuyên Không Rời Kinh Phản Đạo, Ta Cũng Vậy - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/feb14b24-1139-4c42-9aae-d62f8f4101f5/thumbnail_32b7d177.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/feb14b24-1139-4c42-9aae-d62f8f4101f5/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 12,
    title: "Gàooo! Mami Người Sói Tới Rồi Đây - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/a1e93e68-7b31-4780-a00b-e4721bceedaf/thumbnail_7fb68a1c.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/a1e93e68-7b31-4780-a00b-e4721bceedaf/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 13,
    title: "Thí Vân Đài - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/4b37ea00-d448-4eaa-8618-5b3feba737b6/thumbnail_d5620600.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/4b37ea00-d448-4eaa-8618-5b3feba737b6/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
  {
    id: 14,
    title: "Bệ Hạ Hôm Nay Đã Lộ Diện Chưa? - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/9e5ae526-de4b-4e35-8aa6-e1fc2039ee6a/thumbnail_6f28a840.jpg",
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/9e5ae526-de4b-4e35-8aa6-e1fc2039ee6a/playlist.m3u8",
    theLoai: ["Xuyên Sách", "Hệ Thống"],
    dienVien: ["Vương Hạc Đệ"]
  },
];

// ==========================================
// 2. GIAO DIỆN PHÒNG CHIẾU (TỐI ƯU HIỆU NĂNG)
// ==========================================

function TrinhPhatVideo({ phim, isActive, onClose }: { phim: Phim; isActive: boolean; onClose: () => void }) {
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

  // 🔥 ĐÃ FIX LỖI RÒ RỈ RAM BẰNG CÁCH HỦY HLS KHI !isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
      return; 
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = data.levels.map((level: any, index: number) => ({
          height: level.height,
          index: index
        })).sort((a, b) => b.height - a.height);
        setQualities(availableQualities);
      });

      // Bắt lỗi HLS tự động phục hồi
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(phim.videoSrc);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = phim.videoSrc;
    }

    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [isActive, phim.videoSrc]);

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
function PhongChieu({ phim: initialPhim, onClose }: { phim: Phim; onClose: () => void }) {
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
  const [phimDangXem, setPhimDangXem] = useState<Phim | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const { user, isLoaded } = useUser();
  const [isVip, setIsVip] = useState(false);
  const [isExperienceMode, setIsExperienceMode] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [fanId, setFanId] = useState("");
  const [copiedField, setCopiedField] = useState(""); 

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text); 
    setCopiedField(field); 
    setTimeout(() => setCopiedField(""), 2000); 
  };

  const handleWatchPhim = (phim: Phim) => {
    if (isExperienceMode || isVip) {
      setPhimDangXem(phim);
    } else {
      setShowVipModal(true);
    }
  };

  // 🔥 ĐÃ FIX LỖI DUPLICATE & RACE CONDITION (Gộp 2 useEffect thành 1)
  useEffect(() => {
    async function syncUserProfile() {
      if (!user) return; 

      // 1. Tìm trong Supabase xem khách này đã có mã 6 số chưa
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('fan_id')
        .eq('id', user.id)
        .single();

      // 2. Nếu chưa có, tạo mã 6 số ngẫu nhiên
      let currentFanId = existingProfile?.fan_id;
      if (!currentFanId) {
        currentFanId = Math.floor(100000 + Math.random() * 900000).toString();
      }
      
      setFanId(currentFanId); // Nạp ra giao diện

      // 3. Lưu toàn bộ thông tin vào sổ cái 1 lần duy nhất
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        full_name: user.fullName,
        avatar_url: user.imageUrl,
        fan_id: currentFanId,
        updated_at: new Date(),
      }, { onConflict: 'id' });
    }

    syncUserProfile();
  }, [user]); 

  const danhMuc = ["Tất cả", "Hệ Thống", "Trọng Sinh", "Xuyên Sách", "Cổ Trang", "Ngôn Tình"];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: settings } = await supabase.from('settings').select('is_experience_mode').single();
      if (settings) setIsExperienceMode(settings.is_experience_mode);

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
        if (profile) setIsVip(profile.is_vip);
      }
    };
    checkStatus();
  }, [user]);

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
    
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-4 border-yellow-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-4 border-yellow-600 animate-spin-reverse opacity-50"></div>
          <img src="/logo.jpg" className="absolute inset-4 w-16 h-16 rounded-full object-cover" alt="Loading" />
        </div>
        <div className="text-xl text-yellow-500 font-black tracking-widest animate-pulse" style={{ fontFamily: "'Lexend', sans-serif" }}>
          ĐANG TẢI SẠP PHIM...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@900&display=swap');
          @keyframes glow-subtle {
            0%, 100% { filter: drop-shadow(0 0 15px rgba(234,179,8,0.3)); }
            50% { filter: drop-shadow(0 0 35px rgba(234,179,8,0.6)); }
          }
        `}</style>

        <div className="relative mb-12 z-10" style={{ animation: 'glow-subtle 3s infinite' }}>
          <div className="w-40 h-40 mx-auto rounded-full border-4 border-yellow-500 overflow-hidden shadow-2xl">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 
          className="text-5xl md:text-7xl leading-[1.1] mb-8 font-[900] text-yellow-500 uppercase italic"
          style={{ fontFamily: "'Lexend', sans-serif", textShadow: "0 0 10px rgba(234,179,8,0.5)" }}
        >
          Xem Phim<br />Không Cần Não
        </h1>

        <div className="w-full max-w-sm space-y-6 z-10">
          <SignInButton mode="modal">
            <button 
              className="w-full rounded-2xl bg-yellow-500 py-5 hover:bg-yellow-400 active:scale-95 transition-all shadow-lg"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              <span className="text-2xl font-[900] text-black uppercase tracking-tight">
                🚀 Đăng nhập ngay
              </span>
            </button>
          </SignInButton>

          <div className="flex items-center justify-center gap-3 text-gray-400 select-none">
            <input 
              type="checkbox" 
              id="remember" 
              defaultChecked 
              className="w-5 h-5 accent-yellow-500 bg-gray-800 border-gray-700 rounded cursor-pointer" 
            />
            <label 
              htmlFor="remember" 
              className="text-sm font-bold cursor-pointer hover:text-yellow-500 transition-colors"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
        </div>

        <p className="mt-20 text-gray-600 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
          — Độc quyền tại xiaopan0396 —
        </p>
      </div>
    );
  }

  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@900&display=swap');`}</style>
        <div className="relative mb-6">
          <img src="/logo.jpg" alt="Logo" className="w-40 h-40 rounded-full border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] object-cover" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-yellow-500 mb-4 uppercase italic tracking-tighter leading-tight" 
            style={{ fontFamily: "'Lexend', sans-serif" }}>
          Xem Phim <br/> Không Cần Não
        </h1>
        <p className="text-gray-400 max-w-sm leading-relaxed italic" style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 400 }}>
          Lão bản đang "đại tu" lại sạp phim để phục vụ cả nhà tốt hơn. <br/> 
          Hẹn gặp lại quý khách với diện mạo mới cùng <b>xiaopan0396</b> nhé!
        </p>
        <div className="mt-10 flex items-center gap-2 text-yellow-600 font-bold animate-pulse">
          <span>⚙️ Hệ thống đang được nâng cấp...</span>
        </div>
      </div>
    );
  }

  if (phimDangXem) {
    return <PhongChieu phim={phimDangXem} onClose={() => setPhimDangXem(null)} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-4 pb-20 relative">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@900&display=swap');`}</style>
      
      <header className="sticky top-0 z-40 bg-[#0b0f19] pt-4 pb-4 px-4 border-b border-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-yellow-500 object-cover shadow-lg"
            />
            <h1 className="text-xl md:text-2xl font-black text-yellow-500 uppercase tracking-tighter leading-tight" 
                style={{ fontFamily: "'Lexend', sans-serif" }}>
              Xem Phim <br/> Không Cần Não
            </h1>
          </div>

       <div className="flex items-center gap-4">
            {!user ? (
              <SignInButton mode="modal">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-all">
                  <span>👤</span> <span className="hidden md:inline">Đăng nhập</span>
                </button>
              </SignInButton>
            ) : (
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-yellow-500" } }} />
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex gap-3 relative z-50">
          <div ref={menuRef} className="relative flex-none">
            <button onClick={() => setShowMenu(!showMenu)} className="bg-gray-800 text-yellow-500 px-3 py-2 rounded-lg border border-gray-700 flex items-center gap-2 h-full">
              <span>☰</span> <span className="hidden sm:inline text-sm font-bold text-white">Danh mục</span>
            </button>
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-800/80">🎬 Thể Loại</div>
                {danhMuc.map((item, idx) => (
                  <button key={`cat-${idx}`} onClick={() => { setTuKhoa(item === "Tất cả" ? "" : item); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-yellow-500 hover:text-black">{item}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Tìm kiếm phim..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full h-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 outline-none focus:border-yellow-500 text-sm" />
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
              <div key={phim.id} onClick={() => handleWatchPhim(phim)} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img src={phim.thumb} alt={phim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">FULL</div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400">{phim.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVipModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className="bg-[#1a1f2e] p-8 rounded-3xl max-w-sm w-full text-center border-2 border-yellow-500 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowVipModal(false)} className="absolute top-4 right-5 text-gray-500 hover:text-white text-xl z-10">✕</button>
            <h2 className="text-3xl font-bold text-yellow-500 mb-2 uppercase italic shadow-[0_0_10px_rgba(234,179,8,0.5)] relative z-10">Xem Phim <br/> Không Cần Não</h2>
            
            {paymentStep === 1 ? (
              <div className="text-left space-y-4 animate-in slide-in-from-right-4 duration-300 relative z-10">
                <p className="text-gray-200 text-xs leading-relaxed italic">Cả nhà thân mến, để duy trì nền tảng mượt mà ad xin gửi cả nhà gói xem phim không giới hạn ạ.</p>
                <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center">
                  <p className="text-yellow-500 font-bold text-xl uppercase">45.000đ / NĂM</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl text-[12px] text-gray-300">
                  <p>• <b>Chủ TK:</b> <span className="text-white uppercase">PHAN THI THU THAO</span></p>
                  <p>• <b>Nội dung:</b> <span className="text-yellow-400 font-mono font-bold text-base uppercase">DONATE_{fanId}</span></p>
                </div>
                
                <button onClick={() => setPaymentStep(2)} className="w-full py-4 bg-yellow-600 text-black font-bold rounded-2xl hover:bg-yellow-500 uppercase shadow-lg shadow-yellow-500/20 transition-transform active:scale-95" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  Tiếp tục thanh toán
                </button>
                
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-gray-400 text-[10px] text-center mb-3 uppercase tracking-widest font-bold">Cần lão bản hỗ trợ?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="https://m.me/61585837924317" target="_blank" className="py-3 bg-[#0084FF] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-[11px] hover:bg-[#0073e6] transition-all shadow-md">
                      <svg viewBox="0 0 36 36" fill="currentColor" height="18" width="18"><path d="M18 2C9.163 2 2 8.791 2 17.168c0 4.757 2.41 8.995 6.136 11.838V34l5.6-3.083c1.373.385 2.833.593 4.356.593 8.837 0 16-6.791 16-15.168C34 8.791 26.837 2 18 2zm1.096 20.32-3.411-3.64-6.641 3.64 7.288-7.75 3.504 3.64 6.55-3.64-7.29 7.75z"></path></svg>
                      Messenger
                    </a>
                    <a href="https://zalo.me/0386027105" target="_blank" className="py-3 bg-[#0068ff] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-[11px] hover:bg-[#0058d9] transition-all shadow-md border border-white/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21.037 8.049c-1.433-3.95-5.917-6.07-10.086-4.717-3.606 1.173-6.19 4.604-6.035 8.361.066 1.956.88 3.75 2.26 5.1L5.7 21.011l4.41-1.574c1.138.356 2.348.536 3.565.536 5.378 0 9.736-4.357 9.736-9.735 0-1.638-.568-2.983-1.41-4.348h-1.065h.09v1.175zm-8.875 5.253H9.422v-3.784c1.71 0 2.225-.047 2.225-1.04v-.09h-3.385v-.873h3.495c.86 0 1.31.396 1.31 1.127v.18c0 .888-.64 1.164-1.503 1.164H9.99v1.92h2.172v1.464zm3.805-1.465h-1.947V9.524h1.947v2.313zm-1.947 1.464V12.01h1.947v1.306h-1.947zm4.05-3.784h-1.413V8.212h1.413v1.306zm.395 2.54c0 .676-.462 1.244-1.09 1.244h-1.302v-3.468h1.302c.628 0 1.09.568 1.09 1.244v.98z" fill="#fff"/></svg>
                      Zalo Admin
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-left-4 duration-300 text-center relative z-10">
                <div className="bg-white p-2 rounded-2xl inline-block mb-3 shadow-xl">
                  <img src={`https://img.vietqr.io/image/VCB-1042526602-compact2.jpg?amount=45000&addInfo=DONATE%5F${fanId}`} className="w-40 h-40" alt="QR" />
                </div>
                <div className="bg-black/30 p-4 rounded-xl text-left text-xs text-gray-300 mb-5 border border-yellow-500/20 space-y-3">
                  
                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                    <span>Ngân hàng:</span>
                    <span className="text-white font-bold text-sm uppercase">Vietcombank</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                    <span>Chủ tài khoản:</span>
                    <span className="text-white font-bold text-sm uppercase">PHAN THI THU THAO</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                    <span>Số tài khoản:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-mono font-bold text-sm">1042526602</span>
                      <button 
                        onClick={() => handleCopy("1042526602", "stk")} 
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-md ${copiedField === "stk" ? "bg-green-500 text-white" : "bg-gray-700 text-white hover:bg-yellow-500 hover:text-black"}`}
                      >
                        {copiedField === "stk" ? "✓ Đã Chép" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Nội dung:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-mono font-bold text-sm">DONATE_{fanId}</span>
                      <button 
                        onClick={() => handleCopy(`DONATE_${fanId}`, "noidung")} 
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-md ${copiedField === "noidung" ? "bg-green-500 text-white" : "bg-gray-700 text-white hover:bg-yellow-500 hover:text-black"}`}
                      >
                        {copiedField === "noidung" ? "✓ Đã Chép" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => setPaymentStep(1)} className="flex-1 py-3 border border-gray-700 text-gray-400 font-bold rounded-xl text-[11px] uppercase hover:bg-gray-800 transition-colors">Quay lại</button>
                  <button onClick={() => window.location.reload()} className="flex-[2] py-3 bg-yellow-600 text-black font-black rounded-xl uppercase text-xs hover:bg-yellow-500 shadow-lg transition-transform active:scale-95">Tôi đã chuyển khoản</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-4 z-[90] flex flex-col gap-3">
        <a 
          href="https://zalo.me/09xxxxxxxx" 
          target="_blank" 
          className="w-12 h-12 bg-[#0068ff] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,104,255,0.4)] border-2 border-white hover:scale-110 transition-transform text-white"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21.037 8.049c-1.433-3.95-5.917-6.07-10.086-4.717-3.606 1.173-6.19 4.604-6.035 8.361.066 1.956.88 3.75 2.26 5.1L5.7 21.011l4.41-1.574c1.138.356 2.348.536 3.565.536 5.378 0 9.736-4.357 9.736-9.735 0-1.638-.568-2.983-1.41-4.348h-1.065h.09v1.175zm-8.875 5.253H9.422v-3.784c1.71 0 2.225-.047 2.225-1.04v-.09h-3.385v-.873h3.495c.86 0 1.31.396 1.31 1.127v.18c0 .888-.64 1.164-1.503 1.164H9.99v1.92h2.172v1.464zm3.805-1.465h-1.947V9.524h1.947v2.313zm-1.947 1.464V12.01h1.947v1.306h-1.947zm4.05-3.784h-1.413V8.212h1.413v1.306zm.395 2.54c0 .676-.462 1.244-1.09 1.244h-1.302v-3.468h1.302c.628 0 1.09.568 1.09 1.244v.98z" fill="#fff"/></svg>
        </a>
        <a 
          href="https://m.me/61585837924317" 
          target="_blank" 
          className="w-12 h-12 bg-[#0084FF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,132,255,0.4)] border-2 border-white hover:scale-110 transition-transform text-white"
        >
          <svg viewBox="0 0 36 36" fill="currentColor" height="26" width="26"><path d="M18 2C9.163 2 2 8.791 2 17.168c0 4.757 2.41 8.995 6.136 11.838V34l5.6-3.083c1.373.385 2.833.593 4.356.593 8.837 0 16-6.791 16-15.168C34 8.791 26.837 2 18 2zm1.096 20.32-3.411-3.64-6.641 3.64 7.288-7.75 3.504 3.64 6.55-3.64-7.29 7.75z"></path></svg>
        </a>
      </div>

    </main>
  );
}