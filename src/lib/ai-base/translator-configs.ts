/**
 * 翻译器配置管理
 */
import type { TranslatorConfig } from './types';

// 粤语翻译器配置
export const cantoneseTranslatorConfig: TranslatorConfig = {
  id: 'cantonese-translator',
  name: 'Cantonese Translator',
  type: 'ai',
  bidirectional: true,
  supportedDirections: ['yue-to-en', 'en-to-yue'],
  defaultDirection: 'yue-to-en',
  languageDetection: true,
  defaultMode: 'general',
  supportedModes: {
    general: {
      prompt:
        'You are a professional Cantonese-English translator. Translate accurately while preserving cultural context and meaning.',
      temperature: 0.3,
      maxTokens: 2048,
    },
    formal: {
      prompt:
        'You are a professional translator specializing in formal Cantonese-English translation. Use appropriate formal language and honorifics.',
      temperature: 0.2,
      maxTokens: 2048,
    },
    casual: {
      prompt:
        'You are a native Cantonese speaker. Translate the following text in a natural, conversational way that captures the authentic tone.',
      temperature: 0.7,
      maxTokens: 2048,
    },
  },
  creditCost: 5,
};

// 日语翻译器配置
export const japaneseTranslatorConfig: TranslatorConfig = {
  id: 'japanese-to-english-translator',
  name: 'Japanese-English Translator',
  type: 'ai',
  bidirectional: true,
  supportedDirections: ['ja-to-en', 'en-to-ja'],
  defaultDirection: 'ja-to-en',
  languageDetection: true,
  defaultMode: 'general',
  supportedModes: {
    general: {
      prompt:
        'You are a professional Japanese-English translator. Translate accurately while preserving cultural context and nuances. Handle both polite and casual forms appropriately.',
      temperature: 0.4,
      maxTokens: 2048,
    },
    business: {
      prompt:
        'You are a business translator specializing in Japanese-English corporate communication. Use appropriate keigo (honorific language) and business terminology.',
      temperature: 0.2,
      maxTokens: 2048,
    },
    literary: {
      prompt:
        'You are a literary translator specializing in Japanese-English literature and poetry. Preserve the artistic style, metaphors, and cultural references.',
      temperature: 0.6,
      maxTokens: 4096,
    },
    technical: {
      prompt:
        'You are a technical translator specializing in Japanese-English documents. Translate with precise technical terminology and maintain clarity.',
      temperature: 0.1,
      maxTokens: 4096,
    },
    casual: {
      prompt:
        'You are a native Japanese speaker. Translate the following text in a natural, conversational way that young Japanese people would use.',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },
  customProcessing: {
    postProcess: (text: string) => {
      // 清理多余的空格和格式
      return text.replace(/\s+/g, ' ').trim();
    },
  },
  creditCost: 5,
};

// 中文翻译器配置
export const chineseTranslatorConfig: TranslatorConfig = {
  id: 'chinese-english-translator',
  name: 'Chinese-English Translator',
  type: 'ai',
  bidirectional: true,
  supportedDirections: ['zh-to-en', 'en-to-zh'],
  defaultDirection: 'zh-to-en',
  languageDetection: true,
  defaultMode: 'general',
  supportedModes: {
    technical: {
      prompt: `You are a professional technical translator specializing in Chinese-English technical translation. Focus on technical terminology accuracy and industry-specific jargon.`,
      zhToEnPrompt: `You are a professional technical translator specializing in Chinese to English translation. Focus on: - Technical terminology accuracy - Industry-specific jargon - Clear, precise language - Maintaining technical context - Software, hardware, and engineering terms - Scientific and mathematical expressions

Translate the following Chinese text to English with technical precision. Provide only the direct translation without explanations or alternatives:`,
      enToZhPrompt: `You are a professional technical translator specializing in English to Chinese translation. Focus on: - Technical terminology accuracy - Industry-specific jargon - Clear, precise language - Maintaining technical context - Software, hardware, and engineering terms - Scientific and mathematical expressions Translate the following English text to Chinese with technical precision:`,
      temperature: 0.1,
      maxTokens: 4096,
    },
    legal: {
      prompt: `You are a certified legal translator specializing in Chinese-English legal document translation. Focus on legal terminology precision and formal language structure.`,
      zhToEnPrompt: `You are a certified legal translator specializing in Chinese to English legal document translation. Focus on: - Legal terminology precision - Formal legal language structure - Contract and statute terminology - Preserving legal meaning and intent - Court and regulatory language - Maintaining legal formality Translate the following Chinese legal text to English with legal accuracy:`,
      enToZhPrompt: `You are a certified legal translator specializing in English to Chinese legal document translation. Focus on: - Legal terminology precision - Formal legal language structure - Contract and statute terminology - Preserving legal meaning and intent - Court and regulatory language - Maintaining legal formality Translate the following English legal text to Chinese with legal accuracy:`,
      temperature: 0.2,
      maxTokens: 4096,
    },
    literary: {
      prompt: `You are a literary translator specializing in Chinese-English literary works. Focus on preserving cultural nuances and maintaining literary style.`,
      zhToEnPrompt: `You are a literary translator specializing in Chinese to English literary works. Focus on: - Preserving cultural nuances - Maintaining literary style and tone - Poetic and artistic expression - Character voice and narrative flow - Cultural references and idioms - Emotional and aesthetic impact Translate the following Chinese literary text to English while preserving its artistic essence:`,
      enToZhPrompt: `You are a literary translator specializing in English to Chinese literary works. Focus on: - Preserving cultural nuances - Maintaining literary style and tone - Poetic and artistic expression - Character voice and narrative flow - Cultural references and idioms - Emotional and aesthetic impact Translate the following English literary text to Chinese while preserving its artistic essence:`,
      temperature: 0.6,
      maxTokens: 4096,
    },
    idioms: {
      prompt: `You are a cultural linguistics expert specializing in Chinese-English idioms, slang, and colloquial expressions. Focus on cultural context and explanations.`,
      zhToEnPrompt: `You are a cultural linguistics expert specializing in Chinese idioms, slang, and colloquial expressions. Focus on: - Chinese idioms (成语) and their meanings - Modern slang and internet language - Cultural context and explanations - Equivalent English expressions - Regional dialects and variations - Providing both literal and contextual translations Translate the following Chinese text to English, explaining idioms and slang:`,
      enToZhPrompt: `You are a cultural linguistics expert specializing in English idioms, slang, and colloquial expressions. Focus on: - English idioms and their meanings - Modern slang and internet language - Cultural context and explanations - Equivalent Chinese expressions - Regional dialects and variations - Providing both literal and contextual translations Translate the following English text to Chinese, explaining idioms and slang:`,
      temperature: 0.7,
      maxTokens: 2048,
    },
    general: {
      prompt: `You are a professional Chinese-English translator. Translate accurately while preserving cultural context and meaning.`,
      zhToEnPrompt: `You are a professional Chinese to English translator. Translate the text directly without any explanations or instructions. Translate the following Chinese text to English:`,
      enToZhPrompt: `You are a professional English to Chinese translator. Translate the text directly without any explanations or instructions. Only output the Chinese translation. Translate the following English text to Chinese:`,
      temperature: 0.3,
      maxTokens: 2048,
    },
  },
  multimodal: {
    supportsImage: true,
    supportsAudio: true,
    imageProcessingPrompt:
      'First, extract all {sourceLanguage} text from this image (menu, sign, comic, document, etc.). Then, {systemPrompt}',
    audioProcessingPrompt:
      'Listen to this {sourceLanguage} audio and: 1. Transcribe the {sourceLanguage} speech to text 2. {systemPrompt}',
    responseFormat:
      '[EXTRACTED TEXT]\n({sourceLanguage} text from the image)\n\n[TRANSLATION]\n({targetLanguage} translation based on the {modeName} style)\n\n[CONTEXT]\n(Brief explanation of any cultural references or special terms if applicable)',
  },
  creditCost: 5,
};

// 阿尔巴尼亚语翻译器配置
export const albanianTranslatorConfig: TranslatorConfig = {
  id: 'albanian-to-english-translator',
  name: 'Albanian-English Translator',
  type: 'ai',
  bidirectional: true,
  supportedDirections: ['sq-to-en', 'en-to-sq'],
  defaultDirection: 'sq-to-en',
  languageDetection: true,
  defaultMode: 'general',
  supportedModes: {
    general: {
      zhToEnPrompt: `You are a professional Albanian to English translator. Translate the following Albanian text to English accurately while preserving cultural context and meaning: Translate the following Albanian text to English:`,
      enToZhPrompt: `You are a professional English to Albanian translator. Translate the following English text to Albanian accurately while preserving cultural context and meaning: Translate the following English text to Albanian:`,
      temperature: 0.3,
      maxTokens: 2048,
    },
  },
  creditCost: 5,
};

// 配置注册表
export const translatorConfigs: Record<string, TranslatorConfig> = {
  'cantonese-translator': cantoneseTranslatorConfig,
  'japanese-to-english-translator': japaneseTranslatorConfig,
  'chinese-english-translator': chineseTranslatorConfig,
  'albanian-to-english-translator': albanianTranslatorConfig,
};

// 获取翻译器配置
export function getTranslatorConfig(id: string): TranslatorConfig | null {
  return translatorConfigs[id] || null;
}

// 获取所有翻译器列表
export function getAllTranslators(): TranslatorConfig[] {
  return Object.values(translatorConfigs);
}

// 添加新的翻译器配置
export function addTranslatorConfig(config: TranslatorConfig): void {
  translatorConfigs[config.id] = config;
}

// 移除翻译器配置
export function removeTranslatorConfig(id: string): boolean {
  if (translatorConfigs[id]) {
    delete translatorConfigs[id];
    return true;
  }
  return false;
}
