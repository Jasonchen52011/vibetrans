/**
 * English to Chinese Translator API - Gemini Flash 2.0版本
 * 专门用于Edge Function大小优化
 */

export const runtime = 'edge';

// 翻译请求类型
type TranslationRequest = {
  text: string;
  direction?: 'en-zh' | 'zh-en';
  mode?: 'general' | 'formal' | 'colloquial';
  enableDualTranslation?: boolean;
  detectOnly?: boolean;
};

// 翻译结果类型
type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage: string;
  detectedTargetLanguage: string;
  backTranslation?: string;
  direction: string;
  mode: string;
  confidence: number;
  autoDetected: boolean;
};

// 语言映射配置
const LANGUAGE_MAP: Record<
  'en-zh' | 'zh-en',
  { source: string; target: string }
> = {
  'en-zh': { source: 'English', target: 'Chinese' },
  'zh-en': { source: 'Chinese', target: 'English' },
};

// 翻译模式定义
const TRANSLATION_MODES = {
  general: {
    name: 'General Translation',
    enToZhPrompt: `Translate the following English text to Chinese. Provide accurate and natural-sounding translation that respects cultural context:`,
    zhToEnPrompt: `Translate the following Chinese text to English. Provide accurate and natural-sounding translation that respects cultural context:`,
  },
  formal: {
    name: 'Formal Translation',
    enToZhPrompt: `Translate the following English text to formal Chinese. Use appropriate honorifics and formal language suitable for business or academic contexts:`,
    zhToEnPrompt: `Translate the following Chinese text to formal English. Use appropriate formal language suitable for business or academic contexts:`,
  },
  colloquial: {
    name: 'Colloquial Translation',
    enToZhPrompt: `Translate the following English text to colloquial Chinese. Use natural, everyday language that native speakers would use in casual conversation:`,
    zhToEnPrompt: `Translate the following Chinese text to colloquial English. Use natural, everyday language that native speakers would use in casual conversation:`,
  },
};

// 语言检测配置
const LANGUAGE_HINTS = {
  chinese: [
    '的',
    '是',
    '在',
    '有',
    '和',
    '了',
    '不',
    '人',
    '我',
    '你',
    '他',
    '她',
    '它',
    '们',
    '这',
    '那',
    '个',
    '一',
    '二',
    '三',
    '们',
    '吗',
    '呢',
    '吧',
    '啊',
    '哦',
    '嗯',
    '哈',
    '呀',
    '哟',
  ],
  english: [
    'the',
    'and',
    'you',
    'with',
    'that',
    'from',
    'this',
    'for',
    'are',
    'but',
    'not',
    'they',
    'were',
    'been',
    'have',
    'has',
    'had',
    'what',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'could',
    'shall',
    'must',
  ],
} as const;

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 智能语言检测
function detectLanguageLocally(
  text: string
): 'chinese' | 'english' | 'unknown' {
  const cleanText = text.toLowerCase().trim();

  // 检查中文字符
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'chinese';
  }

  // 检查英语特征词
  const chineseHits = LANGUAGE_HINTS.chinese.filter((hint) =>
    cleanText.includes(hint)
  ).length;
  const enHits = LANGUAGE_HINTS.english.filter((hint) =>
    cleanText.includes(hint)
  ).length;

  if (chineseHits > enHits) {
    return 'chinese';
  } else if (enHits > chineseHits) {
    return 'english';
  }

  return 'unknown';
}

