"use client";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; 
import TrinhPhatVideo from '@/components/TrinhPhatVideo';

// 1. KIỂU DỮ LIỆU
interface Phim {
  id: number;
  title: string;
  thumb: string;
  videoSrc?: string;
  video_src?: string;
  theLoai: string[];
  dienVien: string[];
  views_count?: number;
  likes_count?: number;
}

// 2. TRANG DANH SÁCH MỞ RỘNG (Trượt ngang & Vuốt để thoát)
function DanhSachDayDu({ title, danhSach, onClose, onWatch, type }: { title: string, danhSach: Phim[], onClose: () => void, onWatch: (p: Phim) => void, type: "doc" | "ngang" }) {
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    // 🎯 Vuốt từ trái sang phải để đóng (Giống hệt thao tác Back của iPhone)
    if (distanceX < -70) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0b0f19] z-[80] overflow-y-auto animate-in slide-in-from-right-full duration-300 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <div className="sticky top-0 bg-[#0b0f19]/90 backdrop-blur-xl p-4 flex items-center gap-4 border-b border-gray-800 z-10 shadow-lg">
        <button onClick={onClose} className="p-2.5 bg-gray-800 rounded-full hover:bg-yellow-500 hover:text-black transition-colors active:scale-90">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-black text-yellow-500 uppercase italic tracking-tighter">{title}</h2>
      </div>
      
      <div className={`p-4 grid ${type === 'ngang' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 pb-24`}>
        {danhSach.map((p) => (
          <div key={p.id} onClick={() => onWatch(p)} className={`group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all shadow-lg hover:-translate-y-1`}>
            <div className={`relative ${type === 'ngang' ? 'aspect-video border-b border-gray-800' : 'aspect-[2/3]'} overflow-hidden`}>
              <img src={p.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
              <div className={`absolute top-2 right-2 ${type === 'ngang' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'} text-[10px] font-bold px-2 py-1 rounded shadow-lg`}>
                {type === 'ngang' ? 'TẬP MỚI' : 'FULL'}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span className="text-[10px] font-bold uppercase">{(p.views_count || 0) >= 1000 ? ((p.views_count || 0) / 1000).toFixed(1).replace('.0', '') + 'k' : p.views_count || 0}</span>
              </div>
              {type === 'ngang' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-[0_0_15px_rgba(220,38,38,0.5)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className={`font-semibold line-clamp-2 transition-colors ${type === 'ngang' ? 'text-[15px] group-hover:text-red-400' : 'text-sm group-hover:text-yellow-400'}`}>{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. PHÒNG CHIẾU (ĐÃ TÍCH HỢP CẢM BIẾN LĂN CHUỘT PC)
function PhongChieu({ phim: initialPhim, onClose, danhSachToanBo }: { phim: Phim; onClose: () => void; danhSachToanBo: Phim[]; }) {
  const [activeId, setActiveId] = useState(initialPhim.id);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 70; 
  const isWheeling = useRef(false);

  const handleClose = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname);
    onClose();
  }, [onClose]);

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
    const timer = setTimeout(() => { document.querySelectorAll('.snap-video-item').forEach(el => observer.observe(el)); }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    if (distanceX < -minSwipeDistance || distanceY < -minSwipeDistance) handleClose();
  };

  const onWheel = (e: React.WheelEvent) => {
    if (isWheeling.current) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const currentIndex = danhSachToanBo.findIndex(p => p.id === activeId);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < danhSachToanBo.length) {
      isWheeling.current = true;
      const nextId = danhSachToanBo[nextIndex].id;
      const el = document.getElementById(`snap-video-${nextId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { isWheeling.current = false; }, 600); 
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-[100dvh] bg-black z-[100] overflow-y-scroll snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}>
      <button onClick={handleClose} className="fixed top-6 left-6 z-[9999] p-3 bg-black/40 hover:bg-yellow-500 text-white hover:text-black rounded-full backdrop-blur-md border border-white/20 transition-all shadow-2xl active:scale-90">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      {danhSachToanBo.map((phimItem) => (
        <div key={phimItem.id} id={`snap-video-${phimItem.id}`} data-id={phimItem.id} className="snap-video-item relative w-full h-[100dvh] snap-start snap-always shrink-0 bg-black">
          {phimItem && <TrinhPhatVideo phim={phimItem} isActive={activeId === phimItem.id} onClose={handleClose} />}
        </div>
      ))}
    </div>
  );
}

// 4. TRANG CHỦ (SẢNH CHÍNH)
export default function Home() {
  const [danhSachPhim, setDanhSachPhim] = useState<Phim[]>([]);
  const [lichSuXem, setLichSuXem] = useState<Phim[]>([]);
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
  const [loadingPhim, setLoadingPhim] = useState(true);

  // 🎯 Công tắc bật Trang Danh Sách trượt ngang
  const [viewingList, setViewingList] = useState<"doc" | "ngang" | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const xoaDau = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  
  const handleAutoPayment = async () => {
    try {
      setLoadingPhim(true);
      const res = await fetch("/api/create-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fanId: fanId, amount: 45000 }) });
      const data = await res.json();
      if (data.bin) window.location.href = data.bin;
      else alert("Lỗi: " + (data.error || "Không thể tạo link thanh toán"));
    } catch (err) { alert("Cổng thanh toán đang bận, thử lại sau!"); } 
    finally { setLoadingPhim(false); }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    async function fetchData() {
      const { data: movies } = await supabase.from('movies').select('*').order('id', { ascending: false });
      if (movies) setDanhSachPhim(movies);
      
      if (user) {
        const { data: historyData } = await supabase.from('watch_history').select('movies(*)').eq('user_id', user.id).order('watched_at', { ascending: false }).limit(4);
        if (historyData) {
          const validHistory = historyData.map((h: any) => h.movies).filter((m: any) => m !== null);
          setLichSuXem(validHistory);
        }
      }
      setLoadingPhim(false);
    }
    fetchData();
  }, [user, phimDangXem]);

  const handleCopy = (t: string, f: string) => { navigator.clipboard.writeText(t); setCopiedField(f); setTimeout(() => setCopiedField(""), 2000); };

  const handleWatchPhim = (phim: Phim) => {
    if (isExperienceMode || isVip) setPhimDangXem(phim);
    else setShowVipModal(true);
  };

  useEffect(() => {
    async function sync() {
      if (!user) return; 
      const { data } = await supabase.from('profiles').select('fan_id').eq('id', user.id).single();
      let fid = data?.fan_id || Math.floor(100000 + Math.random() * 900000).toString();
      setFanId(fid);
      await supabase.from('profiles').upsert({ id: user.id, email: user.primaryEmailAddress?.emailAddress, full_name: user.fullName, avatar_url: user.imageUrl, fan_id: fid, updated_at: new Date() });
    }
    sync();
  }, [user]); 

  useEffect(() => {
    const check = async () => {
      const { data: s } = await supabase.from('settings').select('is_experience_mode').limit(1).single();
      if (s) setIsExperienceMode(s.is_experience_mode);
      if (user) {
        const { data: p } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
        if (p) setIsVip(p.is_vip);
      }
    };
    check();
  }, [user]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('phimId');
    if (id && danhSachPhim.length > 0) {
      const found = danhSachPhim.find(p => p.id === Number(id));
      if (found) setPhimDangXem(found); 
    }
  }, [danhSachPhim]);

  const phimHienThi = danhSachPhim.filter((p) => {
    const key = xoaDau(tuKhoa.toLowerCase());
    return xoaDau(p.title.toLowerCase()).includes(key) || p.dienVien?.some(dv => xoaDau(dv.toLowerCase()).includes(key)) || p.theLoai?.some(tl => xoaDau(tl.toLowerCase()).includes(key));
  });

  const phimNgang = phimHienThi.filter(p => p.theLoai?.includes("Màn Ngang") || p.theLoai?.includes("màn ngang"));
  const phimDoc = phimHienThi.filter(p => !p.theLoai?.includes("Màn Ngang") && !p.theLoai?.includes("màn ngang"));

  if (!isLoaded || loadingPhim) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-yellow-500 font-black animate-pulse">ĐANG MỞ CỬA SẠP...</div>;

  if (!user) return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center">
      <img src="/logo.jpg" className="w-40 h-40 rounded-full border-4 border-yellow-500 mb-12 shadow-2xl" alt="Logo" />
      <h1 className="text-5xl md:text-7xl font-[900] text-yellow-500 uppercase italic mb-8 tracking-tighter">Xem Phim<br />Không Cần Não</h1>
      <SignInButton mode="redirect" forceRedirectUrl="/"><button className="w-full max-w-sm rounded-2xl bg-yellow-500 py-5 text-2xl font-black text-black uppercase shadow-lg hover:scale-105 transition-transform">🚀 Đăng nhập ngay</button></SignInButton>
    </div>
  );

  // 🎯 LUÔN ƯU TIÊN PHÒNG CHIẾU NỔI LÊN TRÊN CÙNG KHI CÓ PHIM ĐANG XEM
  if (phimDangXem) return <PhongChieu phim={phimDangXem} danhSachToanBo={phimHienThi} onClose={() => setPhimDangXem(null)} />;

  return (
    <main className="h-screen overflow-y-auto bg-[#0b0f19] text-white relative [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl pt-4 pb-4 px-4 border-b border-gray-800 shadow-xl mb-6 rounded-b-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" className="w-12 h-12 rounded-full border-2 border-yellow-500" alt="Logo Mini" />
            <h1 className="text-xl md:text-2xl font-black text-yellow-500 uppercase italic leading-tight tracking-tighter">Xem Phim <br/> Không Cần Não</h1>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-yellow-500" } }} />
        </div>

        <div className="max-w-4xl mx-auto flex gap-2 relative z-50">
          <div ref={menuRef} className="relative flex-none">
            <button onClick={() => setShowMenu(!showMenu)} className="bg-gray-800 text-yellow-500 px-4 rounded-2xl border border-gray-700 h-12 flex items-center gap-2 font-bold transition-all active:scale-95 hover:bg-gray-700"><span>☰</span> <span className="hidden sm:inline uppercase">Danh mục</span></button>
            {showMenu && (
              <div className="absolute top-full left-0 mt-3 w-60 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase bg-gray-800/50">🎬 Thể Loại</div>
                {["Tất cả", "Hệ Thống", "Trọng Sinh", "Xuyên Sách", "Cổ Trang", "Màn Ngang"].map((item, idx) => (
                  <button key={idx} onClick={() => { setTuKhoa(item === "Tất cả" ? "" : item); setShowMenu(false); }} className="w-full text-left px-5 py-3.5 text-sm hover:bg-yellow-500 hover:text-black font-bold border-b border-gray-800/50 transition-colors">{item}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors">🔍</span>
            <input type="text" placeholder="Tìm tên phim, diễn viên..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full h-12 bg-gray-900 border border-gray-700 rounded-2xl pl-11 pr-4 outline-none focus:border-yellow-500 text-sm font-medium transition-colors" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* 🕒 MỤC LỊCH SỬ XEM */}
        {lichSuXem.length > 0 && !tuKhoa && (
          <div className="mb-10 animate-in fade-in duration-700">
            <h2 className="text-lg font-bold mb-4 border-l-4 border-blue-500 pl-2 uppercase italic text-blue-400 tracking-tighter">Phim bạn đã xem</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lichSuXem.map((p) => (
                <div key={`hist-${p.id}`} onClick={() => handleWatchPhim(p)} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-blue-900/30 hover:border-blue-500 transition-all shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img src={p.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                    <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span className="text-[10px] font-bold uppercase">{(p.views_count || 0) >= 1000 ? ((p.views_count || 0) / 1000).toFixed(1).replace('.0', '') + 'k' : p.views_count || 0}</span>
                    </div>
                  </div>
                  <div className="p-3"><h3 className="text-xs font-semibold line-clamp-1 group-hover:text-blue-400">{p.title}</h3></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎬 TẦNG 1: KHO PHIM DỌC (Chỉ hiển thị 8 phim) */}
        {phimDoc.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold border-l-4 border-yellow-500 pl-2 uppercase italic tracking-tighter leading-none">Phim Ngắn Màn Dọc</h2>
              {/* Nút Xem thêm gọi Trang trượt ngang */}
              {phimDoc.length > 8 && (
                <button 
                  onClick={() => setViewingList("doc")} 
                  className="text-xs font-black uppercase text-yellow-500 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-yellow-500/30 flex items-center gap-1 active:scale-95"
                >
                  Xem thêm <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phimDoc.slice(0, 8).map((p) => (
                <div key={p.id} onClick={() => handleWatchPhim(p)} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img src={p.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">FULL</div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span className="text-[10px] font-bold uppercase">{(p.views_count || 0) >= 1000 ? ((p.views_count || 0) / 1000).toFixed(1).replace('.0', '') + 'k' : p.views_count || 0}</span>
                    </div>
                  </div>
                  <div className="p-3"><h3 className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors">{p.title}</h3></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎬 TẦNG 2: PHIM BỘ MÀN NGANG */}
        {phimNgang.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold border-l-4 border-red-500 pl-2 uppercase italic tracking-tighter text-red-400 leading-none">Phim Bộ Màn Ngang</h2>
              {phimNgang.length > 8 && (
                <button onClick={() => setViewingList("ngang")} className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-red-500/30 flex items-center gap-1 active:scale-95">
                  Xem thêm <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {phimNgang.slice(0, 8).map((p) => (
                <div key={p.id} onClick={() => handleWatchPhim(p)} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden border-b border-gray-800">
                    <img src={p.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">TẬP MỚI</div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span className="text-[10px] font-bold uppercase">{(p.views_count || 0) >= 1000 ? ((p.views_count || 0) / 1000).toFixed(1).replace('.0', '') + 'k' : p.views_count || 0}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-[0_0_15px_rgba(220,38,38,0.5)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
                    </div>
                  </div>
                  <div className="p-4"><h3 className="text-[15px] font-bold line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">{p.title}</h3></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🎯 HIỂN THỊ TRANG DANH SÁCH MỞ RỘNG NẾU KHÁCH BẤM "XEM THÊM" */}
      {viewingList && (
        <DanhSachDayDu 
          title={viewingList === 'doc' ? "Kho Phim Dọc" : "Phim Bộ Màn Ngang"} 
          danhSach={viewingList === 'doc' ? phimDoc : phimNgang} 
          type={viewingList}
          onClose={() => setViewingList(null)} 
          onWatch={handleWatchPhim} 
        />
      )}

      {/* VIP MODAL - GIỮ NGUYÊN */}
      {showVipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className="bg-[#1a1f2e] p-8 rounded-3xl max-w-sm w-full text-center border-2 border-yellow-500 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowVipModal(false)} className="absolute top-4 right-5 text-gray-500 hover:text-white text-xl">✕</button>
            <h2 className="text-3xl font-bold text-yellow-500 mb-6 uppercase italic tracking-tighter">Xem Phim <br/> Không Cần Não</h2>
            {paymentStep === 1 ? (
              <div className="text-left space-y-4">
                <p className="text-gray-300 text-xs italic">Cả nhà thân mến, để duy trì nền tảng ad xin gửi gói xem phim không giới hạn ạ.</p>
                <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center"><p className="text-yellow-500 font-bold text-xl uppercase">45.000đ / NĂM</p></div>
                <div className="bg-black/20 p-3 rounded-xl text-[12px] text-gray-300">
                  <p>• <b>Mã Fan:</b> <span className="text-yellow-400 font-bold">{fanId}</span></p>
                  <p className="text-[10px] mt-1 opacity-70">Hệ thống sẽ tự động kích VIP ngay sau khi thanh toán thành công.</p>
                </div>
                <button onClick={handleAutoPayment} className="w-full py-4 bg-yellow-600 text-black font-[900] rounded-2xl hover:bg-yellow-500 uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">🚀 Thanh toán tự động</button>
                <button onClick={() => setPaymentStep(2)} className="w-full py-2 text-gray-400 text-[11px] font-bold uppercase hover:text-white transition-colors border border-gray-700 rounded-xl">Hoặc chuyển khoản thủ công</button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-2 rounded-2xl inline-block shadow-xl"><img src={`https://img.vietqr.io/image/VCB-1042526602-compact2.jpg?amount=45000&addInfo=DONATE%5F${fanId}`} className="w-40 h-40" alt="QR Vietcombank" /></div>
                <div className="bg-black/30 p-4 rounded-xl text-left text-xs text-gray-300 space-y-3 border border-yellow-500/20">
                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2"><span>Ngân hàng:</span><span className="text-white font-bold text-sm uppercase">Vietcombank</span></div>
                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2"><span>Số tài khoản:</span><div className="flex items-center gap-3"><span className="text-yellow-400 font-mono font-bold text-sm">1042526602</span><button onClick={() => handleCopy("1042526602", "stk")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${copiedField === "stk" ? "bg-green-500" : "bg-gray-700 hover:bg-yellow-500 hover:text-black"}`}>{copiedField === "stk" ? "✓" : "Copy"}</button></div></div>
                  <div className="flex justify-between items-center"><span>Nội dung:</span><div className="flex items-center gap-3"><span className="text-yellow-400 font-mono font-bold text-sm">DONATE_{fanId}</span><button onClick={() => handleCopy(`DONATE_${fanId}`, "noidung")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${copiedField === "noidung" ? "bg-green-500" : "bg-gray-700 hover:bg-yellow-500 hover:text-black"}`}>{copiedField === "noidung" ? "✓" : "Copy"}</button></div></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPaymentStep(1)} className="flex-1 py-3 border border-gray-700 text-gray-400 font-bold rounded-xl text-[11px] uppercase hover:bg-gray-800">Quay lại</button>
                  <button onClick={() => window.location.reload()} className="flex-[2] py-3 bg-yellow-600 text-black font-black rounded-xl uppercase text-xs hover:bg-yellow-500 shadow-lg active:scale-95">Tôi đã chuyển khoản</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING BUTTONS */}
      <div className="fixed bottom-24 right-4 z-[90] flex flex-col gap-3">
        <a href="https://zalo.me/0386027105" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0068ff] rounded-full flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21.037 8.049c-1.433-3.95-5.917-6.07-10.086-4.717-3.606 1.173-6.19 4.604-6.035 8.361.066 1.956.88 3.75 2.26 5.1L5.7 21.011l4.41-1.574c1.138.356 2.348.536 3.565.536 5.378 0 9.736-4.357 9.736-9.735 0-1.638-.568-2.983-1.41-4.348h-1.065h.09v1.175zm-8.875 5.253H9.422v-3.784c1.71 0 2.225-.047 2.225-1.04v-.09h-3.385v-.873h3.495c.86 0 1.31.396 1.31 1.127v.18c0 .888-.64 1.164-1.503 1.164H9.99v1.92h2.172v1.464zm3.805-1.465h-1.947V9.524h1.947v2.313zm-1.947 1.464V12.01h1.947v1.306h-1.947zm4.05-3.784h-1.413V8.212h1.413v1.306zm.395 2.54c0 .676-.462 1.244-1.09 1.244h-1.302v-3.468h1.302c.628 0 1.09.568 1.09 1.244v.98z"/></svg></a>
        <a href="https://m.me/61585837924317" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0084FF] rounded-full flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform"><svg viewBox="0 0 36 36" fill="white" width="24" height="24"><path d="M18 2C9.163 2 2 8.791 2 17.168c0 4.757 2.41 8.995 6.136 11.838V34l5.6-3.083c1.373.385 2.833.593 4.356.593 8.837 0 16-6.791 16-15.168C34 8.791 26.837 2 18 2zm1.096 20.32-3.411-3.64-6.641 3.64 7.288-7.75 3.504 3.64 6.55-3.64-7.29 7.75z"/></svg></a>
      </div>
    </main>
  );
}