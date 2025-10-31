import { headers } from 'next/headers';
import type { Locale, Messages } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from './routing';
import { getMessagesForLocale } from './messages';

/**
 * 页面级按需翻译加载器
 * 在页面组件中调用，动态加载特定页面的翻译内容
 */
export async function getPageTranslations(
  locale: Locale,
  pageKey: string,
  options: {
    includeCommon?: boolean;
    fallbackLocale?: Locale;
  } = {}
): Promise<{ t: any; messages: Messages }> {
  const { includeCommon = true, fallbackLocale = routing.defaultLocale } = options;

  console.log(`🎯 [getPageTranslations] Loading translations for page: ${pageKey} (${locale})`);

  try {
    // 直接获取页面翻译，不通过 messages
    const translations = await getTranslations({ locale, namespace: pageKey });

    // 创建简单的翻译函数
    const t = (key: string) => {
      if (key.includes('.')) {
        // 支持嵌套键，如 'hero.title'
        return translations(key);
      } else {
        // 直接键
        return translations(key);
      }
    };

    console.log(`✅ [getPageTranslations] Successfully loaded: ${pageKey}`);
    return { t, messages: {} };
  } catch (error) {
    console.warn(`⚠️ [getPageTranslations] Failed to load ${pageKey}, using fallback:`, error);

    // 回退到默认语言
    try {
      const fallbackTranslations = await getTranslations({ locale: fallbackLocale, namespace: pageKey });

      const t = (key: string) => {
        return fallbackTranslations(key);
      };

      return { t, messages: {} };
    } catch (fallbackError) {
      console.error(`❌ [getPageTranslations] Fallback also failed for ${pageKey}:`, fallbackError);

      // 最后的回退：返回空的翻译对象
      const t = () => '';
      return { t, messages: {} };
    }
  }
}

/**
 * 智能路径检测：从请求头中获取当前路径信息
 */
export async function getCurrentPathInfo(): Promise<{
  pathname: string;
  pathWithoutLocale: string;
  isTranslatorPage: boolean;
  locale: string;
}> {
  const headersList = headers();

  const pathname = headersList.get('x-current-pathname') || '/';
  const pathWithoutLocale = headersList.get('x-path-without-locale') || '/';
  const isTranslatorPage = headersList.get('x-is-translator-page') === 'true';
  const detectedLocale = headersList.get('x-detected-locale') || routing.defaultLocale;

  return {
    pathname,
    pathWithoutLocale,
    isTranslatorPage,
    locale: detectedLocale,
  };
}

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
 * 根据路径自动检测翻译器键名
 */
export function detectTranslatorKeyFromPath(pathname: string): string | null {
  // 移除查询参数和哈希
  const cleanPath = pathname.split('?')[0]?.split('#')[0] || '';

  // 直接匹配
  if (PATH_TO_TRANSLATOR_KEY[cleanPath]) {
    return PATH_TO_TRANSLATOR_KEY[cleanPath];
  }

  // 模式匹配：处理包含 -translator 或 -generator 的路径
  if (cleanPath.includes('-translator') || cleanPath.includes('-generator')) {
    // 提取路径的最后一段作为键名的基础
    const segments = cleanPath.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
      // 转换为 PascalCase 格式的键名
      const keyName = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Page';

      return keyName;
    }
  }

  return null;
}

/**
 * 便捷函数：为翻译器页面获取翻译
 */
export async function getTranslatorPageTranslations(
  locale: Locale,
  options: {
    translatorKey?: string;
    includeCommon?: boolean;
  } = {}
) {
  const { translatorKey, includeCommon = true } = options;

  if (!translatorKey) {
    // 如果没有提供翻译器键名，尝试从路径检测
    const pathInfo = await getCurrentPathInfo();
    const detectedKey = detectTranslatorKeyFromPath(pathInfo.pathWithoutLocale);

    if (!detectedKey) {
      console.warn('⚠️ [getTranslatorPageTranslations] Could not detect translator key from path:', pathInfo.pathWithoutLocale);
      return { t: (key: string) => '', messages: {} };
    }

    return getPageTranslations(locale, detectedKey, { includeCommon });
  }

  return getPageTranslations(locale, translatorKey, { includeCommon });
}