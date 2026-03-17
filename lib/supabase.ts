import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⚠️ Ấy chết! Lão bản quên nhập Key của Supabase rồi kìa!");
}

// 1. Giữ nguyên kết nối cũ để dùng cho các trang không cần đăng nhập (nếu có)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. 🛡️ VŨ KHÍ MỚI: Hàm tạo kết nối dành riêng cho người dùng đã đăng nhập
export const createClerkSupabaseClient = (session: any) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        // Lấy "thẻ thông hành" JWT từ Clerk (Template đã tạo ở Bước 1)
        const clerkToken = await session?.getToken({ template: 'supabase' });

        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
};