// 构建翻译提示
function buildPrompt(
  text: string,
  mode: TranslationMode,
  direction: string,
  enableDualTranslation = false
): string {
  const modeConfig = TRANSLATION_MODES[mode];
  let prompt = '';

  if (direction === 'en-zh') {
    prompt = `${modeConfig.enToZhPrompt}\n\n"${text}"`;
  } else {
    prompt = `${modeConfig.zhToEnPrompt}\n\n"${text}"`;
  }

  // 如果启用双向翻译，添加回译要求
  if (enableDualTranslation) {
    prompt +=
      '\n\nAlso provide a back translation of your result to verify accuracy in the format: BackTranslation: [back translated text]';
  }

  return prompt;
}

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'English to Chinese Translator API (Gemini Flash 2.0) is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
    modes: Object.keys(TRANSLATION_MODES),
    languages: ['English', 'Chinese'],
    directions: ['en-zh', 'zh-en'],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      direction = 'en-zh',
      mode = 'general',
      enableDualTranslation = false,
      detectOnly = false,
    }: TranslationRequest = body;

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    // 验证翻译模式
    if (!TRANSLATION_MODES[mode]) {
      return Response.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 智能检测输入语言
    const detectedLanguage = detectLanguageLocally(text);

    // 确定翻译方向
    let finalDirection = direction;
    let autoDetected = false;

    if (!direction) {
      if (detectedLanguage === 'english') {
        finalDirection = 'en-zh';
      } else if (detectedLanguage === 'chinese') {
        finalDirection = 'zh-en';
      } else {
        finalDirection = 'en-zh'; // 默认方向
      }
      autoDetected = true;
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return Response.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence: 0.9,
        autoDetected: true,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'chinese'
                ? 'Chinese'
                : 'Unknown',
          direction:
            finalDirection === 'en-zh'
              ? 'English → Chinese'
              : 'Chinese → English',
          confidence: 90,
          explanation:
            detectedLanguage === 'english'
              ? 'Detected English input'
              : detectedLanguage === 'chinese'
                ? 'Detected Chinese input'
                : 'Language detection uncertain',
        },
      });
    }

    // 构建翻译提示
    const prompt = buildPrompt(
      text,
      mode,
      finalDirection,
      enableDualTranslation
    );

    // 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature:
              mode === 'formal' ? 0.2 : mode === 'colloquial' ? 0.4 : 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Translation API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    let translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      throw new Error('No translation received');
    }

    // 处理回译提取
    let backTranslation = '';
    if (enableDualTranslation) {
      const backTranslationMatch = translatedText.match(
        /BackTranslation:\s*([^\n]+)/i
      );
      if (backTranslationMatch) {
        backTranslation = backTranslationMatch[1].trim();
        // 移除回译部分，只保留翻译
        translatedText = translatedText
          .replace(/BackTranslation:\s*[^\n]+/i, '')
          .trim();
      }
    }

    const { source, target } =
      LANGUAGE_MAP[finalDirection as 'en-zh' | 'zh-en'];

    // 构建响应
    const result = {
      translated: translatedText,
      detectedSourceLanguage:
        detectedLanguage === 'english'
          ? 'English'
          : detectedLanguage === 'chinese'
            ? 'Chinese'
            : 'Auto',
      detectedTargetLanguage: target,
      backTranslation: backTranslation || undefined,
      direction: finalDirection,
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      confidence: 0.9,
      autoDetected,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'english'
            ? 'English'
            : detectedLanguage === 'chinese'
              ? 'Chinese'
              : 'Unknown',
        direction:
          finalDirection === 'en-zh'
            ? 'English → Chinese'
            : 'Chinese → English',
        confidence: 90,
        explanation: autoDetected
          ? `Auto-detected ${detectedLanguage === 'english' ? 'English' : 'Chinese'} input, translated to ${target}`
          : `Manual translation: ${source} → ${target}`,
      },
    };

    return Response.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 处理特定的 Gemini 错误
    if (error?.message?.includes('API key')) {
      return Response.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('quota')) {
      return Response.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // 提供本地降级方案
    const localDetection = detectLanguageLocally(text);
    const fallbackTranslation =
      direction === 'en-zh'
        ? `${text} (翻译成中文 - 演示模式)`
        : `${text} (translated to English - demo mode)`;

    return Response.json({
      translated: fallbackTranslation,
      detectedSourceLanguage:
        localDetection === 'english'
          ? 'English'
          : localDetection === 'chinese'
            ? 'Chinese'
            : 'Auto',
      detectedTargetLanguage: direction === 'en-zh' ? 'Chinese' : 'English',
      backTranslation: null,
      warning: 'Gemini translation unavailable, using fallback translation.',
    });
  }
}
