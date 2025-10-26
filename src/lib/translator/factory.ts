import type { TranslationTool } from './types';
import { ChineseEnglishTranslator } from './translators/chinese-english';
import { SwahiliEnglishTranslator } from './translators/swahili-english';
import { EsperantoTranslator } from './translators/esperanto';
import { AlbanianEnglishTranslator } from './translators/albanian-english';
import { JapaneseEnglishTranslator } from './translators/japanese-english';
import { GreekEnglishTranslator } from './translators/greek-english';
import { EnglishPolishTranslator } from './translators/english-polish';

// 翻译器注册表
type TranslatorClass = new () => any;
const translatorRegistry = new Map<string, TranslatorClass>();

// 注册翻译器
export function registerTranslator(toolId: string, translatorClass: TranslatorClass): void {
  translatorRegistry.set(toolId, translatorClass);
}

// 获取翻译器实例
export function getTranslator(toolId: string): any {
  const TranslatorClass = translatorRegistry.get(toolId);
  if (!TranslatorClass) {
    throw new Error(`Translator not found: ${toolId}`);
  }
  return new TranslatorClass();
}

// 获取所有可用工具
export function getAvailableTools(): TranslationTool[] {
  const tools: TranslationTool[] = [];

  translatorRegistry.forEach((TranslatorClass, toolId) => {
    try {
      const instance = new TranslatorClass();
      tools.push(instance.config.tool);
    } catch (error) {
      console.error(`Failed to get tool info for ${toolId}:`, error);
    }
  });

  return tools;
}

// 检查工具是否存在
export function hasTranslator(toolId: string): boolean {
  return translatorRegistry.has(toolId);
}

// 初始化所有翻译器
export function initializeTranslators(): void {
  // 注册语言翻译器
  registerTranslator('chinese-english', ChineseEnglishTranslator);
  registerTranslator('swahili-english', SwahiliEnglishTranslator);
  registerTranslator('esperanto', EsperantoTranslator);
  registerTranslator('albanian-english', AlbanianEnglishTranslator);
  registerTranslator('japanese-english', JapaneseEnglishTranslator);
  registerTranslator('greek-english', GreekEnglishTranslator);
  registerTranslator('english-polish', EnglishPolishTranslator);

  // TODO: 添加更多翻译器
  // registerTranslator('telugu-english', TeluguEnglishTranslator);
  // registerTranslator('cantonese-english', CantoneseEnglishTranslator);
  // registerTranslator('creole-english', CreoleEnglishTranslator);
  // ...
}

// 按类别分组的工具
export function getToolsByCategory(): Record<string, TranslationTool[]> {
  const tools = getAvailableTools();
  const categorized: Record<string, TranslationTool[]> = {
    language: [],
    fictional: [],
    stylistic: [],
  };

  tools.forEach(tool => {
    categorized[tool.type].push(tool);
  });

  return categorized;
}

// 搜索工具
export function searchTools(query: string): TranslationTool[] {
  const tools = getAvailableTools();
  const lowerQuery = query.toLowerCase();

  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.id.toLowerCase().includes(lowerQuery)
  );
}