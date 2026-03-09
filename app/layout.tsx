import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

// 1. KHÓA ZOOM MÀN HÌNH ĐỂ APP KHÔNG BỊ CHẠY LUNG TUNG
export const viewport: Viewport = {
  themeColor: '#eab308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. KHAI BÁO THÔNG TIN APP (PWA) ĐỂ LƯU VÀO MÀN HÌNH IPHONE/ANDROID
export const metadata: Metadata = {
  title: "Xem Phim Không Cần Não",
  description: "Sạp phim độc quyền của xiaopan0396",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Phim No Não",
  },
};

// 3. KHUNG GIAO DIỆN CHÍNH (CÁI MÀ TIÊN SINH LỠ TAY XÓA MẤT LÚC NÃY)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}