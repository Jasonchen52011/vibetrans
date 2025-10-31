import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function resolveAppPathname(pathname: string): string {
  if (!pathname.startsWith('/_next/data/')) {
    return pathname;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 3) {
    return pathname;
  }

  // segments[0] === '_next', segments[1] === 'data', segments[2] === buildId
  const withoutBuildId = segments.slice(3);
  if (!withoutBuildId.length) {
    return '/';
  }

  const last = withoutBuildId[withoutBuildId.length - 1];
  withoutBuildId[withoutBuildId.length - 1] = last.replace(/\.json$/, '');

  return `/${withoutBuildId.join('/')}`;
}

/**
 * 优化的中间件：支持 next-intl 国际化路由和路径传递
 * 实现智能路径检测，为按需翻译加载提供路径信息
 */
export default function middleware(req: NextRequest) {
  const response = handleI18nRouting(req);

  const rawPathname = req.nextUrl.pathname;
  const resolvedPathname = resolveAppPathname(rawPathname);
  const segments = resolvedPathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];
  const hasLocale = routing.locales.includes(potentialLocale as any);

  const pathWithoutLocale = hasLocale
    ? '/' + segments.slice(1).join('/')
    : resolvedPathname;

  const isTranslatorPage =
    pathWithoutLocale.includes('-translator') ||
    pathWithoutLocale.includes('-generator') ||
    pathWithoutLocale.includes('-ai');

  const headerEntries: Array<[string, string]> = [
    ['x-current-pathname', resolvedPathname],
    ['x-route-pathname', resolvedPathname],
    ['x-pathname', resolvedPathname],
    ['x-path-without-locale', pathWithoutLocale],
    ['x-is-translator-page', String(isTranslatorPage)],
  ];

  if (hasLocale) {
    headerEntries.push(['x-detected-locale', potentialLocale]);
  }

  headerEntries.forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  console.log('🔍 [middleware] Path detection:', {
    rawPathname,
    resolvedPathname,
    locale: hasLocale ? potentialLocale : null,
    pathWithoutLocale,
    isTranslatorPage,
  });

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
