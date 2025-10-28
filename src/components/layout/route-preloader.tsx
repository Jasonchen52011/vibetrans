'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefetch } from './navigation-helpers';

/**
 * Route preloader component
 * Prefetches related routes when user hovers over navigation items
 */
export function RoutePreloader() {
  const pathname = usePathname();
  const prefetchedRoutes = useRef(new Set<string>());

  useEffect(() => {
    // Prefetch common routes on initial load
    const commonRoutes = ['/albanian-to-english', '/chinese-to-english-translator', '/english-to-chinese-translator'];
    commonRoutes.forEach(route => {
      if (!prefetchedRoutes.current.has(route)) {
        prefetch(route);
        prefetchedRoutes.current.add(route);
      }
    });
  }, [pathname]);

  return null;
}