"use client";

import { useState, useRef, useEffect } from "react";

// ==========================================
// 1. KHO DỮ LIỆU CỦA TIÊN SINH
// ==========================================
const danhSachPhim = [
  {
    id: 1,
    title: "Sau Khi Ẩn Hôn Với Thương Tổng, Hình Tượng Lạnh Lùng Của Anh Ấy Sụp Đổ - Bản Full",
    thumb: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/thumbnail_dad53ad2.jpg", // Link ảnh Poster phim
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/f3a3fd9d-b2bd-4399-a361-6f62ae8ae470/play_720p.mp4",
    audioSrc: "https://iframe.mediadelivery.net/play/610790/95270cae-75f8-4f2a-91bf-96ad5cf8fb96/play.mp3",
  },
  {
    id: 2,
    title: "Trọng Sinh Vả Mặt Tổng Tài - Bản Full",
    thumb: "https://via.placeholder.com/300x450/1f2937/fbbf24?text=Poster+Phim+2", // Link ảnh Poster phim
    videoSrc: "https://vz-f76c4946-df1.b-cdn.net/62e93e0d-1095-4b83-b7a7-5dfa0edcbb7b/play_720p.mp4",
    audioSrc: "LINK_MP3_THUYET_MINH_2",
  },
  // Thêm phim mới thì copy khối ở trên dán xuống đây
];

// ==========================================
// 2. GIAO DIỆN PHÒNG CHIẾU (Khi ấn vào xem phim)
// ==========================================
function PhongChieu({ phim, onClose }: { phim: any; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isThuyetMinh, setIsThuyetMinh] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn click nhầm vào video
    // Copy link trang web hiện tại kèm theo lời mời
    const noiDungCopy = `Đang xem ${phim.title} cực cuốn tại Sạp nhà Zhaodi! Vào xem ngay: ${window.location.href}`;
    navigator.clipboard.writeText(noiDungCopy);
    
    // Hiện chữ "Đã chép" trong 2 giây rồi tắt
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  // ===================================

  const syncAudioWithVideo = () => {
    if (isThuyetMinh && videoRef.current && audioRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      if (!videoRef.current.paused) audioRef.current.play();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isThuyetMinh ? 0.2 : 1.0;
    }
  }, [isThuyetMinh]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Nút Quay Lại Trang Chủ */}
      <button 
        onClick={onClose}
        className="absolute top-6 left-4 z-50 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm border border-gray-600 flex items-center gap-2 pr-4"
      >
        <span className="text-xl leading-none">🔙</span> Quay lại
      </button>

      <video
        ref={videoRef}
        src={phim.videoSrc}
        className="h-full w-full max-w-md object-cover" // max-w-md giúp video không bị bè ngang trên màn hình máy tính
        controls={true}
        autoPlay={true}
        onPlay={() => isThuyetMinh && audioRef.current?.play()}
        onPause={() => audioRef.current?.pause()}
        onWaiting={() => audioRef.current?.pause()}
        onSeeked={syncAudioWithVideo}
      />
      <audio ref={audioRef} src={phim.audioSrc} className="hidden" />

{/* Cột Action Bar (Nút Tim, Share, Công tắc TM/SUB) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-10">
        
        {/* NÚT 1: THẢ TIM */}
        <button className="flex flex-col items-center group">
          <div className="p-3 bg-gray-800/60 rounded-full text-white text-2xl group-hover:scale-110 transition-transform">❤️</div>
          <span className="text-white text-xs mt-1 font-bold drop-shadow">67k</span>
        </button>

        {/* NÚT 2: CHIA SẺ */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center group relative"
        >
          <div className="p-3 bg-gray-800/60 rounded-full text-white text-xl group-hover:bg-blue-600 transition-colors shadow-lg">
            🔗
          </div>
          <span className="text-white text-[11px] mt-1 font-bold drop-shadow">Chia sẻ</span>
          
          {/* Thông báo pop-up "Đã chép!" */}
          {isCopied && (
            <span className="absolute -left-20 top-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg animate-bounce">
              Đã chép!
            </span>
          )}
        </button>

        {/* NÚT 3: CÔNG TẮC TM/SUB */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const status = !isThuyetMinh;
            setIsThuyetMinh(status);
            if (status) syncAudioWithVideo();
            else audioRef.current?.pause();
          }}
          className="flex flex-col items-center group"
        >
          <div className={`p-3 rounded-full border-2 transition-all duration-300 ${isThuyetMinh ? "border-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.6)]" : "border-white bg-gray-800/60"}`}>
            <span className="text-[13px] font-bold text-white uppercase leading-none">
              {isThuyetMinh ? "TM" : "SUB"}
            </span>
          </div>
          <span className="text-white text-xs mt-1 font-bold drop-shadow">Chế độ</span>
        </button>

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