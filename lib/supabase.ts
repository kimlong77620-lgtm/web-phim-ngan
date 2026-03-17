import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 1. Client công cộng (cho mấy việc râu ria)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// 2. Singleton cho Client có xác thực Clerk
let authClient: SupabaseClient | null = null;

export const createClerkSupabaseClient = (session: any): SupabaseClient => {
  // Nếu đã có rồi thì dùng lại ngay
  if (authClient) return authClient;

  authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        // Lấy token từ Clerk
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

  return authClient;
};