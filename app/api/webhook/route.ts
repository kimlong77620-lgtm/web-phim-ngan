import { NextResponse } from "next/server";
import { PayOS } from "@payos/node"; 
import { createClient } from "@supabase/supabase-js";

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || ""
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📦 [WEBHOOK] Có người gõ cửa! Kiện hàng gốc:", body);

    // 💡 Bước 1: Kiểm tra mộc đỏ
    const webhookData: any = payos.webhooks.verify(body);
    
    // 💡 Bước 2: Truy tìm tờ giấy ghi nội dung (Quét cả vòng ngoài lẫn vòng trong)
    const description = webhookData?.description || webhookData?.data?.description || body?.data?.description;

    // 💡 LỚP ÁO GIÁP: Nếu không có nội dung (hoặc là đơn Test), báo OK rồi cho qua luôn
    if (!description) {
        console.log("⚠️ [WEBHOOK] Kiện hàng không có nội dung chuyển khoản (có thể là đơn Test).");
        return NextResponse.json({ success: true, message: "Đã nhận đơn nhưng không có nội dung" });
    }

    console.log("✅ [WEBHOOK] Nội dung chuyển khoản là:", description);

    // 💡 Bước 3: Kiểm tra xem có đúng là khách mua hàng của sạp Zhaodi không
    if (String(description).includes("ZHAODI")) {
        // Cắt lấy mỗi cái mã FanID
        const fanId = String(description).replace("ZHAODI ", "").trim();
        console.log(`💰 [WEBHOOK] Chuẩn bị lên VIP cho khách: ${fanId}`);

        // ---> ĐOẠN CODE TÍNH THỜI GIAN THÊM VÀO Ở ĐÂY <---
        const expireDate = new Date();
        expireDate.setFullYear(expireDate.getFullYear() + 1); // Cộng 1 năm
        expireDate.setDate(expireDate.getDate() + 1); // Cộng thêm 1 ngày cho khách thoải mái
        const vipExpireString = expireDate.toISOString().split('T')[0]; // Lấy chuẩn YYYY-MM-DD
        console.log(`⏳ [WEBHOOK] Thời hạn VIP dự kiến set cho khách: ${vipExpireString}`);
        // ------------------------------------------------

         // 💡 ĐÃ SỬA THÀNH 'profiles' CHUẨN XÁC 100%
        const { error } = await supabase
          .from('profiles') 
          .update({ 
            is_vip: true,
            vip_expire_at: vipExpireString // Bơm thời gian hạn sử dụng vào Supabase!
          }) 
          .eq('fan_id', fanId);

        if (error) throw error;

        console.log(`🎉 [WEBHOOK] XONG! ĐÃ TỰ ĐỘNG BẬT VIP CHO FAN: ${fanId}`);
        return NextResponse.json({ success: true, message: "Đã duyệt VIP" });
    }

    return NextResponse.json({ success: true, message: "Không phải đơn của Zhaodi" });

  } catch (error: any) {
    console.error("❌ [WEBHOOK] LỖI TO:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}