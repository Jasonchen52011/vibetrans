import { Analytics } from '@/analytics/analytics';
import { fontSatoshi } from '@/assets/fonts';
import AffonsoScript from '@/components/affiliate/affonso';
import PromotekitScript from '@/components/affiliate/promotekit';
import { TailwindIndicator } from '@/components/layout/tailwind-indicator';
import { getMessagesForLocale } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import { type Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Providers } from './providers';

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) {
    return '/';
  }

  const trimmed = pathname.split('?')[0]?.split('#')[0] ?? '/';
  const withoutRouteGroups = trimmed.replace(/\/\([^/]+\)/g, '/');
  const collapsed = withoutRouteGroups.replace(/\/+/g, '/');

  if (!collapsed || collapsed === '') {
    return '/';
  }

  return collapsed !== '/' && collapsed.endsWith('/')
    ? collapsed.slice(0, -1)
    : collapsed;
}

// 翻译器页面模式映射表
const TRANSLATOR_PAGE_PATTERNS = {
  '/minion-translator': 'MinionTranslatorPage',
  '/al-bhed-translator': 'AlBhedTranslatorPage',
  '/albanian-to-english': 'AlbanianToEnglishPage',
  '/alien-text-generator': 'AlienTextGeneratorPage',
  '/ancient-greek-translator': 'AncientGreekTranslatorPage',
  '/aramaic-translator': 'AramaicTranslatorPage',
  '/baby-translator': 'BabyTranslatorPage',
  '/bad-translator': 'BadTranslatorPage',
  '/baybayin-translator': 'BaybayinTranslatorPage',
  '/cantonese-translator': 'CantoneseTranslatorPage',
  '/chinese-to-english-translator': 'ChineseToEnglishTranslatorPage',
  '/creole-to-english-translator': 'CreoleToEnglishTranslatorPage',
  '/cuneiform-translator': 'CuneiformTranslatorPage',
  '/dog-translator': 'DogTranslatorPage',
  '/drow-translator': 'DrowTranslatorPage',
  '/dumb-it-down-ai': 'DumbItDownPage',
  '/english-to-amharic-translator': 'EnglishToAmharicTranslatorPage',
  '/english-to-chinese-translator': 'EnglishToChineseTranslatorPage',
  '/english-to-persian-translator': 'EnglishToPersianTranslatorPage',
  '/english-to-polish-translator': 'EnglishToPolishTranslatorPage',
  '/english-to-swahili-translator': 'EnglishToSwahiliTranslatorPage',
  '/esperanto-translator': 'EsperantoTranslatorPage',
  '/gaster-translator': 'GasterTranslatorPage',
  '/gen-alpha-translator': 'GenAlphaTranslatorPage',
  '/gen-z-translator': 'GenZTranslatorPage',
  '/gibberish-translator': 'GibberishTranslatorPage',
  '/greek-translator': 'GreekTranslatorPage',
  '/high-valyrian-translator': 'HighValyrianTranslatorPage',
  '/ivr-translator': 'IvrTranslatorPage',
  '/japanese-to-english-translator': 'JapaneseToEnglishTranslatorPage',
  '/mandalorian-translator': 'MandalorianTranslatorPage',
  '/manga-translator': 'MangaTranslatorPage',
  '/middle-english-translator': 'MiddleEnglishTranslatorPage',
  '/nahuatl-translator': 'NahuatlTranslatorPage',
  '/ogham-translator': 'OghamTranslatorPage',
  '/pig-latin-translator': 'PigLatinTranslatorPage',
  '/rune-translator': 'RuneTranslatorPage',
  '/runic-translator': 'RunicTranslatorPage',
  '/samoan-to-english-translator': 'SamoanToEnglishTranslatorPage',
  '/swahili-to-english-translator': 'SwahiliToEnglishTranslatorPage',
  '/telugu-to-english-translator': 'TeluguToEnglishTranslatorPage',
  '/verbose-generator': 'VerboseGeneratorPage',
  '/wingdings-translator': 'WingdingsTranslatorPage',
  '/yoda-translator': 'YodaTranslatorPage',
};

/**
 * 检测当前路径是否为翻译器页面并返回对应的翻译键名
 */
function detectTranslatorPage(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  if (!normalized || normalized === '/') return null;

  // 过滤掉静态资源路径，确保图片URL不会被误认为是页面路径
  if (
    normalized.startsWith('/images/') ||
    normalized.startsWith('/assets/') ||
    (normalized.includes('.') &&
      (normalized.endsWith('.webp') ||
        normalized.endsWith('.jpg') ||
        normalized.endsWith('.jpeg') ||
        normalized.endsWith('.png') ||
        normalized.endsWith('.gif') ||
        normalized.endsWith('.svg') ||
        normalized.endsWith('.css') ||
        normalized.endsWith('.js')))
  ) {
    return null;
  }

  // 移除locale前缀和查询参数
  const pathWithoutLocale = normalized
    .replace(/^\/zh\//, '/')
    .replace(/^\/([a-z]{2})\//, '/')
    .split('?')[0];

  // 直接匹配翻译器页面
  return (
    TRANSLATOR_PAGE_PATTERNS[
      pathWithoutLocale as keyof typeof TRANSLATOR_PAGE_PATTERNS
    ] || null
  );
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * 1. Locale Layout
 * https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing#layout
 *
 * 2. NextIntlClientProvider
 * https://next-intl.dev/docs/usage/configuration#nextintlclientprovider
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // 获取当前路径信息，支持按需翻译加载
  let pathname = '/';
  try {
    const incomingHeaders = await headers();
    pathname = normalizePathname(
      incomingHeaders.get('x-current-pathname') ||
        incomingHeaders.get('x-route-pathname')
    );
  } catch (error) {
    console.warn('Could not access headers, using default pathname');
  }

  // 智能策略：检测当前页面并按需加载对应翻译
  const translatorKey = detectTranslatorPage(pathname);

  console.log('🎯 [LocaleLayout] Detected page:', {
    pathname,
    translatorKey,
    locale,
  });

  // 精确加载策略：只加载需要的命名空间
  const messages = await getMessagesForLocale(locale, {
    pathname,
    translatorKey,
    includeCommon: true,
    // 明确指定不要加载热门翻译器，避免命名空间冲突
    includePopularTranslators: false,
  });

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className={`${fontSatoshi.className}`}>
      <NuqsAdapter>
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
      </NuqsAdapter>
    </div>
  );
}
