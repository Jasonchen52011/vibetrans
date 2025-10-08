'use client';

/**
 * PostHog Analytics - Disabled
 *
 * PostHog has been removed to reduce bundle size for Cloudflare deployment
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // PostHog disabled - just return children
  return <>{children}</>;
}
