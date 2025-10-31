'use client';

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
 * Simplified Providers - removed auth and analytics providers
 *
 * Remaining providers:
 * - ThemeProvider: Provides the theme to the app
 * - ActiveThemeProvider: Provides the active theme to the app
 * - TooltipProvider: Provides the tooltip to the app
 */
export function Providers({ children, locale }: ProvidersProps) {
  const defaultMode = websiteConfig.ui.mode?.defaultMode ?? 'system';

  return (
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
  );
}
