"use client"; // Bắt buộc vì cần dùng logic nhận diện trình duyệt

import { useState, useEffect } from "react";

export default function InstallGuide() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra xem có phải iOS không
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    // 2. Kiểm tra xem fan đã cài app chưa (để không hiện làm phiền nữa)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
    }
  }, []);

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[9999] bg-[#1a1f2e] border border-yellow-500/50 p-4 rounded-2xl shadow-2xl animate-bounce-in">
      <div className="flex items-start gap-3">
        <div className="bg-yellow-500 p-2 rounded-lg text-black font-bold">Z</div>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">Cài đặt Sạp Zhaodi cho iPhone</p>
          <p className="text-gray-400 text-xs mt-1">
            Nhấn nút <span className="inline-block px-1 bg-gray-700 rounded">⎋</span> (Chia sẻ) rồi chọn <span className="text-yellow-500">"Thêm vào MH chính"</span> để xem phim mượt hơn nhé!
          </p>
        </div>
        <button onClick={() => setShowIOSPrompt(false)} className="text-gray-500">✕</button>
      </div>
    </div>
  );
}