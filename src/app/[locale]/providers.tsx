'use client';

import { PostHogProvider } from '@/analytics/posthog-analytics';
import { ActiveThemeProvider } from '@/components/layout/active-theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { websiteConfig } from '@/config/website';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
}

/**
 * Simplified Providers - removed auth and query providers
 *
 * Remaining providers:
 * - PostHogProvider: Provides the PostHog analytics to the app
 * - ThemeProvider: Provides the theme to the app
 * - ActiveThemeProvider: Provides the active theme to the app
 * - TooltipProvider: Provides the tooltip to the app
 */
export function Providers({ children, locale }: ProvidersProps) {
  const defaultMode = websiteConfig.ui.mode?.defaultMode ?? 'system';

  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme={defaultMode}
        enableSystem={true}
        disableTransitionOnChange
      >
        <ActiveThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ActiveThemeProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
