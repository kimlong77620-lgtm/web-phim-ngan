import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // 🎯 Cho phép xem ảnh, css, js thoải mái không bị chặn
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 🎯 Luôn kiểm tra quyền truy cập ở các đường dẫn API
    '/(api|trpc)(.*)',
  ],
};