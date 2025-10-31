// 移除 deepmerge，使用简单的对象合并
import type { Locale, Messages } from 'next-intl';
import { routing } from './routing';

type MessageModule = Record<string, unknown>;
type MessageLoader = (locale: Locale) => Promise<MessageModule | null>;

interface GetMessagesOptions {
  pathname?: string;
  modules?: string[];
  includeCommon?: boolean;
  translatorKey?: string;        // 特定翻译器页面的键名
  includePopularTranslators?: boolean;  // 是否包含热门翻译器页面
}

function isModuleNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message ?? '';
  const code =
    typeof (error as { code?: unknown }).code === 'string'
      ? ((error as { code: string }).code as string)
      : undefined;

  return code === 'MODULE_NOT_FOUND' || message.includes('Cannot find module');
}

function createLocaleLoader(
  importer: (locale: Locale) => Promise<{ default: MessageModule }>
): MessageLoader {
  const cache = new Map<Locale, MessageModule | null>();

  return async (locale) => {
    if (cache.has(locale)) {
      return cache.get(locale) ?? null;
    }

    try {
      const mod = await importer(locale);
      const value = (mod?.default ?? mod) as MessageModule;
      cache.set(locale, value);
      return value;
    } catch (error) {
      if (isModuleNotFoundError(error)) {
        cache.set(locale, null);
        return null;
      }
      throw error;
    }
  };
}

const LOCALE_ROOT_LOADER = createLocaleLoader(
  (locale) => import(`../../messages/${locale}.json`)
);

const COMMON_LOADERS: MessageLoader[] = [
  createLocaleLoader(
    (locale) => import(`../../messages/common/${locale}.json`)
  ),
  createLocaleLoader(
    (locale) => import(`../../messages/common/mail-${locale}.json`)
  ),
  createLocaleLoader(
    (locale) => import(`../../messages/common/newsletter-${locale}.json`)
  ),
  createLocaleLoader(
    (locale) => import(`../../messages/common/premium-${locale}.json`)
  ),
  createLocaleLoader(
    (locale) => import(`../../messages/marketing/${locale}.json`)
  ),
  createLocaleLoader((locale) => import(`../../messages/demo/${locale}.json`)),
  createLocaleLoader(
    (locale) => import(`../../messages/pages/public/${locale}.json`)
  ),
];

