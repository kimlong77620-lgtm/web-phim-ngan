import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Dùng Service Role Key để có quyền sửa database bảo mật [cite: 2026-03-09]
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  // LỚP VỆ SĨ: Chỉ nghe lệnh nếu đúng mật mã bí mật [cite: 2026-03-09]
  if (apiKey !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
  }

  const body = await req.json();
  const content = body.content || body.description; // Nội dung CK: DONATE_123456
  const amount = body.amount; // Số tiền: 45000
  const transactionId = body.id || body.reference; // Mã GD ngân hàng

  // 1. Tách lấy mã 6 số từ nội dung chuyển khoản [cite: 2026-03-09]
  const fanIdFromBank = content.split('DONATE_')[1]?.trim();

  if (fanIdFromBank && amount >= 45000) {
    // 2. Kiểm tra xem giao dịch này đã xử lý chưa để chống hack [cite: 2026-03-09]
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('id').eq('id', transactionId).single();

    if (!existingTx) {
      // 3. Ghi vào sổ giao dịch và kích hoạt VIP [cite: 2026-03-09]
      await supabaseAdmin.from('transactions').insert({ id: transactionId, fan_id: fanIdFromBank, amount });
      await supabaseAdmin.from('profiles').update({ is_vip: true }).eq('fan_id', fanIdFromBank);
      
      return NextResponse.json({ message: "Đã nạp VIP thành công!" });
    }
  }
  return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
}