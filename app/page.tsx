"use client";

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const videosData = [
  { 
    id: 1, 
    src: "https://vz-f76c4946-df1.b-cdn.net/13462dc5-b2e0-4db6-91f4-0ab418abfe5e/playlist.m3u8", 
    title: "Tập 1 - Nữ chính xuyên không",
    sub: "/11.vtt" 
  }
];

export default function Home() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const hlsInstances: Hls[] = []; 

    videoRefs.current.forEach((video, index) => {
      if (video) {
        const source = videosData[index].src;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hlsInstances.push(hls);
          // Thêm lệnh này để ép video phải tải ngay
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("Đã nạp xong file m3u8!");
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        }
      }
    });

    // Tự động chạy khi thấy video (TikTok style)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          v.play().catch(() => console.log("Cần bấm vào màn hình để nghe tiếng"));
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.5 });

    videoRefs.current.forEach((v) => v && observer.observe(v));

    return () => {
      observer.disconnect();
      hlsInstances.forEach(hls => hls.destroy()); 
    };
  }, []);

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory relative">
      {videosData.map((vid, index) => (
        <div key={vid.id} className="relative h-screen w-full snap-start flex justify-center bg-black">
          
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            className="h-full max-w-[500px] w-full object-cover" 
            loop playsInline muted controls
            crossOrigin="anonymous"
          >
            {/* Tạm thời để file sub cục bộ, nếu không hiện cũng kệ nó, ưu tiên chạy video trước */}
            <track label="Tiếng Việt" kind="subtitles" srcLang="vi" src={vid.sub} default />
          </video>
          
          <div className="absolute bottom-10 left-4 text-white z-10 pointer-events-none drop-shadow-lg">
            <h3 className="text-xl font-bold">{vid.title}</h3>
            <p className="text-sm opacity-80">Xem phim không cần não</p>
          </div>

        </div>
      ))}
    </div>
  );
}