const ROUTE_LOADERS: Record<string, MessageLoader> = {
  about: createLocaleLoader(
    (locale) => import(`../../messages/pages/about/${locale}.json`)
  ),
  'al-bhed-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/al-bhed-translator/${locale}.json`)
  ),
  'albanian-to-english': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/albanian-to-english/${locale}.json`)
  ),
  'alien-text-generator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/alien-text-generator/${locale}.json`)
  ),
  'ancient-greek-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/ancient-greek-translator/${locale}.json`)
  ),
  'aramaic-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/aramaic-translator/${locale}.json`)
  ),
  auth: createLocaleLoader(
    (locale) => import(`../../messages/pages/auth/${locale}.json`)
  ),
  'baby-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/baby-translator/${locale}.json`)
  ),
  'bad-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/bad-translator/${locale}.json`)
  ),
  'baybayin-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/baybayin-translator/${locale}.json`)
  ),
  blog: createLocaleLoader(
    (locale) => import(`../../messages/pages/blog/${locale}.json`)
  ),
  'cantonese-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/cantonese-translator/${locale}.json`)
  ),
  'chinese-to-english-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/chinese-to-english-translator/${locale}.json`
      )
  ),
  'creole-to-english-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/creole-to-english-translator/${locale}.json`)
  ),
  'cuneiform-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/cuneiform-translator/${locale}.json`)
  ),
  docs: createLocaleLoader(
    (locale) => import(`../../messages/pages/docs/${locale}.json`)
  ),
  'dog-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/dog-translator/${locale}.json`)
  ),
  'drow-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/drow-translator/${locale}.json`)
  ),
  'dumb-it-down-ai': createLocaleLoader(
    (locale) => import(`../../messages/pages/dumb-it-down-ai/${locale}.json`)
  ),
  'english-to-amharic-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/english-to-amharic-translator/${locale}.json`
      )
  ),
  'english-to-chinese-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/english-to-chinese-translator/${locale}.json`
      )
  ),
  'english-to-persian-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/english-to-persian-translator/${locale}.json`
      )
  ),
  'english-to-polish-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/english-to-polish-translator/${locale}.json`)
  ),
  'english-to-swahili-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/english-to-swahili-translator/${locale}.json`
      )
  ),
  'esperanto-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/esperanto-translator/${locale}.json`)
  ),
  'gaster-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/gaster-translator/${locale}.json`)
  ),
  'gen-alpha-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/gen-alpha-translator/${locale}.json`)
  ),
  'gen-z-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/gen-z-translator/${locale}.json`)
  ),
  'gibberish-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/gibberish-translator/${locale}.json`)
  ),
  'greek-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/greek-translator/${locale}.json`)
  ),
  'high-valyrian-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/high-valyrian-translator/${locale}.json`)
  ),
  home: createLocaleLoader(
    (locale) => import(`../../messages/pages/home/${locale}.json`)
  ),
  'ivr-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/ivr-translator/${locale}.json`)
  ),
  'japanese-to-english-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/japanese-to-english-translator/${locale}.json`
      )
  ),
  'mandalorian-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/mandalorian-translator/${locale}.json`)
  ),
  'manga-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/manga-translator/${locale}.json`)
  ),
  'middle-english-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/middle-english-translator/${locale}.json`)
  ),
  'minion-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/minion-translator/${locale}.json`)
  ),
  'nahuatl-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/nahuatl-translator/${locale}.json`)
  ),
  'ogham-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/ogham-translator/${locale}.json`)
  ),
  'pig-latin-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/pig-latin-translator/${locale}.json`)
  ),
  pricing: createLocaleLoader(
    (locale) => import(`../../messages/pages/pricing/${locale}.json`)
  ),
  'rune-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/rune-translator/${locale}.json`)
  ),
  'runic-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/runic-translator/${locale}.json`)
  ),
  'samoan-to-english-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/samoan-to-english-translator/${locale}.json`)
  ),
  'swahili-to-english-translator': createLocaleLoader(
    (locale) =>
      import(
        `../../messages/pages/swahili-to-english-translator/${locale}.json`
      )
  ),
  'telugu-to-english-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/telugu-to-english-translator/${locale}.json`)
  ),
  'verbose-generator': createLocaleLoader(
    (locale) => import(`../../messages/pages/verbose-generator/${locale}.json`)
  ),
  'wingdings-translator': createLocaleLoader(
    (locale) =>
      import(`../../messages/pages/wingdings-translator/${locale}.json`)
  ),
  'yoda-translator': createLocaleLoader(
    (locale) => import(`../../messages/pages/yoda-translator/${locale}.json`)
  ),
  dashboard: createLocaleLoader(
    (locale) => import(`../../messages/dashboard/${locale}.json`)
  ),
};

const ROUTE_ALIASES: Record<string, keyof typeof ROUTE_LOADERS> = {
  admin: 'dashboard',
  payment: 'dashboard',
  settings: 'dashboard',
};

