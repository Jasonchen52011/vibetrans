/**
 * 翻译服务统一入口
 */

import { GeminiTranslatorBase } from './gemini-translator-base';
import { getAllTranslators, getTranslatorConfig } from './translator-configs';
import type {
  TranslationRequest,
  TranslationResult,
  TranslatorConfig,
} from './types';

export class TranslationService {
  private static instances: Map<string, GeminiTranslatorBase> = new Map();

  /**
   * 获取翻译器实例（单例模式）
   */
  private static getTranslatorInstance(
    config: TranslatorConfig
  ): GeminiTranslatorBase {
    if (!this.instances.has(config.id)) {
      this.instances.set(config.id, new GeminiTranslatorBase(config));
    }
    return this.instances.get(config.id)!;
  }

  /**
   * 执行翻译
   */
  static async translate(
    request: TranslationRequest
  ): Promise<TranslationResult> {
    const config = getTranslatorConfig(request.translator);
    if (!config) {
      return {
        success: false,
        error: `Unknown translator: ${request.translator}`,
        original: request.text,
        mode: request.mode || 'general',
        translator: request.translator,
      };
    }

    try {
      const translator = this.getTranslatorInstance(config);
      return await translator.translate(request, config);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Translation service error',
        original: request.text,
        mode: request.mode || 'general',
        translator: request.translator,
      };
    }
  }

  /**
   * 获取所有可用的翻译器
   */
  static getAvailableTranslators(): TranslatorConfig[] {
    return getAllTranslators();
  }

  /**
   * 检查翻译器健康状态
   */
  static async healthCheck(translatorId?: string): Promise<any> {
    if (translatorId) {
      const config = getTranslatorConfig(translatorId);
      if (!config) {
        return {
          status: 'error',
          message: `Unknown translator: ${translatorId}`,
        };
      }

      try {
        const translator = this.getTranslatorInstance(config);
        return await translator.healthCheck();
      } catch (error) {
        return {
          status: 'error',
          message: `Health check failed: ${error.message}`,
        };
      }
    }

    // 检查所有翻译器
    const results: Record<string, any> = {};
    const translators = getAllTranslators();

    for (const config of translators) {
      try {
        const translator = this.getTranslatorInstance(config);
        results[config.id] = await translator.healthCheck();
      } catch (error) {
        results[config.id] = {
          status: 'error',
          message: `Health check failed: ${error.message}`,
        };
      }
    }

    return {
      status: 'overall',
      translators: results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 清理所有翻译器实例
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
