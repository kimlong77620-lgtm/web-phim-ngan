import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⚠️ Ấy chết! Lão bản quên nhập Key của Supabase rồi kìa!");
}

// 1. Client công cộng dùng cho dữ liệu không bảo mật
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. 🛡️ BIẾN GIỮ KẾT NỐI DUY NHẤT (Singleton)
let cachedClient: any = null;

export const createClerkSupabaseClient = (session: any) => {
  // Nếu đã có đệ tử rồi thì dùng lại, không đẻ thêm nữa
  if (cachedClient) return cachedClient;

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({ template: 'supabase' });
        const headers = new Headers(options.headers);
        
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });

  return cachedClient;
};