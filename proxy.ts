import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 Cấp thẻ luồng xanh cho cổng Webhook
const isPublicRoute = createRouteMatcher([
  '/api/webhook(.*)' 
]);

// ⚠️ Đã thêm chữ "async" ở đây
export default clerkMiddleware(async (auth, req) => {
  // Những ai KHÔNG đi luồng xanh thì mới bị chặn lại hỏi giấy tờ
  if (!isPublicRoute(req)) {
    await auth.protect(); // ⚠️ Cú pháp mới của Clerk
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};