// 翻译器页面工具名称到路由键的映射表
const TRANSLATOR_TOOL_TO_ROUTE: Record<string, string> = {
  'AlBhedTranslatorPage': 'al-bhed-translator',
  'AlbanianToEnglishPage': 'albanian-to-english',
  'AlienTextGeneratorPage': 'alien-text-generator',
  'AncientGreekTranslatorPage': 'ancient-greek-translator',
  'AramaicTranslatorPage': 'aramaic-translator',
  'BabyTranslatorPage': 'baby-translator',
  'BadTranslatorPage': 'bad-translator',
  'BaybayinTranslatorPage': 'baybayin-translator',
  'ChineseToEnglishTranslatorPage': 'chinese-to-english-translator',
  'CreoleToEnglishTranslatorPage': 'creole-to-english-translator',
  'CuneiformTranslatorPage': 'cuneiform-translator',
  'DrowTranslatorPage': 'drow-translator',
  'DumbItDownPage': 'dumb-it-down-ai',
  'EnglishToAmharicTranslatorPage': 'english-to-amharic-translator',
  'EnglishToChineseTranslatorPage': 'english-to-chinese-translator',
  'EnglishToPersianTranslatorPage': 'english-to-persian-translator',
  'EnglishToPolishTranslatorPage': 'english-to-polish-translator',
  'EnglishToSwahiliTranslatorPage': 'english-to-swahili-translator',
  'EsperantoTranslatorPage': 'esperanto-translator',
  'GasterTranslatorPage': 'gaster-translator',
  'GenAlphaTranslatorPage': 'gen-alpha-translator',
  'GenZTranslatorPage': 'gen-z-translator',
  'GibberishTranslatorPage': 'gibberish-translator',
  'GreekTranslatorPage': 'greek-translator',
  'HighValyrianTranslatorPage': 'high-valyrian-translator',
  'IvrTranslatorPage': 'ivr-translator',
  'JapaneseToEnglishTranslatorPage': 'japanese-to-english-translator',
  'MandalorianTranslatorPage': 'mandalorian-translator',
  'MangaTranslatorPage': 'manga-translator',
  'MiddleEnglishTranslatorPage': 'middle-english-translator',
  'MinionTranslatorPage': 'minion-translator',
  'NahuatlTranslatorPage': 'nahuatl-translator',
  'OghamTranslatorPage': 'ogham-translator',
  'PigLatinTranslatorPage': 'pig-latin-translator',
  'RuneTranslatorPage': 'rune-translator',
  'RunicTranslatorPage': 'runic-translator',
  'SamoanToEnglishTranslatorPage': 'samoan-to-english-translator',
  'SwahiliToEnglishTranslatorPage': 'swahili-to-english-translator',
  'TeluguToEnglishTranslatorPage': 'telugu-to-english-translator',
  'VerboseGeneratorPage': 'verbose-generator',
  'WingdingsTranslatorPage': 'wingdings-translator',
  'YodaTranslatorPage': 'yoda-translator',
  'CantoneseTranslatorPage': 'cantonese-translator',
};

/**
 * 热门翻译器列表（按访问频率排序）
 * 用于按需加载策略中的热门内容预加载
 */
const POPULAR_TRANSLATORS = [
  'minion-translator',
  'mandalorian-translator',
  'gen-z-translator',
  'gen-alpha-translator',
  'bad-translator',
  'gibberish-translator',
  'yoda-translator',
  'pig-latin-translator',
  'ancient-greek-translator',
  'chinese-to-english-translator',
  'english-to-chinese-translator',
  'cantonese-translator'
];

function loadBaseForLocale(locale: Locale): Promise<MessageModule[]> {
  return loadFromLoaders(locale, [LOCALE_ROOT_LOADER]);
}

function loadCommonForLocale(locale: Locale): Promise<MessageModule[]> {
  return loadFromLoaders(locale, COMMON_LOADERS);
}

function loadRouteModulesForLocale(
  locale: Locale,
  keys: string[]
): Promise<MessageModule[]> {
  const loaders = keys
    .map((key) => ROUTE_LOADERS[key])
    .filter((loader): loader is MessageLoader => Boolean(loader));

  return loadFromLoaders(locale, loaders);
}

async function loadFromLoaders(
  locale: Locale,
  loaders: MessageLoader[]
): Promise<MessageModule[]> {
  if (!loaders.length) {
    return [];
  }

  const modules = await Promise.all(loaders.map((loader) => loader(locale)));
  return modules.filter((module): module is MessageModule =>
    Boolean(module)
  ) as MessageModule[];
}

/**
 * 智能翻译器加载器：根据工具名称或路由键加载对应的翻译文件
 */
