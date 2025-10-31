import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { getMessagesForLocale } from './messages';
import { routing } from './routing';

/**
 * 路径到翻译器键名的映射
 */
const PATH_TO_TRANSLATOR_KEY: Record<string, string> = {
  '/minion-translator': 'MinionTranslatorPage',
  '/mandalorian-translator': 'MandalorianTranslatorPage',
  '/gen-z-translator': 'GenZTranslatorPage',
  '/gen-alpha-translator': 'GenAlphaTranslatorPage',
  '/bad-translator': 'BadTranslatorPage',
  '/gibberish-translator': 'GibberishTranslatorPage',
  '/yoda-translator': 'YodaTranslatorPage',
  '/pig-latin-translator': 'PigLatinTranslatorPage',
  '/ancient-greek-translator': 'AncientGreekTranslatorPage',
  '/chinese-to-english-translator': 'ChineseToEnglishTranslatorPage',
  '/english-to-chinese-translator': 'EnglishToChineseTranslatorPage',
  '/al-bhed-translator': 'AlBhedTranslatorPage',
  '/alien-text-generator': 'AlienTextGeneratorPage',
  // 可以根据需要添加更多映射
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