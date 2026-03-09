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

  // 1. Lấy dữ liệu Phim, VIP & Cấu hình sạp
  useEffect(() => {
    const fetchData = async () => {
      // Bốc phim
      const { data: movieData } = await supabase.from('movies').select('*').eq('id', id).single();
      if (movieData) setPhim(movieData);

      // Bốc cấu hình sạp (Check xem có đang thả cửa cho xem free không)
      const { data: settings } = await supabase.from('settings').select('is_experience_mode').single();
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
  }, [id, user]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // --- TRẠNG THÁI TẢI ---
  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-yellow-500 font-black animate-pulse">ĐANG KIỂM TRA QUYỀN TRUY CẬP...</div>;
  }

  // 🛡️ CHỐT CHẶN 1: CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@900&display=swap');`}</style>
        <img src="/logo.jpg" className="w-32 h-32 rounded-full border-4 border-yellow-500 mb-8 shadow-2xl object-cover" />
        <h2 className="text-3xl font-black text-yellow-500 uppercase italic mb-4" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Xem Phim Không Cần Não
        </h2>
        <p className="text-gray-400 mb-8 font-medium">Lão bản ơi, đăng nhập để vào sạp xem phim nhé!</p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <SignInButton mode="modal">
            <button className="w-full py-4 bg-yellow-500 rounded-2xl text-xl font-black text-black uppercase shadow-lg active:scale-95 transition-all">🚀 Đăng nhập ngay</button>
          </SignInButton>
          <Link href="/" className="text-gray-500 hover:text-white transition-colors font-bold text-sm uppercase">⬅️ Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  // 🛡️ CHỐT CHẶN 2: ĐÃ ĐĂNG NHẬP NHƯNG CHƯA VIP (VÀ KHÔNG TRONG CHẾ ĐỘ TRẢI NGHIỆM)
  if (!isVip && !isExperienceMode) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@900&display=swap');`}</style>
        <div className="bg-[#1a1f2e] p-8 rounded-3xl max-w-sm w-full text-center border-2 border-yellow-500 shadow-2xl relative">
          <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase italic leading-none" style={{ fontFamily: "'Lexend', sans-serif" }}>Nâng Cấp VIP <br/> Để Xem Phim</h2>
          
          {paymentStep === 1 ? (
            <div className="text-left space-y-4">
              <p className="text-gray-300 text-xs italic">Cả nhà thân mến, phòng này dành riêng cho hội viên VIP của sạp ạ.</p>
              <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center"><p className="text-yellow-500 font-bold text-xl uppercase">45.000đ / NĂM</p></div>
              <div className="bg-black/20 p-3 rounded-xl text-[12px] text-gray-300">
                <p>• <b>Chủ TK:</b> <span className="text-white uppercase">PHAN THI THU THAO</span></p>
                <p>• <b>Nội dung:</b> <span className="text-yellow-400 font-mono font-bold text-base uppercase">DONATE_{fanId}</span></p>
              </div>
              <button onClick={() => setPaymentStep(2)} className="w-full py-4 bg-yellow-600 text-black font-bold rounded-2xl hover:bg-yellow-500 uppercase shadow-lg">Tiếp tục thanh toán</button>
              <Link href="/"><button className="w-full py-2 text-gray-500 text-xs font-bold uppercase hover:text-white mt-2">⬅️ Quay lại trang chủ</button></Link>
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

  // ✅ ĐÃ VƯỢT QUA TẤT CẢ CHỐT CHẶN: CHO XEM PHIM
  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-[9999] p-3 bg-black/40 hover:bg-yellow-500 text-white hover:text-black rounded-full backdrop-blur-md border border-white/20 transition-all shadow-2xl active:scale-90"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>

      <TrinhPhatVideo phim={phim} isActive={true} onClose={() => router.push('/')} />
    </div>
  );
}