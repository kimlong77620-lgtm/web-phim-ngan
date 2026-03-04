"use client";

import { useEffect, useRef } from 'react';

const videosData = [
  { 
    id: 1, 
    // Dán link MP4 tiên sinh vừa copy từ Bunny vào đây
    src: "https://vz-f76c4946-df1.b-cdn.net/13462dc5-b2e0-4db6-91f4-0ab418abfe5e/play_720p.mp4", 
    title: "Phim Hệ Thống",
    sub: "/11.vtt" 
  },
  { 
    id: 2, 
    src: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/play_720p.mp4", 
    title: "Thương Tổng",
    sub: "/thuong-tong.vtt" 
  }
];

export default function Home() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
          v.currentTime = 0;
        }
      });
    }, { threshold: 0.6 });

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="h-[100dvh] w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide" style={{ touchAction: 'pan-y' }}>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        video::cue { background: rgba(0, 0, 0, 0.6); color: white; font-size: 1.2rem; font-weight: bold; }
      `}</style>

      {videosData.map((vid, index) => (
        <section key={vid.id} className="relative h-[100dvh] w-full snap-start flex justify-center items-center bg-black">
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            src={vid.src} // Dùng trực tiếp src MP4
            className="h-full w-full max-w-[500px] object-cover" 
            loop playsInline muted controls crossOrigin="anonymous"
          >
            <track label="Tiếng Việt" kind="subtitles" srcLang="vi" src={vid.sub} default />
          </video>
          
          <div className="absolute bottom-16 left-4 text-white z-10 pointer-events-none drop-shadow-lg">
            <h3 className="text-2xl font-bold">{vid.title}</h3>
            <p className="text-sm opacity-70">Xem phim không cần não</p>
          </div>
        </section>
      ))}
    </main>
  );
}