async function loadTranslatorMessages(
  locale: Locale,
  translatorKey?: string,
  routeKey?: string
): Promise<MessageModule[]> {
  if (!translatorKey && !routeKey) {
    return [];
  }

  let targetRouteKey = routeKey;

  // 如果提供了工具名称，转换为路由键
  if (translatorKey && TRANSLATOR_TOOL_TO_ROUTE[translatorKey]) {
    targetRouteKey = TRANSLATOR_TOOL_TO_ROUTE[translatorKey];
  }

  if (!targetRouteKey || !ROUTE_LOADERS[targetRouteKey]) {
    console.warn(`⚠️ [loadTranslatorMessages] No route loader found for translator: ${translatorKey || routeKey}`);
    return [];
  }

  try {
    const messages = await ROUTE_LOADERS[targetRouteKey](locale);
    if (messages) {
      console.log(`✅ [loadTranslatorMessages] Loaded translator: ${targetRouteKey}`);
      return [messages];
    }
    return [];
  } catch (error) {
    console.warn(`⚠️ [loadTranslatorMessages] Failed to load translator ${targetRouteKey}:`, error);
    return [];
  }
}

/**
 * 加载热门翻译器消息（并发加载以提高性能）
 */
async function loadPopularTranslatorMessages(locale: Locale): Promise<MessageModule[]> {
  console.log('🔥 [loadPopularTranslatorMessages] Loading popular translators...');

  const translatorPromises = POPULAR_TRANSLATORS.map(async (routeKey) => {
    try {
      const messages = await ROUTE_LOADERS[routeKey]?.(locale);
      if (messages) {
        console.log(`✅ [loadPopularTranslatorMessages] Popular translator loaded: ${routeKey}`);
        return messages;
      }
      return null;
    } catch (error) {
      console.warn(`⚠️ [loadPopularTranslatorMessages] Failed to load popular translator ${routeKey}:`, error);
      return null;
    }
  });

  const loadedTranslators = await Promise.all(translatorPromises);
  return loadedTranslators.filter((module): module is MessageModule => Boolean(module));
}

function normalizeRouteKey(value: string): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^pages\//, '')
    .split('/')[0];

  if (!cleaned) {
    return 'home';
  }

  const alias = ROUTE_ALIASES[cleaned] ?? cleaned;
  return alias in ROUTE_LOADERS ? alias : null;
}

function resolveRouteKeysFromPathname(
  pathname: string | undefined,
  locale: Locale
): string[] {
  if (!pathname) {
    return ['home'];
  }

  const sanitized = pathname.split('?')[0]?.split('#')[0] ?? '';
  if (!sanitized || sanitized === '/') {
    return ['home'];
  }

  const segments = sanitized.split('/').filter(Boolean);
  if (!segments.length) {
    return ['home'];
  }

  if (segments[0] === locale) {
    segments.shift();
  }

  if (!segments.length) {
    return ['home'];
  }

  const key = normalizeRouteKey(segments[0]);
  return key ? [key] : [];
}

function resolveRouteKeys(
  locale: Locale,
  options: Pick<GetMessagesOptions, 'pathname' | 'modules'>
): string[] {
  const keys = new Set<string>();

  if (options.modules?.length) {
    for (const value of options.modules) {
      const key = normalizeRouteKey(value);
      if (key) {
        keys.add(key);
      }
    }
  }

  resolveRouteKeysFromPathname(options.pathname, locale).forEach((key) =>
    keys.add(key)
  );

  return Array.from(keys);
}

async function loadAllMessagesForLocale(locale: Locale): Promise<Messages> {
  const parts: MessageModule[] = [];

  parts.push(...(await loadBaseForLocale(locale)));
  parts.push(...(await loadCommonForLocale(locale)));

  const routeModules = await Promise.all(
    Object.keys(ROUTE_LOADERS).map((key) => ROUTE_LOADERS[key](locale))
  );

  routeModules.forEach((module) => {
    if (module) {
      parts.push(module);
    }
  });

  // 使用简单的对象合并，避免 deepmerge 的复杂性和潜在问题
  if (!parts.length) {
    return {} as Messages;
  }

  const result: Messages = {};
  for (const part of parts) {
    if (part && typeof part === 'object') {
      Object.assign(result, part);
    }
  }
  return result;
}

