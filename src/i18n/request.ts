import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
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
    const pathname = headersList.get('x-current-pathname') || '/';
    const pathWithoutLocale = headersList.get('x-path-without-locale') || '/';
    const isTranslatorPage = headersList.get('x-is-translator-page') === 'true';

    if (isTranslatorPage && PATH_TO_TRANSLATOR_KEY[pathWithoutLocale]) {
      return PATH_TO_TRANSLATOR_KEY[pathWithoutLocale];
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
  if (["zh-CN", "zh-TW", "zh-HK", "zh-MO"].includes(locale)) {
    locale = "zh";
  }

  // 确保 locale 有效
  if (!hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  // 尝试检测翻译器页面
  const translatorKey = await detectTranslatorKeyFromHeaders();

  // 根据检测结果加载翻译
  const messages = await getMessagesForLocale(locale, {
    includeCommon: true,
    translatorKey, // 如果检测到翻译器页面，则按需加载
    includePopularTranslators: false, // 不在中间件预加载翻译器
  });

  return {
    locale,
    messages,
  };
});
