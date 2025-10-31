/**
 * 语音播放缓存管理器
 * 优化重复播放的性能，减少语音合成的重复计算
 */

import type { SpeechOptions } from './speech-manager';

interface CacheEntry {
  audioUrl?: string;
  blob?: Blob;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  duration?: number;
}

interface SpeechCacheOptions {
  maxEntries?: number;
  maxAge?: number; // 毫秒
  maxStorageSize?: number; // 字节
}

class SpeechCache {
  private cache = new Map<string, CacheEntry>();
  private storageKey = 'vibetrans-speech-cache';
  private options: Required<SpeechCacheOptions>;

  constructor(options: SpeechCacheOptions = {}) {
    this.options = {
      maxEntries: options.maxEntries || 50,
      maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24小时
      maxStorageSize: options.maxStorageSize || 10 * 1024 * 1024, // 10MB
    };

    // 初始化时从localStorage恢复缓存元数据
    this.loadCacheMetadata();
  }

  /**
   * 生成缓存键
   */
  private generateKey(text: string, options: SpeechOptions): string {
    const keyData = {
      text: text.trim().toLowerCase(),
      lang: options.lang || 'en-US',
      pitch: options.pitch || 1,
      rate: options.rate || 1,
      volume: options.volume || 1,
      emotion: options.emotion || 'neutral',
    };

    return btoa(JSON.stringify(keyData));
  }

  /**
   * 保存缓存元数据到localStorage
   */
  private saveCacheMetadata(): void {
    try {
      const metadata = Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        duration: entry.duration,
        hasBlob: !!entry.blob,
      }));

      localStorage.setItem(this.storageKey, JSON.stringify(metadata));
    } catch (error) {
      // localStorage可能已满
      console.warn('Failed to save speech cache metadata:', error);
    }
  }

  /**
   * 从localStorage加载缓存元数据
   */
  private loadCacheMetadata(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return;

      const metadata = JSON.parse(data);
      const now = Date.now();

      for (const item of metadata) {
        // 检查是否过期
        if (now - item.timestamp > this.options.maxAge) {
          continue;
        }

        this.cache.set(item.key, {
          timestamp: item.timestamp,
          accessCount: item.accessCount,
          lastAccessed: item.lastAccessed,
          duration: item.duration,
          // 注意：blob数据不存储在localStorage中，只存储元数据
        });
      }
    } catch (error) {
      console.warn('Failed to load speech cache metadata:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.options.maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      this.saveCacheMetadata();
    }
  }

  /**
   * LRU清理 - 移除最少使用的条目
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 检查缓存大小限制
   */
  private checkSizeLimit(): void {
    // 清理过期条目
    this.cleanup();

    // 检查条目数量限制
    while (this.cache.size >= this.options.maxEntries) {
      this.evictLRU();
    }
  }

  /**
   * 获取缓存条目
   */
  get(text: string, options: SpeechOptions): CacheEntry | null {
    const key = this.generateKey(text, options);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > this.options.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    entry.lastAccessed = now;
    entry.accessCount++;

    return entry;
  }

  /**
   * 设置缓存条目
   */
  set(text: string, options: SpeechOptions, data: Partial<CacheEntry>): void {
    const key = this.generateKey(text, options);

    this.checkSizeLimit();

    const entry: CacheEntry = {
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ...data,
    };

    this.cache.set(key, entry);
    this.saveCacheMetadata();
  }

  /**
   * 删除缓存条目
   */
  delete(text: string, options: SpeechOptions): boolean {
    const key = this.generateKey(text, options);
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.saveCacheMetadata();
    }

    return deleted;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear speech cache from localStorage:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    totalAccesses: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    if (this.cache.size === 0) {
      return {
        size: 0,
        totalAccesses: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }

    let totalAccesses = 0;
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      oldestTime = Math.min(oldestTime, entry.timestamp);
      newestTime = Math.max(newestTime, entry.timestamp);
    }

    return {
      size: this.cache.size,
      totalAccesses,
      oldestEntry: oldestTime,
      newestEntry: newestTime,
    };
  }

  /**
   * 预热缓存 - 批量添加常用文本
   */
  async warmUp(
    commonTexts: string[],
    options: SpeechOptions = {}
  ): Promise<void> {
    // 这里可以添加逻辑来预先生成常用文本的语音
    // 由于Web Speech API的限制，这里只是示例
    console.log(
      'Speech cache warm-up initiated for',
      commonTexts.length,
      'texts'
    );
  }
}

// 全局缓存实例
export const speechCache = new SpeechCache({
  maxEntries: 30,
  maxAge: 12 * 60 * 60 * 1000, // 12小时
  maxStorageSize: 5 * 1024 * 1024, // 5MB
});

// 错误处理工具
export class SpeechErrorHandler {
  private errorCounts = new Map<string, number>();
  private maxRetries = 3;
  private retryDelay = 1000; // 1秒

  /**
   * 处理语音播放错误
   */
  async handleError(
    error: Error,
    context: {
      text: string;
      options: SpeechOptions;
      retryAttempt?: number;
    }
  ): Promise<{
    shouldRetry: boolean;
    delay?: number;
    fallbackAction?: 'useDefaultVoice' | 'useSimplifiedText' | 'skip';
  }> {
    const errorKey = `${error.name}:${context.text.substring(0, 50)}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    const retryAttempt = context.retryAttempt || 0;

    // 记录错误
    this.errorCounts.set(errorKey, currentCount + 1);

    // 根据错误类型决定处理策略
    if (error.name === 'NetworkError') {
      return {
        shouldRetry: retryAttempt < this.maxRetries,
        delay: this.retryDelay * Math.pow(2, retryAttempt), // 指数退避
      };
    }

    if (error.message.includes('voice not found')) {
      return {
        shouldRetry: false,
        fallbackAction: 'useDefaultVoice',
      };
    }

    if (error.message.includes('text too long')) {
      return {
        shouldRetry: false,
        fallbackAction: 'useSimplifiedText',
      };
    }

    // 默认策略：重试一次
    return {
      shouldRetry: retryAttempt === 0,
      delay: 500,
    };
  }

  /**
   * 重置错误计数
   */
  resetErrorCounts(): void {
    this.errorCounts.clear();
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Array<{ error: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const speechErrorHandler = new SpeechErrorHandler();
