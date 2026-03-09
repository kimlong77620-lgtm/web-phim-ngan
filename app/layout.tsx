import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sạp nhà Zhaodi',
  description: 'Web xem phim ngắn cực mượt',
}

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