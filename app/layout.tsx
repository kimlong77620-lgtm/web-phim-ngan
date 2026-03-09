import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import "./globals.css"; //

const inter = Inter({ subsets: ['latin'] });

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
  title: "Xem Phim Không Cần Não",
  description: "Sạp phim dịch độc quyền bởi xiaopan0396",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Phim No Não",
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
        <body className={`${inter.className} antialiased bg-[#0b0f19] text-white`}>
          {isMaintenance ? (
            // Giao diện khi lão bản đang "đại tu" sạp phim
            <div className="flex flex-col items-center justify-center h-screen text-center p-4">
              <h1 className="text-4xl font-bold text-yellow-500 mb-4">SẠP PHIM ĐANG BẢO TRÌ</h1>
              <p className="text-gray-400">Lão bản đang nhập thêm phim mới, tiên sinh vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            // Giao diện sạp phim chính thức
            <main className="min-h-screen relative">
              {children}
            </main>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}