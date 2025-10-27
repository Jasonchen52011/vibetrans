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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const LANGUAGE_MAP: Record<
  'en-sw' | 'sw-en',
  { source: string; target: string }
> = {
  'en-sw': { source: 'English', target: 'Swahili' },
  'sw-en': { source: 'Swahili', target: 'English' },
};

// Language detection configuration
const LANGUAGE_HINTS = {
  swahili: [
    'hujambo',
    'asante',
    'karibu',
    'mambo',
    'rafiki',
    'habari',
    'tafadhali',
  ],
  english: ['the', 'and', 'you', 'with', 'that', 'from', 'this'],
} as const;

function detectLanguageLocally(text: string) {
  const swahiliHints = LANGUAGE_HINTS.swahili;
  const englishHints = LANGUAGE_HINTS.english;

  const normalized = text.toLowerCase();
  const swHits = swahiliHints.filter((hint) =>
    normalized.includes(hint)
  ).length;
  const enHits = englishHints.filter((hint) =>
    normalized.includes(hint)
  ).length;

  if (swHits === enHits) {
    return 'Auto';
  }
  return swHits > enHits ? 'Swahili' : 'English';
}

async function callOpenAIForTranslation(
  payload: TranslationRequest
): Promise<TranslationResult | null> {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const direction = payload.direction || 'en-sw';
  const { source, target } = LANGUAGE_MAP[direction];

  const systemPrompt = `You are a bilingual translator for English and Swahili. Detect the source language, translate the text, and return a concise JSON response with the translation data. Use this JSON schema:
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
Provide the translation respecting cultural context, professional tone, and everyday slang when appropriate.`;

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
      console.error('OpenAI translation error:', errorText);
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
    console.error('Translation API failure:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { text, direction = 'en-sw' }: TranslationRequest =
      await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    const normalizedDirection: 'en-sw' | 'sw-en' =
      direction === 'sw-en' ? 'sw-en' : 'en-sw';

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
      normalizedDirection === 'en-sw'
        ? `${text} (translated to Swahili - demo mode)`
        : `${text} (translated to English - demo mode)`;

    return NextResponse.json({
      translated: fallbackTranslation,
      detectedSourceLanguage: localDetection,
      detectedTargetLanguage:
        normalizedDirection === 'en-sw' ? 'Swahili' : 'English',
      backTranslation: null,
      warning: 'OpenAI translation unavailable, using fallback translation.',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
