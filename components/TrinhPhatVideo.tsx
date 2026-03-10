"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import { supabase } from "@/lib/supabase"; 
import { useUser } from "@clerk/nextjs";

export interface Phim {
  id: number;
  title: string;
  thumb: string;
  videoSrc?: string;
  video_src?: string;
  views_count?: number;
  likes_count?: number;
}

export default function TrinhPhatVideo({ phim, isActive, onClose }: { 
  phim: Phim; 
  isActive: boolean; 
  onClose: () => void 
}) {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); 
  const [progress, setProgress] = useState(0); 
  const [isThuyetMinh, setIsThuyetMinh] = useState(false); // Trạng thái TM/SUB vẫn còn đây!
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const [qualities, setQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalVideoLink = phim?.video_src || phim?.videoSrc || "";

  useEffect(() => {
    if (phim?.likes_count !== undefined) setLocalLikes(phim.likes_count);
  }, [phim?.likes_count]);

  useEffect(() => {
    if (user && phim?.id) {
      const checkLike = async () => {
        const { data } = await supabase.from('movie_likes').select('*').match({ user_id: user.id, movie_id: phim.id }).single();
        if (data) setIsLiked(true);
      };
      checkLike();
    }
  }, [user, phim?.id]);

  useEffect(() => {
    if (isActive && phim?.id) {
      if (user) supabase.from('watch_history').upsert({ user_id: user.id, movie_id: phim.id, watched_at: new Date() });
      watchTimerRef.current = setTimeout(async () => {
        await supabase.rpc('increment_movie_views', { m_id: phim.id });
      }, 10 * 60 * 1000); 
    } else {
      if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    }
    return () => { if (watchTimerRef.current) clearTimeout(watchTimerRef.current); };
  }, [isActive, phim?.id, user]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(p) ? 0 : p);
  }, []);

  const resetTimer = useCallback(() => {
    setShowUI(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isPlaying) { 
        setShowUI(false);
        setShowVolumeSlider(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [resetTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !finalVideoLink) return;

    if (!isActive) {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      video.pause();
      video.removeAttribute('src'); 
      video.load(); 
      setIsPlaying(false);
      return; 
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 }); 
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const raw = data.levels.map((level: any, index: number) => {
          let label = "SD";
          if (level.height >= 1080) label = "Full HD";
          else if (level.height >= 720) label = "HD";
          return { height: level.height, index: index, label: label };
        }).sort((a, b) => b.height - a.height);
        
        const filtered: any[] = []; const seen = new Set();
        for (const q of raw) { if (!seen.has(q.label)) { filtered.push(q); seen.add(q.label); } }
        setQualities(filtered);
      });
      hls.loadSource(finalVideoLink); 
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = finalVideoLink;
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [isActive, finalVideoLink]);

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
    if (videoRef.current?.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current?.pause(); setIsPlaying(false); }
  };

  const handleDoubleTap = (e: React.MouseEvent, direction: 'forward' | 'backward') => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime += direction === 'forward' ? 10 : -10;
    resetTimer();
    const el = e.currentTarget as HTMLElement;
    el.style.backgroundColor = "rgba(255,255,255,0.2)";
    setTimeout(() => el.style.backgroundColor = "transparent", 200);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); resetTimer();
    if (!user || !phim?.id) return alert("Lão bản ơi, đăng nhập để thả tim nhé!");
    
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLocalLikes(prev => Math.max(0, newStatus ? prev + 1 : prev - 1));

    if (newStatus) {
      await supabase.from('movie_likes').insert({ user_id: user.id, movie_id: phim.id });
      await supabase.rpc('increment_movie_likes', { m_id: phim.id });
    } else {
      await supabase.from('movie_likes').delete().match({ user_id: user.id, movie_id: phim.id });
      await supabase.rpc('decrement_movie_likes', { m_id: phim.id });
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); resetTimer();
    const shareUrl = `${window.location.origin}/phim/${phim?.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  if (!phim) return <div className="w-full h-full bg-black"></div>;

  return (
    <div className="relative w-full h-[100dvh] bg-black flex justify-center items-center overflow-hidden" onMouseMove={resetTimer} onTouchStart={resetTimer}>
      
      <div className="absolute inset-0 z-20 flex">
        <div className="w-1/3 h-full transition-colors duration-200" onClick={togglePlay} onDoubleClick={(e) => handleDoubleTap(e, 'backward')} />
        <div className="w-1/3 h-full" onClick={togglePlay} />
        <div className="w-1/3 h-full transition-colors duration-200" onClick={togglePlay} onDoubleClick={(e) => handleDoubleTap(e, 'forward')} />
      </div>

      <video ref={videoRef} playsInline loop className="w-full max-h-[100dvh] object-contain z-10" onTimeUpdate={handleTimeUpdate} />
      
      <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="pointer-events-auto absolute top-6 left-4 p-2.5 bg-black/40 rounded-full text-white backdrop-blur-md shadow-lg hover:bg-yellow-500 hover:text-black transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="pointer-events-auto absolute right-4 bottom-32 z-[100] flex flex-col gap-5 items-center">
          
          <button onClick={(e) => { e.stopPropagation(); resetTimer(); const s = [1, 1.25, 1.5, 2, 0.5]; const n = s[(s.indexOf(playbackRate) + 1) % s.length]; setPlaybackRate(n); videoRef.current!.playbackRate = n; }} className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg font-bold text-xs">{playbackRate}x</button>

          {qualities.length > 0 && (
            <div className="relative flex items-center justify-center">
              {showQualityMenu && (
                <div className="absolute right-full mr-3 bg-black/80 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[80px]">
                  <button onClick={(e) => { e.stopPropagation(); hlsRef.current!.currentLevel = -1; setCurrentQuality(-1); setShowQualityMenu(false); }} className={`text-[11px] font-bold py-1.5 px-2 rounded transition-colors ${currentQuality === -1 ? 'bg-yellow-500 text-black' : 'text-white hover:bg-white/20'}`}>Auto</button>
                  {qualities.map((q) => (<button key={q.index} onClick={(e) => { e.stopPropagation(); hlsRef.current!.currentLevel = q.index; setCurrentQuality(q.index); setShowQualityMenu(false); }} className={`text-[11px] font-bold py-1.5 px-2 rounded transition-colors ${currentQuality === q.index ? 'bg-yellow-500 text-black' : 'text-white hover:bg-white/20'}`}>{q.label}</button>))}
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); setShowVolumeSlider(false); }} className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg font-bold text-[9px] uppercase">{currentQuality === -1 ? 'AUTO' : qualities.find(q => q.index === currentQuality)?.label}</button>
            </div>
          )}

          <button onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
            <div className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all ${isLiked ? "bg-red-500 text-white scale-110" : "bg-black/50 text-white hover:bg-red-500"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <span className="text-[11px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{localLikes}</span>
          </button>

          {/* 🎯 TRẢ LẠI NÚT TM/SUB CHO LÃO BẢN ĐÂY Ạ! */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              resetTimer(); 
              const s = !isThuyetMinh; 
              setIsThuyetMinh(s); 
              if (hlsRef.current) hlsRef.current.audioTrack = s ? 1 : 0; 
            }} 
            className={`p-2.5 rounded-full border transition-all backdrop-blur-md shadow-lg ${isThuyetMinh ? "border-yellow-500 bg-yellow-500/30 text-yellow-400" : "border-white/30 bg-black/50 text-white"}`}
          >
            <span className="text-[10px] font-extrabold uppercase leading-none block w-6 text-center">{isThuyetMinh ? "TM" : "SUB"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            {showVolumeSlider && (
              <div className="absolute right-full mr-3 w-32 bg-black/80 p-3.5 rounded-2xl flex items-center backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] z-50 origin-right animate-in zoom-in-95">
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onInput={(e) => { const v = parseFloat(e.currentTarget.value); setVolume(v); setIsMuted(v === 0); videoRef.current!.volume = v; }} className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowVolumeSlider(!showVolumeSlider); setShowQualityMenu(false); }} className="p-3 bg-black/50 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-colors backdrop-blur-md shadow-lg">
              {isMuted || volume === 0 ? (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>) : volume < 0.5 ? (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>) : (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>)}
            </button>
          </div>

          <button onClick={handleCopy} className={`relative p-3 rounded-full transition-colors backdrop-blur-md shadow-lg ${isCopied ? "bg-green-500 text-white" : "bg-black/50 text-white hover:bg-blue-600"}`}>
            {isCopied ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>}
          </button>
        </div>

        <div className="pointer-events-auto absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pb-8 px-6">
          <div className="flex justify-center items-center gap-14 mb-8">
             <button onClick={(e) => { e.stopPropagation(); resetTimer(); if(videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white/60 hover:text-white transition-transform active:scale-75">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
             </button>
             <button onClick={togglePlay} className="p-4 bg-white/10 rounded-full text-white hover:bg-yellow-500 hover:text-black transition-all active:scale-90 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
               {isPlaying ? (<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>) : (<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>)}
             </button>
             <button onClick={(e) => { e.stopPropagation(); resetTimer(); if(videoRef.current) videoRef.current.currentTime += 10; }} className="text-white/60 hover:text-white transition-transform active:scale-75">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
             </button>
          </div>
          <input 
            type="range" min="0" max="100" step="0.1" value={progress} 
            onChange={(e) => { 
              resetTimer();
              const v = videoRef.current; 
              if (v && v.duration) { 
                const t = (parseFloat(e.target.value) / 100) * v.duration; 
                v.currentTime = t; 
                setProgress(parseFloat(e.target.value)); 
              } 
            }} 
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:h-2 transition-all shadow-lg" 
          />
        </div>
      </div>
    </div>
  );
}