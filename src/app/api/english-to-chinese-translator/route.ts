import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationRequest = {
  text: string;
  direction?: 'en-zh' | 'zh-en';
  enableDualTranslation?: boolean;
};

type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage: string;
  detectedTargetLanguage: string;
  backTranslation?: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const LANGUAGE_MAP: Record<
  'en-zh' | 'zh-en',
  { source: string; target: string }
> = {
  'en-zh': { source: 'English', target: 'Chinese' },
  'zh-en': { source: 'Chinese', target: 'English' },
};

// Language detection configuration
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
  ],
} as const;

function detectLanguageLocally(text: string) {
  const chineseHints = LANGUAGE_HINTS.chinese;
  const englishHints = LANGUAGE_HINTS.english;

  const normalized = text.toLowerCase();
  const chineseHits = chineseHints.filter((hint) =>
    normalized.includes(hint)
  ).length;
  const enHits = englishHints.filter((hint) =>
    normalized.includes(hint)
  ).length;

  if (chineseHits === enHits) {
    return 'Auto';
  }
  return chineseHits > enHits ? 'Chinese' : 'English';
}

async function callOpenAIForTranslation(
  payload: TranslationRequest
): Promise<TranslationResult | null> {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const direction = payload.direction || 'en-zh';
  const { source, target } = LANGUAGE_MAP[direction];

  const systemPrompt = `You are a bilingual translator for English and Chinese. Detect the source language, translate the text, and return a concise JSON response with the translation data. Use this JSON schema:
{
  "translatedText": "string",
  "detectedSourceLanguage": "string",
  "detectedTargetLanguage": "string",
  "backTranslation": "string"
}
Always respond with valid JSON only. If back translation is not required, return null.`;

  const userPrompt = `Source language hint: ${source}
Target language: ${target}
Text: """${payload.text}"""
Provide the translation respecting cultural context, appropriate formality, and accurate character usage.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.CONTENT_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('OpenAI translation error:', errorText);
      }
      return null;
    }

    const data = await response.json();
    const message: string = data.choices?.[0]?.message?.content || '';
    const jsonMatch = message.match(/```json\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : message;
    const parsed = JSON.parse(jsonContent) as TranslationResult;

    if (!parsed.translatedText) {
      return null;
    }

    return parsed;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation API failure:', error);
    }
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { text, direction = 'en-zh' }: TranslationRequest =
      await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    const normalizedDirection: 'en-zh' | 'zh-en' =
      direction === 'zh-en' ? 'zh-en' : 'en-zh';

    const aiResult = await callOpenAIForTranslation({
      text,
      direction: normalizedDirection,
      enableDualTranslation: true,
    });

    if (aiResult) {
      return NextResponse.json({
        translated: aiResult.translatedText,
        detectedSourceLanguage: aiResult.detectedSourceLanguage,
        detectedTargetLanguage: aiResult.detectedTargetLanguage,
        backTranslation: aiResult.backTranslation,
      });
    }

    const localDetection = detectLanguageLocally(text);
    const fallbackTranslation =
      normalizedDirection === 'en-zh'
        ? `${text} (翻译成中文 - 演示模式)`
        : `${text} (translated to English - demo mode)`;

    return NextResponse.json({
      translated: fallbackTranslation,
      detectedSourceLanguage: localDetection,
      detectedTargetLanguage:
        normalizedDirection === 'en-zh' ? 'Chinese' : 'English',
      backTranslation: null,
      warning: 'OpenAI translation unavailable, using fallback translation.',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
