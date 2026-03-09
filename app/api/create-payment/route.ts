import { NextResponse } from "next/server";
// 💡 CÁCH GỌI MỚI TOANH CỦA PAYOS PHIÊN BẢN MỚI
import { PayOS } from "@payos/node";

// 💡 CÁCH KHỞI TẠO MỚI (Dùng object thay vì 3 tham số rời rạc)
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "",
  apiKey: process.env.PAYOS_API_KEY || "",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || ""
});

export async function POST(request: Request) {
  try {
    const { fanId, amount } = await request.json();
    
    // Tạo mã đơn hàng an toàn (Lấy theo giây)
    const orderCode = Math.floor(Date.now() / 1000); 
    const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    const body = {
      orderCode: orderCode,
      amount: Number(amount),
      description: `ZHAODI ${fanId}`,
      cancelUrl: `${domain}`,
      returnUrl: `${domain}`,
    };

    console.log("-----------------------------------------");
    console.log("📦 SẠP ZHAODI ĐANG GỬI ĐƠN:", body);

    // 💡 HÀM TẠO LINK MỚI CỦA PAYOS
    const paymentLinkRes = await payos.paymentRequests.create(body);

    console.log("✅ TẠO LINK THÀNH CÔNG, CHUẨN BỊ PHI NGỰA!");
    console.log("-----------------------------------------");

    return NextResponse.json({ bin: paymentLinkRes.checkoutUrl });

  } catch (error: any) {
    console.log("-----------------------------------------");
    console.error("❌ LỖI RỒI LÃO BẢN ƠI:", error);
    if (error.response && error.response.data) {
       console.error("👉 Chi tiết:", error.response.data);
    }
    console.log("-----------------------------------------");
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}