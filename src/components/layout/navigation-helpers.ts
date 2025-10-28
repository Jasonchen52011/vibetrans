import { useRouter } from 'next/navigation';
import { LocaleLink } from '@/i18n/navigation';

/**
 * Navigation helper utilities for better performance
 */
export function prefetch(route: string) {
  // Use Next.js prefetch API for better navigation performance
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }
}

/**
 * Optimized navigation hook
 */
export function useOptimizedNavigation() {
  const router = useRouter();

  const navigate = (route: string) => {
    // Add prefetch before navigation
    prefetch(route);

    // Use router.push with a slight delay for better UX
    setTimeout(() => {
      router.push(route);
    }, 50);
  };

  return { navigate };
}

/**
 * Cache for storing page data to avoid unnecessary reloads
 */
class NavigationCache {
  private cache = new Map<string, any>();
  private maxSize = 10;

  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  has(key: string) {
    return this.cache.has(key);
  }
}

export const navigationCache = new NavigationCache();