import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

/**
 * 优化的中间件：支持 next-intl 国际化路由和路径传递
 * 实现智能路径检测，为按需翻译加载提供路径信息
 */
export default function middleware(req) {
  // 创建基础 next-intl 响应
  const response = createMiddleware(routing)(req);

  // 为响应添加路径信息头部，支持按需翻译加载
  if (response && req.nextUrl.pathname) {
    // 设置当前路径信息，供 request.ts 使用
    response.headers.set('x-current-pathname', req.nextUrl.pathname);

    // 设置语言环境信息
    const segments = req.nextUrl.pathname.split('/').filter(Boolean);
    const locale = segments[0];
    response.headers.set('x-detected-locale', locale);

    // 检测是否为翻译器页面
    const pathWithoutLocale = segments[0] && routing.locales.includes(segments[0] as any)
      ? '/' + segments.slice(1).join('/')
      : req.nextUrl.pathname;

    const isTranslatorPage = pathWithoutLocale.includes('-translator') ||
                           pathWithoutLocale.includes('-generator') ||
                           pathWithoutLocale.includes('-ai');

    response.headers.set('x-is-translator-page', isTranslatorPage.toString());
    response.headers.set('x-path-without-locale', pathWithoutLocale);

    console.log('🔍 [middleware] Path detection:', {
      pathname: req.nextUrl.pathname,
      locale,
      pathWithoutLocale,
      isTranslatorPage
    });
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
    // - if they start with `/api`, `/_next`, `_vercel` or `/_cloudflare`
    // - if they contain a dot (e.g. `favicon.ico`)
    // - Optimize: exclude static assets and improve performance
    '/((?!api|_next|_vercel|_cloudflare|.*\\..*|manifest|robots|sitemap).*)',
  ],
};
