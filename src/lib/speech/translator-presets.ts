/**
 * 翻译器语音预设配置
 * 为不同的翻译器类型提供最佳的语音参数
 */

import type { SpeechOptions } from './speech-manager';

// 翻译器类型枚举
export enum TranslatorType {
  MINION = 'minion',
  MANDALORIAN = 'mandalorian',
  BABY = 'baby',
  DOG = 'dog',
  YODA = 'yoda',
  EVIL = 'evil',
  ALIEN = 'alien',
  ROBOT = 'robot',
  NORMAL = 'normal',
  ANCIENT = 'ancient',
  MYTHICAL = 'mythical',
  FUNNY = 'funny',
  CREATIVE = 'creative',
}

// 语音预设配置
const TRANSLATOR_PRESETS: Record<TranslatorType, SpeechOptions> = {
  // Minion - 高音调、快速、兴奋
  [TranslatorType.MINION]: {
    lang: 'en-US',
    pitch: 1.4,
    rate: 0.9,
    emotion: 'excited',
    volume: 0.9,
  },

  // Mandalorian - 低沉、缓慢、平静
  [TranslatorType.MANDALORIAN]: {
    lang: 'en-US',
    pitch: 0.7,
    rate: 0.8,
    emotion: 'calm',
    volume: 0.8,
  },

  // Baby - 高音调、可爱
  [TranslatorType.BABY]: {
    lang: 'en-US',
    pitch: 1.6,
    rate: 0.8,
    emotion: 'happy',
    volume: 0.8,
  },

  // Dog - 中等音调、快速
  [TranslatorType.DOG]: {
    lang: 'en-US',
    pitch: 1.1,
    rate: 1.1,
    emotion: 'happy',
    volume: 0.9,
  },

  // Yoda - 低音调、缓慢、智慧
  [TranslatorType.YODA]: {
    lang: 'en-US',
    pitch: 0.6,
    rate: 0.6,
    emotion: 'calm',
    volume: 0.9,
  },

  // Evil - 低沉、威胁
  [TranslatorType.EVIL]: {
    lang: 'en-US',
    pitch: 0.3,
    rate: 0.7,
    emotion: 'calm',
    volume: 0.7,
  },

  // Alien - 特殊音调
  [TranslatorType.ALIEN]: {
    lang: 'en-US',
    pitch: 1.2,
    rate: 1.0,
    emotion: 'neutral',
    volume: 0.8,
  },

  // Robot - 机械音调
  [TranslatorType.ROBOT]: {
    lang: 'en-US',
    pitch: 1.0,
    rate: 0.9,
    emotion: 'neutral',
    volume: 0.8,
  },

  // Normal - 标准语音
  [TranslatorType.NORMAL]: {
    lang: 'en-US',
    pitch: 1.0,
    rate: 1.0,
    emotion: 'neutral',
    volume: 1.0,
  },

  // Ancient - 庄重、缓慢
  [TranslatorType.ANCIENT]: {
    lang: 'en-US',
    pitch: 0.8,
    rate: 0.7,
    emotion: 'calm',
    volume: 0.9,
  },

  // Mythical - 神秘、中等音调
  [TranslatorType.MYTHICAL]: {
    lang: 'en-US',
    pitch: 0.9,
    rate: 0.8,
    emotion: 'calm',
    volume: 0.9,
  },

  // Funny - 轻快、高音调
  [TranslatorType.FUNNY]: {
    lang: 'en-US',
    pitch: 1.3,
    rate: 1.1,
    emotion: 'happy',
    volume: 0.9,
  },

  // Creative - 富有表现力
  [TranslatorType.CREATIVE]: {
    lang: 'en-US',
    pitch: 1.1,
    rate: 1.0,
    emotion: 'excited',
    volume: 0.9,
  },
};

// 文件路径到翻译器类型的映射
const FILENAME_PATTERNS: Record<string, TranslatorType> = {
  minion: TranslatorType.MINION,
  mandalorian: TranslatorType.MANDALORIAN,
  baby: TranslatorType.BABY,
  dog: TranslatorType.DOG,
  yoda: TranslatorType.YODA,
  evil: TranslatorType.EVIL,
  alien: TranslatorType.ALIEN,
  robot: TranslatorType.ROBOT,
  ancient: TranslatorType.ANCIENT,
  greek: TranslatorType.ANCIENT,
  rune: TranslatorType.MYTHICAL,
  runic: TranslatorType.MYTHICAL,
  ogham: TranslatorType.ANCIENT,
  cuneiform: TranslatorType.ANCIENT,
  hieroglyph: TranslatorType.ANCIENT,
  gibberish: TranslatorType.FUNNY,
  'pig-latin': TranslatorType.FUNNY,
  'gen-z': TranslatorType.FUNNY,
  'gen-alpha': TranslatorType.FUNNY,
  bad: TranslatorType.EVIL,
  verbose: TranslatorType.CREATIVE,
  dumb: TranslatorType.NORMAL,
  cantonese: TranslatorType.NORMAL,
  chinese: TranslatorType.NORMAL,
  japanese: TranslatorType.NORMAL,
  swahili: TranslatorType.NORMAL,
  telugu: TranslatorType.NORMAL,
  polish: TranslatorType.NORMAL,
  persian: TranslatorType.NORMAL,
  amharic: TranslatorType.NORMAL,
  albanian: TranslatorType.NORMAL,
  creole: TranslatorType.NORMAL,
  esperanto: TranslatorType.NORMAL,
  manga: TranslatorType.FUNNY,
  'middle-english': TranslatorType.ANCIENT,
  baybayin: TranslatorType.MYTHICAL,
  nahuatl: TranslatorType.ANCIENT,
  samoan: TranslatorType.NORMAL,
  drow: TranslatorType.EVIL,
  gaster: TranslatorType.EVIL,
  'high-valyrian': TranslatorType.MYTHICAL,
  ivr: TranslatorType.ROBOT,
  wingdings: TranslatorType.ROBOT,
  cuneiform: TranslatorType.ANCIENT,
};

