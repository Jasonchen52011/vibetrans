import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'en-to-am' | 'am-to-en';

type TranslationRequest = {
  text?: string;
  direction?: TranslatorDirection;
  includeTransliteration?: boolean;
  detectOnly?: boolean;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function detectDirection(text: string, direction?: TranslatorDirection) {
  const detection = detectLanguage(text, 'amharic');
  const finalDirection: TranslatorDirection = direction
    ? direction
    : detection.detectedLanguage === 'amharic'
      ? 'am-to-en'
      : 'en-to-am';

  return {
    detection,
    finalDirection,
  };
}

async function callTranslationProvider(
  text: string,
  direction: TranslatorDirection,
  includeTransliteration: boolean
) {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const targetLanguage = direction === 'en-to-am' ? 'Amharic' : 'English';
  const sourceLanguage = direction === 'en-to-am' ? 'English' : 'Amharic';

  const systemPrompt = `You are a professional translator for ${sourceLanguage} ↔ ${targetLanguage}. Return strict JSON matching the schema {"translation": "string", "transliteration": "string"}. Transliteration should be empty when not applicable.`;

  const userPrompt = `Translate the following ${sourceLanguage} text into ${targetLanguage}.

Text:
"""
${text}
"""

${includeTransliteration ? 'Provide a helpful transliteration as well.' : 'Provide an empty transliteration string.'}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model:
        process.env.TRANSLATION_MODEL ||
        process.env.CONTENT_MODEL ||
        'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Translation provider error:', errorBody);
    return null;
  }

  const data = await response.json();
  try {
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
    return {
      translated: parsed.translation?.trim() ?? '',
      transliteration: parsed.transliteration?.trim() ?? '',
    };
  } catch (err) {
    console.error('Failed to parse provider response:', err);
    return null;
  }
}

function fallbackTranslation(text: string, direction: TranslatorDirection) {
  if (direction === 'en-to-am') {
    return {
      translated: `${text} (translated to Amharic - demo mode)`,
      transliteration: '',
    };
  }
  return {
    translated: `${text} (translated to English - demo mode)`,
    transliteration: '',
  };
}

export async function POST(request: Request) {
  try {
    const {
      text,
      direction,
      includeTransliteration = false,
      detectOnly = false,
    } = (await request.json()) as TranslationRequest;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    const { detection, finalDirection } = detectDirection(text, direction);

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detection.detectedLanguage,
        detectedDirection: finalDirection,
        confidence: detection.confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: detection.detectedLanguage !== 'unknown',
          detectedLanguage:
            detection.detectedLanguage === 'english'
              ? 'English'
              : detection.detectedLanguage === 'amharic'
                ? 'Amharic'
                : 'Unknown',
          direction:
            finalDirection === 'en-to-am'
              ? 'English → Amharic'
              : 'Amharic → English',
          confidence: Math.round(detection.confidence * 100),
        },
      });
    }

    const providerResult = await callTranslationProvider(
      text,
      finalDirection,
      includeTransliteration
    );

    const result = providerResult ?? fallbackTranslation(text, finalDirection);

    if (!result.translated.trim()) {
      throw new Error('Translation provider returned empty result');
    }

    return NextResponse.json({
      translated: result.translated,
      transliteration: includeTransliteration ? result.transliteration : '',
      direction: finalDirection,
      detectedInputLanguage: detection.detectedLanguage,
      confidence: detection.confidence,
      autoDetected: !direction,
      message: 'Translation successful',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
