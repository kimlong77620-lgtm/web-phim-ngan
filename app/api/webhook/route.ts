import { NextResponse } from "next/server";
const PayOSRaw = require("@payos/node");
import { createClient } from "@supabase/supabase-js";

// Lấy cỗ máy PayOS (Dùng cách cũ để chống lỗi Not a constructor)
const PayOS = PayOSRaw.PayOS || PayOSRaw.default || PayOSRaw;
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID || "",
  process.env.PAYOS_API_KEY || "",
  process.env.PAYOS_CHECKSUM_KEY || ""
);

// Quyền lực tối cao Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    // 1. NHẬN KIỆN HÀNG TỪ BƯU TÁ PAYOS
    const body = await request.json();
    console.log("📦 [WEBHOOK] Có người gõ cửa! Kiện hàng PayOS gửi đến:", body);

    // 2. KIỂM TRA MỘC NIÊM PHONG (Chống lừa đảo)
    // Hàm này của PayOS sẽ tự động đối chiếu chìa khóa Checksum trên Vercel
    const webhookData = payos.verifyPaymentWebhookData(body);
    console.log("✅ [WEBHOOK] Mộc đỏ chuẩn xác. Dữ liệu bên trong:", webhookData);

    // Nếu giao dịch thành công ("00" là mã thành công của ngân hàng)
    if (body.code === "00" || body.success === true) {
        
        // 3. TÌM TÊN KHÁCH HÀNG
        const description = webhookData.description; // Ví dụ: "ZHAODI 123456"
        const fanId = description.replace("ZHAODI ", "").trim(); // Cắt lấy "123456"
        
        console.log(`💰 [WEBHOOK] Chuẩn bị lên VIP cho khách: ${fanId}`);

        // 4. BÁO CHO THỦ KHO BẬT VIP
        const { error } = await supabase
          .from('users') // ⚠️ Lão bản nhớ đảm bảo bảng này tên là 'users' nhé
          .update({ is_vip: true }) 
          .eq('fanId', fanId);

        if (error) {
          console.error("❌ [WEBHOOK] Cập nhật Database thất bại:", error);
          throw error;
        }

        console.log(`🎉 [WEBHOOK] Xong! Đã bật VIP cho: ${fanId}`);
        return NextResponse.json({ success: true, message: "Đã duyệt VIP" });
    }

    // Nếu khách mới tạo mã QR mà chưa trả tiền
    return NextResponse.json({ success: true, message: "Giao dịch chưa hoàn tất" });

  } catch (error: any) {
    console.error("❌ [WEBHOOK] LỖI TO:", error.message);
    // Dù lỗi vẫn trả về 200 để Bưu Tá PayOS không đứng gõ cửa gọi báo lại nhiều lần
    return NextResponse.json({ success: false, message: error.message });
  }
}