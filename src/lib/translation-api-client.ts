/**
 * 翻译API客户端 - 彻底解决webpack翻译文件打包问题
 * 核心思路：完全移除翻译文件的bundle，运行时动态获取
 */

export interface TranslationData {
  [key: string]: any;
}

export interface TranslationAPIConfig {
  baseUrl: string;
  cacheMaxAge: number;
  retryAttempts: number;
  retryDelay: number;
}

class TranslationCache {
  private cache = new Map<string, { data: TranslationData; timestamp: number }>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 100, maxAge: number = 300000) { // 5分钟缓存
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  set(key: string, data: TranslationData): void {
    // LRU缓存策略
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): TranslationData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // 预加载常用翻译
  preload(translations: Array<{ key: string; data: TranslationData }>): void {
    translations.forEach(({ key, data }) => {
      this.set(key, data);
    });
  }
}

/**
 * 翻译API客户端
 */
export class TranslationAPIClient {
  private config: TranslationAPIConfig;
  private cache: TranslationCache;
  private pendingRequests = new Map<string, Promise<TranslationData>>();

  constructor(config: Partial<TranslationAPIConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api/translations',
      cacheMaxAge: config.cacheMaxAge || 300000, // 5分钟
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    this.cache = new TranslationCache(100, this.config.cacheMaxAge);
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(namespace: string, locale: string): string {
    return `${namespace}:${locale}`;
  }

  /**
   * 带重试的API请求
   */
  private async fetchWithRetry(
    url: string,
    attempts: number = 0
  ): Promise<TranslationData> {
    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempts < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.fetchWithRetry(url, attempts + 1);
      }
      throw error;
    }
  }

  /**
   * 获取翻译数据 - 核心方法
   */
  async getTranslation(
    namespace: string,
    locale: string = 'en'
  ): Promise<TranslationData> {
    const cacheKey = this.getCacheKey(namespace, locale);

    // 1. 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. 检查是否有正在进行的请求
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // 3. 发起新请求
    const url = `${this.config.baseUrl}/${namespace}/${locale}`;
    const request = this.fetchWithRetry(url)
      .then(data => {
        // 缓存结果
        this.cache.set(cacheKey, data);
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        console.error(`Failed to load translation for ${namespace}/${locale}:`, error);
        return this.getFallbackTranslation(namespace);
      });

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  /**
   * 获取回退翻译
   */
  private getFallbackTranslation(namespace: string): TranslationData {
    // 提供最基本的回退翻译
    const fallbacks: Record<string, TranslationData> = {
      'MinionTranslatorPage': {
        title: 'Minion Translator',
        description: 'Translate your text to Minion banana language',
        hero: {
          title: 'Best Minion Translator',
          description: 'Transform text into hilarious Minion language',
        },
        tool: {
          inputLabel: 'Normal Text',
          outputLabel: 'Minion Text',
          translateButton: 'Translate',
          inputPlaceholder: 'Enter text...',
          outputPlaceholder: 'Translation...',
        },
      },
      'DrowTranslatorPage': {
        title: 'Drow Translator',
        description: 'Translate between Drow and other languages',
        hero: {
          title: 'Best Drow Translator',
          description: 'Professional Drow language translation',
        },
        tool: {
          inputLabel: 'Input Text',
          outputLabel: 'Translated Text',
          translateButton: 'Translate',
          inputPlaceholder: 'Enter text...',
          outputPlaceholder: 'Translation...',
        },
      },
    };

    return fallbacks[namespace] || {
      title: 'Translation Tool',
      description: 'Professional translation service',
      hero: {
        title: 'AI Translation',
        description: 'Advanced AI-powered translation',
      },
      tool: {
        inputLabel: 'Input Text',
        outputLabel: 'Translation',
        translateButton: 'Translate',
        inputPlaceholder: 'Enter text...',
        outputPlaceholder: 'Translation...',
      },
    };
  }

  /**
   * 批量预加载翻译
   */
  async preloadTranslations(
    requests: Array<{ namespace: string; locale: string }>
  ): Promise<void> {
    const preloadPromises = requests.map(async ({ namespace, locale }) => {
      try {
        const translation = await this.getTranslation(namespace, locale);
        return { key: this.getCacheKey(namespace, locale), data: translation };
      } catch (error) {
        console.warn(`Failed to preload ${namespace}/${locale}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(preloadPromises);
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<{ key: string; data: TranslationData }> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    this.cache.preload(validResults);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.maxSize,
      maxAge: this.cache.maxAge,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// 默认实例
export const translationAPI = new TranslationAPIClient();

/**
 * 便捷的翻译获取Hook
 */
export async function getTranslation(
  namespace: string,
  locale: string = 'en'
): Promise<TranslationData> {
  return translationAPI.getTranslation(namespace, locale);
}

/**
 * 类型安全的翻译访问器
 */
export function createTranslationAccessor<T extends TranslationData>(
  data: T
): {
  <K extends keyof T>(key: K, params?: Record<string, any>): T[K];
  raw<K extends keyof T>(key: K): T[K];
} {
  return function <K extends keyof T>(key: K, params?: Record<string, any>) {
    const value = data[key];
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) =>
        params[param]?.toString() || match
      ) as T[K];
    }
    return value;
  } as any;
}