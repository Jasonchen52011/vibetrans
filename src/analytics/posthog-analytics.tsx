'use client';

/**
 * Minimal Analytics Provider
 *
 * Temporary fallback to avoid posthog-js dependency issues
 * Will return children without analytics functionality
 */

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Always return children without analytics for now
  return <>{children}</>;
}