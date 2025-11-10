import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { getMessagesForLocale } from './messages';
import { routing } from './routing';

/**
 * 路径到翻译器键名的映射
 */
const PATH_TO_TRANSLATOR_KEY: Record<string, string> = {
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
  '/english-to-turkish-translator': 'EnglishToTurkishTranslatorPage',
  '/esperanto-translator': 'EsperantoTranslatorPage',
  '/gaster-translator': 'GasterTranslatorPage',
  '/gen-alpha-translator': 'GenAlphaTranslatorPage',
  '/gen-z-translator': 'GenZTranslatorPage',
  '/gibberish-translator': 'GibberishTranslatorPage',
  '/greek-translator': 'GreekTranslatorPage',
  '/haitian-creole-translator': 'HaitianCreoleTranslatorPage',
  '/high-valyrian-translator': 'HighValyrianTranslatorPage',
  '/ivr-translator': 'IvrTranslatorPage',
  '/japanese-to-english-translator': 'JapaneseToEnglishTranslatorPage',
  '/mandalorian-translator': 'MandalorianTranslatorPage',
  '/manga-translator': 'MangaTranslatorPage',
  '/middle-english-translator': 'MiddleEnglishTranslatorPage',
  '/minion-translator': 'MinionTranslatorPage',
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
 * 从请求头检测当前路径并返回对应的翻译器键名
 */
async function detectTranslatorKeyFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers();
    const rawPathname = headersList.get('x-current-pathname') || '/';
    const rawPathWithoutLocale = headersList.get('x-path-without-locale');
    const isTranslatorPage = headersList.get('x-is-translator-page') === 'true';
    const routePathname = headersList.get('x-route-pathname');
    const matchedPath = headersList.get('x-matched-path');

    const sanitize = (value: string | null | undefined): string => {
      if (!value) return '/';
      const path = value.split('?')[0]?.split('#')[0] ?? '/';
      return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    };

    const removeLocale = (value: string): string => {
      const path = sanitize(value);
      const segments = path.split('/').filter(Boolean);
      if (segments.length === 0) {
        return '/';
      }

      const locale = segments[0];
      if ((routing.locales as string[]).includes(locale)) {
        segments.shift();
      }

      return segments.length ? `/${segments.join('/')}` : '/';
    };

    const currentPath = removeLocale(rawPathname);
    const candidatePaths = new Set<string>([currentPath]);
    if (rawPathWithoutLocale) {
      candidatePaths.add(removeLocale(rawPathWithoutLocale));
    }
    if (routePathname) {
      candidatePaths.add(removeLocale(routePathname));
    }
    if (matchedPath) {
      candidatePaths.add(removeLocale(matchedPath));
    }

    const expandedCandidates = new Set<string>();
    for (const candidate of candidatePaths) {
      expandedCandidates.add(candidate);
      if (candidate.includes('(')) {
        const cleaned = candidate.replace(/\/\([^/]+\)/g, '');
        expandedCandidates.add(cleaned || '/');
      }
    }

    for (const candidate of expandedCandidates) {
      if (candidate !== '/' && PATH_TO_TRANSLATOR_KEY[candidate]) {
        return PATH_TO_TRANSLATOR_KEY[candidate];
      }
    }

    if (isTranslatorPage) {
      // Fallback: try the unsanitized path in case headers already stripped locale upstream.
      const fallbackPath = sanitize(rawPathname);
      if (fallbackPath !== '/' && PATH_TO_TRANSLATOR_KEY[fallbackPath]) {
        return PATH_TO_TRANSLATOR_KEY[fallbackPath];
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 简化的翻译请求配置
 * 参考 shipany-creem 的高效按需加载策略，支持页面级按需加载
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // 标准的 locale 处理
  let locale = await requestLocale;

  // Smart locale mapping
  if (['zh-CN', 'zh-TW', 'zh-HK', 'zh-MO'].includes(locale)) {
    locale = 'zh';
  }

  // 确保 locale 有效
  if (!hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  // 尝试检测翻译器页面
  const translatorKey = await detectTranslatorKeyFromHeaders();

  // 获取当前路径信息用于首页翻译加载
  let pathname: string | undefined;
  try {
    const headersList = await headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch (error) {
    pathname = '/';
  }

  // 根据检测结果加载翻译
  const messages = await getMessagesForLocale(locale, {
    includeCommon: true,
    translatorKey, // 如果检测到翻译器页面，则按需加载
    pathname, // 确保首页能正确加载home翻译文件
    includePopularTranslators: false, // 不在中间件预加载翻译器
  });

  return {
    locale,
    messages,
  };
});
