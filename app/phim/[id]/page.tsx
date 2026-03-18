"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import TrinhPhatVideo from "@/components/TrinhPhatVideo"; // Kéo cái Tivi xịn của lão bản ra xài

export default function PhimPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { session } = useSession();
  const [phim, setPhim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ Tạo thẻ thông hành
  const authSupabase = useMemo(() => {
    return session ? createClerkSupabaseClient(session) : null;
  }, [session]);

  // 🛡️ "Đầu Thu": Chỉ chạy 1 lần để lấy đúng 1 bộ phim theo ID trên Link
  useEffect(() => {
    const fetchPhim = async () => {
      if (!authSupabase) return; // Đợi Clerk load xong
      
      const { data, error } = await authSupabase
        .from("movies")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) setPhim(data);
      setLoading(false);
    };

    fetchPhim();
  }, [params.id, authSupabase]); // Cực kỳ an toàn, không bao giờ lặp vô hạn

  if (loading) return <div className="h-dvh bg-black text-yellow-500 font-bold flex items-center justify-center">Đang tải phim...</div>;
  if (!phim) return <div className="h-dvh bg-black text-red-500 font-bold flex items-center justify-center">Lỗi: Phim không tồn tại hoặc đã bị xóa.</div>;

  // 📺 Lấy được phim rồi thì nhét vào Tivi cho nó chiếu!
  return (
    <TrinhPhatVideo 
      phim={phim} 
      isActive={true} 
      onClose={() => router.push('/')} // Bấm X (đóng) thì đá khách về lại trang chủ
    />
  );
}