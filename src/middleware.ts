import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

/**
 * 极简中间件：最小化Worker大小，避免3MB限制
 */
export default function middleware(req: Request) {
  const response = handleI18nRouting(req);

  // 最小化路径检测 - 只检测关键路径
  const url = new URL(req.url);
  const pathname = url.pathname;

  // 使用更简单的检测逻辑，减少字符串操作
  const isTranslator = pathname.indexOf('translator') > -1 || pathname.indexOf('generator') > -1;

  // 只设置绝对必要的header
  response.headers.set('x-path', pathname);
  if (isTranslator) {
    response.headers.set('x-type', 'translator');
  }

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
