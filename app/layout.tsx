import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Lexend } from 'next/font/google'; 
import "./globals.css";
import InstallGuide from '@/components/InstallGuide';

// --- ĐIỂM SỬA QUAN TRỌNG: Gọi đúng tên BackHandler để hết lỗi đỏ ---
import BackHandler from '@/components/BackHandler';
import ContactIcons from '@/components/ContactIcons';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '700', '900'] });

export const viewport: Viewport = {
  themeColor: '#eab308', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

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
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <ClerkProvider>
      <html lang="vi" className="dark">
        <body className={`${lexend.className} antialiased bg-[#0b0f19] text-white`}>
          
          {/* --- ĐIỂM SỬA QUAN TRỌNG: Đổi linh kiện chặn vuốt văng app --- */}
          <BackHandler />

          {isMaintenance ? (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4">
              <img src="/logo.jpg" alt="Bảo trì" className="w-24 h-24 rounded-full border-4 border-yellow-500 mb-6 grayscale opacity-50" />
              <h1 className="text-4xl font-black text-yellow-500 mb-4 uppercase tracking-tighter">SẠP ĐANG BẢO TRÌ</h1>
              <p className="text-gray-400 font-medium">Lão bản đang nhập thêm phim mới, chư vị tiên sinh vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            <>
              <main className="min-h-screen relative">
                {children}
              </main>

              <ContactIcons />
              
              <InstallGuide />
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}