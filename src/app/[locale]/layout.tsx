import { Analytics } from '@/analytics/analytics';
import { fontSatoshi } from '@/assets/fonts';
import AffonsoScript from '@/components/affiliate/affonso';
import PromotekitScript from '@/components/affiliate/promotekit';
import { TailwindIndicator } from '@/components/layout/tailwind-indicator';
import { getMessagesForLocale } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import { type Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Providers } from './providers';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // 简化翻译加载：直接加载基础消息
  const messages = await getMessagesForLocale(locale);

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className={`${fontSatoshi.className}`}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers locale={locale}>
          {children}

          <Toaster richColors position="top-right" offset={64} />
          <TailwindIndicator />
          <Analytics />
          <AffonsoScript />
          <PromotekitScript />
        </Providers>
      </NextIntlClientProvider>
    </div>
  );
}