export async function getMessagesForLocale(
  locale: Locale,
  options: GetMessagesOptions = {}
): Promise<Messages> {
  const { includeCommon = true, translatorKey, includePopularTranslators = false } = options;
  const defaultLocale = routing.defaultLocale;

  console.log('🔍 [getMessagesForLocale] Starting optimized loading with options:', {
    locale,
    translatorKey,
    includePopularTranslators,
    pathname: options.pathname
  });

  const parts: MessageModule[] = [];

  // 策略1: 特定翻译器页面按需加载（最高优先级）
  if (translatorKey) {
    console.log(`🎯 [getMessagesForLocale] Loading specific translator: ${translatorKey}`);

    // 加载基础翻译
    if (locale !== defaultLocale) {
      parts.push(...(await loadBaseForLocale(defaultLocale)));
    }
    parts.push(...(await loadBaseForLocale(locale)));

    // 加载通用翻译
    if (includeCommon) {
      if (locale !== defaultLocale) {
        parts.push(...(await loadCommonForLocale(defaultLocale)));
      }
      parts.push(...(await loadCommonForLocale(locale)));
    }

    // 加载特定翻译器
    const translatorMessages = await loadTranslatorMessages(locale, translatorKey);
    parts.push(...translatorMessages);

    if (locale !== defaultLocale) {
      const fallbackTranslatorMessages = await loadTranslatorMessages(defaultLocale, translatorKey);
      parts.push(...fallbackTranslatorMessages);
    }

    console.log(`✅ [getMessagesForLocale] Loaded ${parts.length} parts for ${translatorKey}`);
  }
  // 策略2: 基础加载（不包含翻译器，用于首页和非工具页面）
  else {
    console.log('📁 [getMessagesForLocale] Loading base messages only');

    // 加载基础翻译
    if (locale !== defaultLocale) {
      parts.push(...(await loadBaseForLocale(defaultLocale)));
    }
    parts.push(...(await loadBaseForLocale(locale)));

    // 加载通用翻译
    if (includeCommon) {
      if (locale !== defaultLocale) {
        parts.push(...(await loadCommonForLocale(defaultLocale)));
      }
      parts.push(...(await loadCommonForLocale(locale)));
    }

    // 可选：热门翻译器预加载（已默认关闭，提高性能）
    if (includePopularTranslators && !options.pathname?.includes('-translator')) {
      const popularTranslators = await loadPopularTranslatorMessages(locale);
      parts.push(...popularTranslators);

      if (locale !== defaultLocale) {
        const fallbackPopularTranslators = await loadPopularTranslatorMessages(defaultLocale);
        parts.push(...fallbackPopularTranslators);
      }

      console.log(`🔥 [getMessagesForLocale] Added ${popularTranslators.length} popular translators`);
    }

    console.log(`✅ [getMessagesForLocale] Loaded ${parts.length} base parts`);
  }

  // 简单的对象合并
  const validParts = parts.filter(part => part && typeof part === 'object');
  if (!validParts.length) {
    console.warn('⚠️ [getMessagesForLocale] No valid parts loaded');
    return {} as Messages;
  }

  const result: Messages = {};
  for (const part of validParts) {
    Object.assign(result, part);
  }

  const loadedKeys = Object.keys(result).filter(k => k.includes('Translator') || k.includes('Page'));
  console.log(`✅ [getMessagesForLocale] Final result: ${loadedKeys.length} translation keys loaded`);

  return result;
}

let defaultMessagesCache: Messages | null = null;

export const getDefaultMessages = async (): Promise<Messages> => {
  if (!defaultMessagesCache) {
    defaultMessagesCache = await loadAllMessagesForLocale(
      routing.defaultLocale
    );
  }
  return defaultMessagesCache;
};

export const defaultMessages = getDefaultMessages();

export type { GetMessagesOptions };
