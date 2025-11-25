import { type NextRequest, NextResponse } from 'next/server';
import { queuedGeminiFetch } from '@/lib/queue/gemini-fetch-queue';

export const runtime = 'edge';

// Language mapping for better translation prompts
const languageMap: { [key: string]: string } = {
  en: 'English',
  es: 'Spanish',
  nah: 'Classical Nahuatl',
  zh: 'Chinese (Simplified)',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  auto: 'appropriate language based on context',
};

async function detectLanguage(text: string): Promise<string> {
  // Simple language detection based on character patterns and common words
  const chineseRegex = /[\u4e00-\u9fff]/;
  const spanishRegex = /[ñáéíóúü¿¡]/i;
  const frenchRegex = /[àâäæçéèêëïîôùûüÿñ]/i;
  const germanRegex = /[äöüß]/i;
  const portugueseRegex = /[àáâãçéêíóôõú]/i;

  // Check for Chinese characters first
  if (chineseRegex.test(text)) return 'zh';

  // Check for specific language indicators
  const lowerText = text.toLowerCase();

  // French indicators
  if (
    frenchRegex.test(text) ||
    /\b(le|la|les|un|une|et|est|dans|pour|avec)\b/.test(lowerText)
  ) {
    return 'fr';
  }

  // Spanish indicators
  if (
    spanishRegex.test(text) ||
    /\b(el|la|los|las|un|una|y|es|en|para|con)\b/.test(lowerText)
  ) {
    return 'es';
  }

  // German indicators
  if (
    germanRegex.test(text) ||
    /\b(der|die|das|ein|eine|und|ist|in|für|mit)\b/.test(lowerText)
  ) {
    return 'de';
  }

  // Portuguese indicators
  if (
    portugueseRegex.test(text) ||
    /\b(o|a|os|as|um|uma|e|é|em|para|com)\b/.test(lowerText)
  ) {
    return 'pt';
  }

  return 'en'; // Default to English
}

async function translateWithGemini(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'auto'
): Promise<{ translation: string; detectedLanguage: string }> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google Generative AI API key is not configured');
  }

  // Detect source language if auto
  const detectedSourceLang =
    sourceLanguage === 'auto' ? await detectLanguage(text) : sourceLanguage;
  const sourceLangName = languageMap[detectedSourceLang] || detectedSourceLang;
  const targetLangName = languageMap[targetLanguage] || targetLanguage;

  // Create context-aware translation prompt
  let prompt: string;

  if (targetLanguage === 'auto') {
    prompt = `Analyze the following text and provide the most appropriate translation based on the context. Choose the target language that would be most useful for the content. Provide only the translation, no explanations:

Original text (${sourceLangName}): ${text}`;
  } else {
    prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Provide accurate, natural-sounding translation while preserving the original meaning and tone. Provide only the translation, no explanations or additional text:

Original text: ${text}`;
  }

  const response = await queuedGeminiFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    },
    'nahuatl'
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  const translation = data.candidates[0].content.parts[0].text.trim();

  // For auto-detect, try to determine what language was translated to
  let finalTargetLang = targetLanguage;
  if (targetLanguage === 'auto') {
    // Simple heuristic - if it contains Chinese characters, it's Chinese, etc.
    finalTargetLang = await detectLanguage(translation);
  }

  return {
    translation,
    detectedLanguage: sourceLangName,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      targetLanguage = 'nah',
      sourceLanguage = 'auto',
      context = '',
      options = {},
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Valid text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await translateWithGemini(
      text,
      targetLanguage,
      sourceLanguage
    );
    const processingTime = `${Date.now() - startTime}ms`;

    // Return response in format expected by frontend
    return NextResponse.json({
      translated: result.translation,
      result: result.translation, // Alternative field name that frontend checks
      detectedLanguage: result.detectedLanguage,
      original: text,
      targetLanguage:
        targetLanguage === 'auto'
          ? 'Auto-determined'
          : languageMap[targetLanguage] || targetLanguage,
      contextNotes: context, // Echo back context if provided
      translationMethod: 'gemini-2.0-flash',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        textLength: text.length,
        translatedLength: result.translation.length,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        error: 'Translation failed',
        suggestion: 'Please try again',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Nahuatl Translator API',
    description:
      'Gemini 2.0 Flash powered English to Nahuatl translation service',
    features: [
      'AI-powered translation',
      'Indigenous language processing',
      'Context-aware translation',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
