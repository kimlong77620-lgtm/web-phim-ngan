import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Lexend } from 'next/font/google'; 
import "./globals.css";
import InstallGuide from '@/components/InstallGuide';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

// 1. VŨ KHÍ DIỆT LỖI ZOOM: Khóa tỷ lệ màn hình chuẩn chỉ cho Mobile
export const viewport: Viewport = {
  themeColor: '#eab308', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

// 2. PHÙ HIỆU SẠP PHIM: Metadata và PWA đã tối ưu cho Facebook
export const metadata: Metadata = {
  title: "Sạp Zhaodi",
  description: "Sạp phim dịch độc quyền bởi xiaopan0396",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sạp Zhaodi",
  },
  // Đã sửa lỗi: images phải nằm trong openGraph và twitter
  openGraph: {
    title: "Sạp Zhaodi",
    description: "Sạp phim dịch độc quyền bởi xiaopan0396",
    url: "https://www.xemphimkhongcannao.io.vn",
    siteName: "Sạp Zhaodi",
    images: [
      {
        url: "/logo.jpg", // Đảm bảo có file logo.jpg trong thư mục public nhé lão bản!
        width: 1200,
        height: 630,
        alt: "Sạp Zhaodi - Phim dịch độc quyền",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sạp Zhaodi",
    description: "Sạp phim dịch độc quyền bởi xiaopan0396",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <ClerkProvider>
      <html lang="vi" className="dark" suppressHydrationWarning>
        <head>
          {/* 🧨 VŨ KHÍ HẠT NHÂN: Ép xóa Service Worker (PWA cache) ngay trước khi web kịp tải */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log("Đã dọn dẹp cache PWA cũ!");
                    }
                  });
                }
              `,
            }}
          />
        </head>
        {/* Đảm bảo full màn hình, chống cuộn ngang */}
        <body className={`${lexend.className} antialiased bg-[#0b0f19] text-white w-full min-h-dvh overflow-x-hidden`}>
          {isMaintenance ? (
            <div className="flex flex-col items-center justify-center min-h-dvh text-center p-4">
              <img src="/logo.jpg" alt="Bảo trì" className="w-24 h-24 rounded-full border-4 border-yellow-500 mb-6 grayscale opacity-50" />
              <h1 className="text-4xl font-black text-yellow-500 mb-4 uppercase tracking-tighter">SẠP ĐANG BẢO TRÌ</h1>
              <p className="text-gray-400 font-medium">Lão bản đang nhập thêm phim mới, chư vị tiên sinh vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            <>
              {/* Đã dọn dẹp class "relative" và "min-h-screen" để tránh xung đột */}
              <main className="w-full min-h-dvh flex flex-col">
                {children}
              </main>
              <InstallGuide />
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}