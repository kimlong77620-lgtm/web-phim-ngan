import { NextResponse } from "next/server";
// 💡 Khai báo chuẩn phiên bản mới
import { PayOS } from "@payos/node"; 
import { createClient } from "@supabase/supabase-js";

// Khởi tạo cỗ máy PayOS (Dùng object)
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || ""
});

// Khởi tạo quyền lực tối cao Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📦 [WEBHOOK] Có người gõ cửa! Kiện hàng PayOS gửi đến:", body);

    // 💡 HÀM KIỂM TRA MỘC ĐỎ CỦA PHIÊN BẢN MỚI TẠI ĐÂY
    const webhookData: any = payos.webhooks.verify(body);
    console.log("✅ [WEBHOOK] Mộc đỏ chuẩn xác. Dữ liệu bên trong:", webhookData);

    // Phiên bản mới verify thành công là có data luôn, lấy FanID ra bật VIP
    const description = webhookData.description; 
    const fanId = description.replace("ZHAODI ", "").trim();
    
    console.log(`💰 [WEBHOOK] Chuẩn bị lên VIP cho khách: ${fanId}`);

    const { error } = await supabase
      .from('users') // ⚠️ Nhớ đảm bảo tên bảng Supabase của sạp đúng là 'users'
      .update({ is_vip: true }) 
      .eq('fanId', fanId);

    if (error) {
      console.error("❌ [WEBHOOK] Cập nhật Database thất bại:", error);
      throw error;
    }

    console.log(`🎉 [WEBHOOK] XONG! ĐÃ TỰ ĐỘNG BẬT VIP CHO FAN: ${fanId}`);
    return NextResponse.json({ success: true, message: "Đã duyệt VIP" });

  } catch (error: any) {
    console.error("❌ [WEBHOOK] LỖI TO:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}