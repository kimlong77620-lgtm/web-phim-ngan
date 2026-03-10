import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // 🎯 Cho phép ảnh, css, js qua cửa thoải mái
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 🎯 Luôn theo dõi các đường dẫn API
    '/(api|trpc)(.*)',
  ],
};