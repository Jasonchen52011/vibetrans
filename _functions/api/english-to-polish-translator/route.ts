import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

type TranslatorDirection = 'en-pl' | 'pl-en';
type TranslationMode = keyof typeof TRANSLATION_MODES;

const TRANSLATION_MODES = {
  general: {
    name: 'General Translation',
    enToPlPrompt: `You are a professional English to Polish translator. Translate the text directly without any explanations or additional notes.`,
    plToEnPrompt: `You are a professional Polish to English translator. Translate the text directly without any explanations or additional notes.`,
  },
  formal: {
    name: 'Formal Translation',
    enToPlPrompt: `You are a certified translator specializing in formal English → Polish translations.

Focus on:
- Formal vocabulary and respectful tone
- Accurate case usage and grammar
- Business, legal, or academic terminology
- Cultural nuance for Polish professional settings

Translate the following English text to Polish with formal precision:`,
    plToEnPrompt: `You are a certified translator specializing in formal Polish → English translations.

Focus on:
- Professional tone and clarity
- Accurate rendering of Polish cases and idioms
- Business, legal, or academic terminology
- Cultural nuance for global audiences

Translate the following Polish text to English with formal precision:`,
  },
  casual: {
    name: 'Casual Translation',
    enToPlPrompt: `You translate English into natural, conversational Polish used in friendly chats, social media, and everyday life.

Focus on:
- Colloquial vocabulary and idioms
- Friendly, approachable tone
- Cultural references relevant to Poland
- Smooth, modern phrasing

Translate the following English text to Polish conversationally:`,
    plToEnPrompt: `You translate Polish into natural, conversational English used in friendly chats, social media, and everyday life.

Focus on:
- Colloquial vocabulary and idioms
- Friendly, approachable tone
- Cultural references relevant to English-speaking audiences
- Smooth, modern phrasing

Translate the following Polish text to English conversationally:`,
  },
} as const;

async function translateText(
  text: string,
  direction: TranslatorDirection,
  mode: TranslationMode = 'general'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];
  const prompt =
    direction === 'en-pl' ? modeConfig.enToPlPrompt : modeConfig.plToEnPrompt;
  const fullPrompt = `${prompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

function fallbackTranslation(text: string, direction: TranslatorDirection) {
  return direction === 'en-pl'
    ? `${text} (translated to Polish - demo mode)`
    : `${text} (translated to English - demo mode)`;
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'polish'
      ? 'Polish'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction: direction === 'en-pl' ? 'English → Polish' : 'Polish → English',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'polish'
        ? 'Auto-detected Polish input, translated to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Polish'
          : 'Translation completed',
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'English ↔ Polish Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      direction?: TranslatorDirection;
      mode?: TranslationMode;
      detectOnly?: boolean;
    };

    const { text, direction, mode = 'general', detectOnly = false } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (direction && direction !== 'en-pl' && direction !== 'pl-en') {
      return NextResponse.json(
        { error: 'Invalid direction. Use "en-pl" or "pl-en".' },
        { status: 400 }
      );
    }

    if (!TRANSLATION_MODES[mode]) {
      return NextResponse.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const detection = detectLanguage(text, 'polish');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectionDirection: TranslatorDirection =
      detectedLanguage === 'polish' ? 'pl-en' : 'en-pl';

    const normalizedDirection: TranslatorDirection =
      direction === 'en-pl' || direction === 'pl-en'
        ? direction
        : detectionDirection;

    const autoDetected = !direction;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: detectionDirection,
        confidence,
        autoDetected,
        languageInfo: buildLanguageInfo(
          detectedLanguage,
          detectionDirection,
          confidence
        ),
      });
    }

    let translated: string;
    try {
      translated = await translateText(text, normalizedDirection, mode);
    } catch (error) {
      console.error('Gemini translation error:', error);
      translated = fallbackTranslation(text, normalizedDirection);
    }

    if (!translated.trim()) {
      translated = fallbackTranslation(text, normalizedDirection);
    }

    return NextResponse.json({
      translated: translated.trim(),
      original: text,
      direction: normalizedDirection,
      detectedDirection: normalizedDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected,
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        normalizedDirection,
        confidence
      ),
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