/**
 * 根据文件路径自动检测翻译器类型
 */
export function detectTranslatorType(filePath: string): TranslatorType {
  const lowerPath = filePath.toLowerCase();

  // 检查文件路径中的关键词
  for (const [pattern, type] of Object.entries(FILENAME_PATTERNS)) {
    if (lowerPath.includes(pattern)) {
      return type;
    }
  }

  // 默认返回正常语音
  return TranslatorType.NORMAL;
}

/**
 * 根据翻译器类型获取语音预设
 */
export function getSpeechPreset(
  translatorType: TranslatorType,
  locale = 'en'
): SpeechOptions {
  const preset = TRANSLATOR_PRESETS[translatorType];

  // 根据locale调整语言
  const langCode =
    locale === 'zh'
      ? 'zh-CN'
      : locale === 'es'
        ? 'es-ES'
        : locale === 'fr'
          ? 'fr-FR'
          : locale === 'de'
            ? 'de-DE'
            : locale === 'ja'
              ? 'ja-JP'
              : 'en-US';

  return {
    ...preset,
    lang: langCode,
  };
}

/**
 * 从组件名称或文件路径获取语音预设
 */
export function getSpeechPresetFromContext(
  context: {
    filePath?: string;
    componentName?: string;
    tone?: string;
  },
  locale = 'en'
): SpeechOptions {
  // 优先级：tone参数 > 文件路径检测 > 默认

  // 1. 检查tone参数（向后兼容）
  if (context.tone === 'evil') {
    return getSpeechPreset(TranslatorType.EVIL, locale);
  }

  // 2. 根据文件路径检测
  if (context.filePath) {
    const detectedType = detectTranslatorType(context.filePath);
    return getSpeechPreset(detectedType, locale);
  }

  // 3. 根据组件名称检测
  if (context.componentName) {
    const detectedType = detectTranslatorType(context.componentName);
    return getSpeechPreset(detectedType, locale);
  }

  // 4. 默认预设
  return getSpeechPreset(TranslatorType.NORMAL, locale);
}

/**
 * 获取所有可用的翻译器类型
 */
export function getAllTranslatorTypes(): TranslatorType[] {
  return Object.values(TranslatorType);
}

/**
 * 获取翻译器类型的描述
 */
export function getTranslatorDescription(type: TranslatorType): string {
  const descriptions: Record<TranslatorType, string> = {
    [TranslatorType.MINION]: '高音调、快速、兴奋的小黄人语音',
    [TranslatorType.MANDALORIAN]: '低沉、缓慢、平静的曼达洛语音',
    [TranslatorType.BABY]: '高音调、可爱的婴儿语音',
    [TranslatorType.DOG]: '中等音调、快速的狗狗语音',
    [TranslatorType.YODA]: '低音调、缓慢、智慧的尤达语音',
    [TranslatorType.EVIL]: '低沉、威胁的邪恶语音',
    [TranslatorType.ALIEN]: '特殊音调的外星人语音',
    [TranslatorType.ROBOT]: '机械音调的机器人语音',
    [TranslatorType.NORMAL]: '标准自然语音',
    [TranslatorType.ANCIENT]: '庄重、缓慢的古老语音',
    [TranslatorType.MYTHICAL]: '神秘、中等音调的神话语音',
    [TranslatorType.FUNNY]: '轻快、高音调的有趣语音',
    [TranslatorType.CREATIVE]: '富有表现力的创意语音',
  };

  return descriptions[type] || descriptions[TranslatorType.NORMAL];
}

/**
 * 动态调整语音参数
 */
export function adjustSpeechOptions(
  baseOptions: SpeechOptions,
  adjustments: {
    pitch?: number;
    rate?: number;
    volume?: number;
    emotion?: SpeechOptions['emotion'];
  }
): SpeechOptions {
  return {
    ...baseOptions,
    ...adjustments,
  };
}
