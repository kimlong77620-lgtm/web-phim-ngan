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
    
    // 💡 BẢN CHUẨN KẾT HỢP: Vừa đúng phiên bản mới, vừa có bùa chống lỗi
const webhookData: any = payos.webhooks.verify(body);

    const description = webhookData.description;
    const fanId = description.replace("ZHAODI ", "").trim();

    console.log("💰 TIN CHUẨN: Khách", fanId, "vừa thanh toán", webhookData.amount, "đ");

    // 🚀 TỰ ĐỘNG BẬT VIP
    const { error } = await supabase
      .from('users') // ⚠️ Lão bản nhớ đảm bảo tên bảng này đúng nhé
      .update({ is_vip: true }) 
      .eq('fanId', fanId);

    if (error) {
      console.error("❌ Cập nhật VIP thất bại:", error);
      throw error;
    }

    console.log("🎉 ĐÃ TỰ ĐỘNG BẬT VIP CHO FAN:", fanId);
    return NextResponse.json({ success: true, message: "Đã duyệt VIP" });

  } catch (error: any) {
    console.error("❌ LỖI TẠI THU NGÂN WEBHOOK:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}