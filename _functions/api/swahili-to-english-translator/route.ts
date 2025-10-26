import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

type TranslatorDirection = 'sw-en' | 'en-sw';

const TRANSLATION_MODES = {
  formal: {
    name: 'Formal Translation',
    swahiliToEnPrompt: `You are a professional Swahili to English translator specializing in formal documents.

Focus on:
- Accurate translation of formal Swahili
- Proper English grammar and syntax
- Maintaining formal tone and register
- Technical and business terminology
- Cultural nuances in formal contexts

Translate the following Swahili text to formal English:`,
    englishToSwPrompt: `You are a professional English to Swahili translator for contracts, corporate briefs, and official announcements.

Focus on:
- Precise rendition of formal English into Swahili
- Maintaining professional tone and respectful address
- Clarity of complex business or legal terminology
- Cultural alignment for East African audiences

Translate the following English text to formal Swahili:`,
  },
  casual: {
    name: 'Casual Translation',
    swahiliToEnPrompt: `You are a Swahili to English translator specializing in everyday conversation and casual language.

Focus on:
- Natural, conversational English
- Common expressions and slang equivalents
- Cultural context in daily life
- Modern usage and colloquialisms
- Maintaining friendly, approachable tone

Translate the following Swahili text to casual English:`,
    englishToSwPrompt: `You help English speakers communicate naturally in Swahili for chats, social media, and friendly exchanges.

Focus on:
- Conversational Swahili that sounds native
- Everyday slang and informal greetings
- Cultural references relevant to Tanzania and Kenya
- Warm, approachable tone

Translate the following English text to casual Swahili:`,
  },
  literary: {
    name: 'Literary Translation',
    swahiliToEnPrompt: `You are a literary translator specializing in Swahili to English literary works.

Focus on:
- Preserving literary style and artistic expression
- Cultural nuances and literary devices
- Poetic elements and narrative flow
- Traditional storytelling elements
- Maintaining emotional and aesthetic impact

Translate the following Swahili literary text to English while preserving its artistic essence:`,
    englishToSwPrompt: `You adapt English literary passages into evocative Swahili while honoring rhythm, imagery, and symbolism.

Focus on:
- Keeping poetic devices and metaphors intact
- Using expressive Swahili vocabulary
- Balancing cultural fidelity with readability
- Preserving emotional tone and narrative cadence

Translate the following English literary text to Swahili:`,
  },
  general: {
    name: 'General Translation',
    swahiliToEnPrompt: `You are a professional Swahili to English translator. Translate the text directly without any explanations or instructions.

Translate the following Swahili text to English:`,
    englishToSwPrompt: `You are a professional English to Swahili translator. Translate the text directly without commentary or additional notes.

Translate the following English text to Swahili:`,
  },
} as const;

type TranslationMode = keyof typeof TRANSLATION_MODES;

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
    direction === 'sw-en'
      ? modeConfig.swahiliToEnPrompt
      : modeConfig.englishToSwPrompt;
  const fullPrompt = `${prompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

function fallbackTranslation(text: string, direction: TranslatorDirection): string {
  return direction === 'sw-en'
    ? `${text} (translated to English - demo mode)`
    : `${text} (translated to Swahili - demo mode)`;
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'swahili'
      ? 'Swahili'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction: direction === 'sw-en' ? 'Swahili → English' : 'English → Swahili',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'swahili'
        ? 'Auto-detected Swahili input, translated to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Swahili'
          : 'Translation completed',
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Swahili to English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: TranslationMode;
      detectOnly?: boolean;
      direction?: TranslatorDirection;
    };

    const { text, mode = 'general', detectOnly = false, direction } = body;

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

    if (direction && direction !== 'sw-en' && direction !== 'en-sw') {
      return NextResponse.json(
        { error: 'Invalid direction. Use "sw-en" or "en-sw".' },
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

    const detection = detectLanguage(text, 'swahili');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectionDirection: TranslatorDirection =
      detection.suggestedDirection === 'from-english' ? 'en-sw' : 'sw-en';

    const normalizedDirection: TranslatorDirection =
      direction === 'en-sw' || direction === 'sw-en'
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
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      detectedInputLanguage: detectedLanguage,
      detectedDirection: normalizedDirection,
      confidence,
      autoDetected,
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
