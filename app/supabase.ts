import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🛡️ CHỐT BẢO VỆ: Báo lỗi tiếng Việt cực rõ ràng nếu quên nhập Key
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⚠️ Ấy chết! Lão bản quên nhập Key của Supabase trong file .env.local hoặc trên Vercel rồi kìa!");
}

// Khởi tạo kết nối an toàn
export const supabase = createClient(supabaseUrl, supabaseAnonKey)