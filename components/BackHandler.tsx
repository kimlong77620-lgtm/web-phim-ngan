'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Mỗi khi vào một trang mới, mình "thả" một cái state giả vào lịch sử
    // Điều này đánh lừa Android rằng "vẫn còn một trang nữa ở đằng sau"
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // 2. Khi khách vuốt từ trái sang phải (kích hoạt lệnh Back)
      if (pathname === '/') {
        // Nếu đang ở trang chủ mà vuốt back, mình có thể chọn:
        // - Hoặc là hiện thông báo "Bấm lần nữa để thoát"
        // - Hoặc là không làm gì cả để khách không bị văng app
        window.history.pushState(null, '', window.location.href); 
      } else {
        // Nếu đang ở trang xem phim, vuốt một phát là về trang chủ ngay!
        router.push('/'); 
      }
    };

    // Đăng ký nghe lệnh từ hệ thống Android
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return null; // Component này không hiện gì cả, chỉ làm nhiệm vụ "gác cổng"
}