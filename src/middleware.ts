import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

/**
 * 优化的中间件：仅处理国际化路由，减少Worker大小
 */
export default function middleware(req: Request) {
  const response = handleI18nRouting(req);

  // 简化路径检测，减少计算开销
  const url = new URL(req.url);
  const pathname = url.pathname;
  const isTranslatorPage = pathname.includes('-translator') || pathname.includes('-generator') || pathname.includes('-ai');

  // 只设置必要的header
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-is-translator-page', String(isTranslatorPage));

  return response;
}

/**
 * Next.js internationalized routing
 * Specify the routes the middleware applies to
 *
 * https://next-intl.dev/docs/routing#base-path
 */
export const config = {
  // The `matcher` is relative to the `basePath`
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next/static`, `/_next/image`, `_vercel` or `/_cloudflare`
    // - if they start with `/images` (static assets)
    // - if they contain a dot (e.g. `favicon.ico`)
    // - Optimize: exclude static assets and improve performance
    '/((?!api|_next/static|_next/image|_vercel|_cloudflare|images|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt)|manifest|robots|sitemap).*)',
  ],
};
