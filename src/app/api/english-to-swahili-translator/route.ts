import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationRequest = {
  text: string;
  direction?: 'en-sw' | 'sw-en';
  enableDualTranslation?: boolean;
};

type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage: string;
  detectedTargetLanguage: string;
  backTranslation?: string;
};

// Gemini API配置
const LANGUAGE_MAP: Record<
  'en-sw' | 'sw-en',
  { source: string; target: string }
> = {
  'en-sw': { source: 'English', target: 'Swahili' },
  'sw-en': { source: 'Swahili', target: 'English' },
};

// 翻译模式定义
const TRANSLATION_MODES = {
  general: {
    name: 'General Translation',
    enToSwPrompt: `Translate the following English text to Swahili. Provide accurate and natural-sounding translation:`,
    swToEnPrompt: `Translate the following Swahili text to English. Provide accurate and natural-sounding translation:`,
  },
  formal: {
    name: 'Formal Translation',
    enToSwPrompt: `Translate the following English text to formal Swahili. Use appropriate formal language:`,
    swToEnPrompt: `Translate the following Swahili text to formal English. Use appropriate formal language:`,
  },
  colloquial: {
    name: 'Colloquial Translation',
    enToSwPrompt: `Translate the following English text to colloquial Swahili. Use natural, everyday language:`,
    swToEnPrompt: `Translate the following Swahili text to colloquial English. Use natural, everyday language:`,
  },
};

// Language detection configuration
const LANGUAGE_HINTS = {
  swahili: [
    'hujambo', 'asante', 'karibu', 'mambo', 'rafiki', 'habari', 'tafadhali', 'nzuri', 'sana', 'bado', 'kweli', 'kwa', 'la', 'ya', 'na'
  ],
  english: ['the', 'and', 'you', 'with', 'that', 'from', 'this', 'for', 'are', 'but', 'not', 'they', 'were', 'been'],
} as const;

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 智能语言检测
function detectLanguageLocally(text: string): 'swahili' | 'english' | 'unknown' {
  const cleanText = text.toLowerCase().trim();

  const swahiliHits = LANGUAGE_HINTS.swahili.filter((hint) =>
    cleanText.includes(hint)
  ).length;
  const enHits = LANGUAGE_HINTS.english.filter((hint) =>
    cleanText.includes(hint)
  ).length;

  if (swahiliHits > enHits) {
    return 'swahili';
  } else if (enHits > swahiliHits) {
    return 'english';
  }

  return 'unknown';
}

// 构建翻译提示
function buildPrompt(text: string, mode: TranslationMode, direction: string, enableDualTranslation: boolean = false): string {
  const modeConfig = TRANSLATION_MODES[mode];
  let prompt = '';

  if (direction === 'en-sw') {
    prompt = `${modeConfig.enToSwPrompt}\n\n"${text}"`;
  } else {
    prompt = `${modeConfig.swToEnPrompt}\n\n"${text}"`;
  }

  // 如果启用双向翻译，添加回译要求
  if (enableDualTranslation) {
    prompt += '\n\nAlso provide a back translation of your result to verify accuracy in the format: BackTranslation: [back translated text]';
  }

  return prompt;
}

// 使用Gemini进行翻译
async function callGeminiForTranslation(
  payload: TranslationRequest & { mode?: TranslationMode }
): Promise<TranslationResult | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const direction = payload.direction || 'en-sw';
  const mode = payload.mode || 'general';
  const { source, target } = LANGUAGE_MAP[direction];

  // 构建翻译提示
  const prompt = buildPrompt(payload.text, mode, direction, payload.enableDualTranslation);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: mode === 'formal' ? 0.2 : mode === 'colloquial' ? 0.4 : 0.3,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini translation error:', errorText);
      }
      return null;
    }

    const data = await response.json();
    let translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      return null;
    }

    // 处理回译提取
    let backTranslation = '';
    if (payload.enableDualTranslation) {
      const backTranslationMatch = translatedText.match(/BackTranslation:\s*([^\n]+)/i);
      if (backTranslationMatch) {
        backTranslation = backTranslationMatch[1].trim();
        // 移除回译部分，只保留翻译
        translatedText = translatedText.replace(/BackTranslation:\s*[^\n]+/i, '').trim();
      }
    }

    // 智能检测源语言
    const detectedSourceLanguage = detectLanguageLocally(payload.text);

    return {
      translatedText,
      detectedSourceLanguage: detectedSourceLanguage === 'english' ? 'English' :
                           detectedSourceLanguage === 'swahili' ? 'Swahili' : 'Auto',
      detectedTargetLanguage: target,
      backTranslation: backTranslation || undefined,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation API failure:', error);
    }
    return null;
  }
}

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'English to Swahili Translator API (Gemini Flash 2.0) is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
    modes: Object.keys(TRANSLATION_MODES),
    languages: ['English', 'Swahili'],
    directions: ['en-sw', 'sw-en'],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      direction = 'en-sw',
      mode = 'general',
      enableDualTranslation = false
    }: TranslationRequest & { mode?: TranslationMode } = body;

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    // 验证翻译模式
    if (!TRANSLATION_MODES[mode]) {
      return Response.json(
        { error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}` },
        { status: 400 }
      );
    }

    const normalizedDirection: 'en-sw' | 'sw-en' =
      direction === 'sw-en' ? 'sw-en' : 'en-sw';

    const aiResult = await callGeminiForTranslation({
      text,
      direction: normalizedDirection,
      mode,
      enableDualTranslation,
    });

    if (aiResult) {
      return Response.json({
        translated: aiResult.translatedText,
        detectedSourceLanguage: aiResult.detectedSourceLanguage,
        detectedTargetLanguage: aiResult.detectedTargetLanguage,
        backTranslation: aiResult.backTranslation,
        direction: normalizedDirection,
        mode,
        modeName: TRANSLATION_MODES[mode].name,
        confidence: 0.85,
        autoDetected: !direction,
        message: 'Translation successful',
      });
    }

    const localDetection = detectLanguageLocally(text);
    const fallbackTranslation =
      normalizedDirection === 'en-sw'
        ? `${text} (translated to Swahili - demo mode)`
        : `${text} (translated to English - demo mode)`;

    return Response.json({
      translated: fallbackTranslation,
      detectedSourceLanguage: localDetection === 'english' ? 'English' :
                             localDetection === 'swahili' ? 'Swahili' : 'Auto',
      detectedTargetLanguage:
        normalizedDirection === 'en-sw' ? 'Swahili' : 'English',
      backTranslation: null,
      warning: 'Gemini translation unavailable, using fallback translation.',
    });
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

    return Response.json({ error: 'Translation failed' }, { status: 500 });
  }
}
