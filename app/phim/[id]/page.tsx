"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 
import TrinhPhatVideo from '@/components/TrinhPhatVideo'; 
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from 'next/link';

export default function PhongChieuPhimShared() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { user, isLoaded } = useUser();
  
  const [phim, setPhim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái VIP & Chế độ trải nghiệm
  const [isVip, setIsVip] = useState(false);
  const [isExperienceMode, setIsExperienceMode] = useState(false);
  const [fanId, setFanId] = useState("");
  const [paymentStep, setPaymentStep] = useState(1);
  const [copiedField, setCopiedField] = useState("");

  // 🎯 CẤU HÌNH VUỐT MÀN HÌNH (SWIPE TO EXIT)
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 70; // Độ dài vuốt tối thiểu để nhận diện

  // 1. Lấy dữ liệu Phim, VIP & Cấu hình sạp
  useEffect(() => {
    const fetchData = async () => {
      // Bốc phim
      const { data: movieData } = await supabase.from('movies').select('*').eq('id', id).single();
      if (movieData) setPhim(movieData);

      // Bốc cấu hình sạp (Đã fix lỗi single)
      const { data: settings } = await supabase.from('settings').select('is_experience_mode').limit(1).single();
      if (settings) setIsExperienceMode(settings.is_experience_mode);

      // Check xem khách có phải đại gia VIP không
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_vip, fan_id').eq('id', user.id).single();
        if (profile) {
          setIsVip(profile.is_vip);
          setFanId(profile.fan_id);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user?.id]); // Đã fix lỗi giật chớp do re-render user

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // 🎯 HÀM XỬ LÝ THOÁT THÔNG MINH
  const handleExit = () => {
    // Nếu có lịch sử trang trước đó thì quay lại, không thì về thẳng trang chủ
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // 🎯 BỘ CẢM BIẾN VUỐT MÀN HÌNH
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
    const distanceY = touchStart.y - touchEnd.y;
    
    // Vuốt từ trái sang phải (iOS Back) hoặc Vuốt từ trên xuống dưới
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isRightSwipe || isDownSwipe) {
      handleExit();
    }
  };

  // --- TRẠNG THÁI TẢI ---
  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-yellow-500 font-black animate-pulse">ĐANG KIỂM TRA QUYỀN TRUY CẬP...</div>;
  }

  // 🛡️ CHỐT CHẶN 1: CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center">
        <img src="/logo.jpg" className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-8 shadow-2xl object-cover" alt="Logo" />
        {/* Đã xóa inline style, tiên sinh nhớ thêm font Lexend vào global.css nhé */}
        <h2 className="text-3xl font-black text-yellow-500 uppercase italic mb-4">
          Xem Phim Không Cần Não
        </h2>
        <p className="text-gray-400 mb-8 font-medium">Lão bản ơi, đăng nhập để vào sạp xem phim nhé!</p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <SignInButton mode="modal">
            <button className="w-full py-4 bg-yellow-500 rounded-2xl text-xl font-black text-black uppercase shadow-lg active:scale-95 transition-all">🚀 Đăng nhập ngay</button>
          </SignInButton>
          {/* Đã sửa lỗi bọc Link bằng Button */}
          <Link href="/" className="block w-full py-2 text-gray-500 hover:text-white transition-colors font-bold text-sm uppercase">
            ⬅️ Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // 🛡️ CHỐT CHẶN 2: ĐÃ ĐĂNG NHẬP NHƯNG CHƯA VIP (VÀ KHÔNG TRONG CHẾ ĐỘ TRẢI NGHIỆM)
  if (!isVip && !isExperienceMode) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="bg-[#1a1f2e] p-8 rounded-3xl max-w-sm w-full text-center border-2 border-yellow-500 shadow-2xl relative">
          <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase italic leading-none">Nâng Cấp VIP <br/> Để Xem Phim</h2>
          
          {paymentStep === 1 ? (
            <div className="text-left space-y-4">
              <p className="text-gray-300 text-xs italic">Cả nhà thân mến, phòng này dành riêng cho hội viên VIP của sạp ạ.</p>
              <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center"><p className="text-yellow-500 font-bold text-xl uppercase">45.000đ / NĂM</p></div>
              <div className="bg-black/20 p-3 rounded-xl text-[12px] text-gray-300">
                <p>• <b>Chủ TK:</b> <span className="text-white uppercase">PHAN THI THU THAO</span></p>
                <p>• <b>Nội dung:</b> <span className="text-yellow-400 font-mono font-bold text-base uppercase">DONATE_{fanId}</span></p>
              </div>
              <button onClick={() => setPaymentStep(2)} className="w-full py-4 bg-yellow-600 text-black font-bold rounded-2xl hover:bg-yellow-500 uppercase shadow-lg">Tiếp tục thanh toán</button>
              {/* Đã sửa lỗi bọc Link bằng Button */}
              <Link href="/" className="block w-full text-center py-2 text-gray-500 text-xs font-bold uppercase hover:text-white mt-2">
                ⬅️ Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-2 rounded-2xl inline-block"><img src={`https://img.vietqr.io/image/VCB-1042526602-compact2.jpg?amount=45000&addInfo=DONATE%5F${fanId}`} className="w-44 h-44" alt="QR" /></div>
              <div className="bg-black/40 p-4 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2"><span>Ngân hàng:</span><span className="text-white font-bold uppercase">Vietcombank</span></div>
                <div className="flex justify-between items-center"><span>Nội dung:</span><div className="flex items-center gap-2"><span className="text-yellow-400 font-bold">DONATE_{fanId}</span><button onClick={() => handleCopy(`DONATE_${fanId}`, "nd")} className={`px-2 py-1 rounded text-[9px] ${copiedField === "nd" ? "bg-green-600" : "bg-gray-700"}`}>Copy</button></div></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPaymentStep(1)} className="flex-1 py-3 border border-gray-700 text-gray-500 font-bold rounded-xl text-[10px] uppercase">Quay lại</button>
                <button onClick={() => window.location.reload()} className="flex-[2] py-3 bg-yellow-600 text-black font-black rounded-xl text-[10px] uppercase shadow-lg">Xác nhận đã nạp</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!phim) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">Phim không tồn tại!</div>;

  // ✅ ĐÃ VƯỢT QUA TẤT CẢ CHỐT CHẶN: CHO XEM PHIM (Có gắn cảm biến vuốt màn hình)
  return (
    <div 
      className="relative w-full h-[100dvh] bg-black overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button 
        onClick={handleExit}
        className="absolute top-6 left-6 z-[9999] p-3 bg-black/40 hover:bg-yellow-500 text-white hover:text-black rounded-full backdrop-blur-md border border-white/20 transition-all shadow-2xl active:scale-90"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>

      {/* Truyền handleExit vào TrinhPhatVideo để nó cũng có thể gọi ra nếu cần */}
      <TrinhPhatVideo phim={phim} isActive={true} onClose={handleExit} />
    </div>
  );
}