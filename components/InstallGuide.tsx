"use client"; // Bắt buộc vì cần dùng logic nhận diện trình duyệt

import { useState, useEffect } from "react";

export default function InstallGuide() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // 🎯 CHỐT 1: Kiểm tra xem khách đã từng bấm "Tắt" chưa để không làm phiền nữa
    const isDismissed = localStorage.getItem("dismissedInstallPrompt");
    if (isDismissed === "true") return;

    // 1. Kiểm tra xem có phải iOS không (Bao gồm cả iPad đời mới)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // 2. Kiểm tra xem fan đã cài app chưa (Hỗ trợ chuẩn cũ và mới của Safari)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    // 3. Nếu là trình duyệt Safari trên iOS và chưa cài -> Hiện!
    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
    }
  }, []);

  // 🎯 HÀM TẮT & LƯU VÀO TRÍ NHỚ TRÌNH DUYỆT
  const handleDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem("dismissedInstallPrompt", "true"); // Nhớ mặt khách, lần sau không hiện nữa
  };

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-8 left-4 right-4 z-[9999] bg-[#1a1f2e]/95 backdrop-blur-xl border border-yellow-500/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="flex items-start gap-3">
        <div className="bg-yellow-500 p-2 rounded-xl shadow-lg border-2 border-yellow-400">
          <img src="/logo.jpg" alt="Zhaodi Logo" className="w-8 h-8 rounded-md object-cover" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-white text-[15px] font-bold leading-tight">Cài đặt App Sạp Zhaodi</p>
          <p className="text-gray-300 text-xs mt-1.5 leading-relaxed">
            Nhấn nút{" "}
            {/* 🎯 BIỂU TƯỢNG SHARE CHUẨN CỦA APPLE */}
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-800 rounded mx-1 align-middle border border-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </span>{" "}
            ở dưới cùng, rồi chọn <strong className="text-yellow-500 font-bold">Thêm vào MH chính</strong> để xem phim Full HD không quảng cáo nhé!
          </p>
        </div>
        {/* Nút X gọi hàm handleDismiss để lưu vào LocalStorage */}
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
          ✕
        </button>
      </div>
      
      {/* Mũi tên chỉ xuống dưới cho nó trực quan (chỉ hiện trên iPhone) */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1f2e]/95 border-b border-r border-yellow-500/30 rotate-45"></div>
    </div>
  );
}