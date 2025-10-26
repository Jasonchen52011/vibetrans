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

interface DetectionSummary {
  detectedLanguage: 'english' | 'swahili' | 'unknown';
  confidence: number;
  suggestedDirection: 'en-sw' | 'sw-en';
}

function detectLanguageLocally(text: string): DetectionSummary {
  const normalized = text.toLowerCase();
  const swHits = LANGUAGE_HINTS.swahili.filter((hint) =>
    normalized.includes(hint)
  ).length;
  const enHits = LANGUAGE_HINTS.english.filter((hint) =>
    normalized.includes(hint)
  ).length;
  const hasSwahiliDiacritics = /[āēīōū]/.test(text);

  if (hasSwahiliDiacritics) {
    return {
      detectedLanguage: 'swahili',
      confidence: 0.8,
      suggestedDirection: 'sw-en',
    };
  }

  if (swHits === 0 && enHits === 0) {
    return {
      detectedLanguage: 'unknown',
      confidence: 0.2,
      suggestedDirection: 'en-sw',
    };
  }

  const detectedLanguage =
    swHits > enHits ? 'swahili' : enHits > swHits ? 'english' : 'unknown';
  const diff = Math.abs(swHits - enHits);
  const total = swHits + enHits || 1;
  const confidence = Math.min(1, diff / total);

  return {
    detectedLanguage,
    confidence,
    suggestedDirection: detectedLanguage === 'swahili' ? 'sw-en' : 'en-sw',
  };
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
    const {
      text,
      direction,
      detectOnly = false,
    }: TranslationRequest & {
      detectOnly?: boolean;
    } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    const detection = detectLanguageLocally(text);
    const normalizedDirection: 'en-sw' | 'sw-en' =
      direction === 'sw-en' || direction === 'en-sw'
        ? direction
        : detection.suggestedDirection;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detection.detectedLanguage,
        detectedDirection: normalizedDirection,
        confidence: detection.confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: detection.detectedLanguage !== 'unknown',
          detectedLanguage:
            detection.detectedLanguage === 'swahili'
              ? 'Swahili'
              : detection.detectedLanguage === 'english'
                ? 'English'
                : 'Unknown',
          direction:
            normalizedDirection === 'en-sw'
              ? 'English → Swahili'
              : 'Swahili → English',
          confidence: Math.round(detection.confidence * 100),
        },
      });
    }

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
        detectedInputLanguage: aiResult.detectedSourceLanguage
          ?.toLowerCase()
          .includes('swahili')
          ? 'swahili'
          : aiResult.detectedSourceLanguage?.toLowerCase().includes('english')
            ? 'english'
            : 'unknown',
        detectedDirection: normalizedDirection,
        confidence: detection.confidence,
      });
    }

    const fallbackTranslation =
      normalizedDirection === 'en-sw'
        ? `${text} (translated to Swahili - demo mode)`
        : `${text} (translated to English - demo mode)`;

    return NextResponse.json({
      translated: fallbackTranslation,
      detectedSourceLanguage:
        detection.detectedLanguage === 'swahili'
          ? 'Swahili'
          : detection.detectedLanguage === 'english'
            ? 'English'
            : 'Auto',
      detectedTargetLanguage:
        normalizedDirection === 'en-sw' ? 'Swahili' : 'English',
      backTranslation: null,
      detectedInputLanguage: detection.detectedLanguage,
      detectedDirection: normalizedDirection,
      confidence: detection.confidence,
      warning: 'OpenAI translation unavailable, using fallback translation.',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
