import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Lexend } from 'next/font/google'; // 🎯 Đổi sang Lexend hàng hiệu của Next.js
import "./globals.css";
import InstallGuide from '@/components/InstallGuide';

// 🎯 Tải font Lexend trực tiếp từ server Next.js (Khỏi lo giật màn hình)
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

// 1. VŨ KHÍ DIỆT LỖI ZOOM: Thiết lập Viewport khóa tỷ lệ màn hình
export const viewport: Viewport = {
  themeColor: '#eab308', // Màu vàng thương hiệu của sạp phim
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Ngăn fan hâm mộ zoom làm lệch layout phim
};

// 2. PHÙ HIỆU SẠP PHIM: Metadata và cấu hình PWA để cài App
export const metadata: Metadata = {
  title: "Sạp Zhaodi",
  description: "Sạp phim dịch độc quyền bởi xiaopan0396",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sạp Zhaodi",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 3. CHẾ ĐỘ BẢO TRÌ: Kiểm tra biến môi trường từ Vercel
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <ClerkProvider>
      <html lang="vi" className="dark">
        {/* 🎯 Đắp thẳng class của font Lexend vào thẻ body */}
        <body className={`${lexend.className} antialiased bg-[#0b0f19] text-white`}>
          {isMaintenance ? (
            // Giao diện khi lão bản đang "đại tu" sạp phim
            <div className="flex flex-col items-center justify-center h-screen text-center p-4">
               {/* Thêm quả logo đen trắng cho nó ra dáng "đang sửa chữa" */}
              <img src="/logo.jpg" alt="Bảo trì" className="w-24 h-24 rounded-full border-4 border-yellow-500 mb-6 grayscale opacity-50" />
              <h1 className="text-4xl font-black text-yellow-500 mb-4 uppercase tracking-tighter">SẠP ĐANG BẢO TRÌ</h1>
              <p className="text-gray-400 font-medium">Lão bản đang nhập thêm phim mới, chư vị tiên sinh vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            // Giao diện sạp phim chính thức
            <>
              <main className="min-h-screen relative">
                {children}
              </main>
              {/* Linh kiện hướng dẫn fan dùng iPhone cài đặt sạp phim */}
              <InstallGuide />
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}