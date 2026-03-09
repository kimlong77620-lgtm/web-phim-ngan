import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';

// Đoạn này khóa zoom màn hình, giúp app không bị phóng to thu nhỏ lung tung
export const viewport: Viewport = {
  themeColor: '#eab308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Đoạn này khai báo thông tin App cho iPhone
export const metadata: Metadata = {
  title: "Xem Phim Không Cần Não",
  description: "Sạp phim độc quyền của xiaopan0396",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "xem phim không cần não",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}