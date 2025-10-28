import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Simplified Next.js middleware - only internationalization
 * All authentication and protected routes removed
 */
export default createMiddleware(routing);

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
