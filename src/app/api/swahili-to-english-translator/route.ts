import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationRequest = {
  text: string;
  inputType?: string;
  direction?: 'sw-en' | 'auto';
};

type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage: string;
  detectedTargetLanguage: string;
  backTranslation?: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Language detection configuration
const LANGUAGE_HINTS = {
  swahili: [
    'hujambo', 'jambo', 'habari', 'asante', 'karibu', 'mambo', 'sijambo',
    'rafiki', 'tafadhali', 'pole', 'samahani', 'nzuri', 'kwaheri',
    'kwa', 'na', 'wa', 'ya', 'la', 'za', ' cha', 'vya', 'ya', 'me', 'li',
    'ni', 'tu', 'wa', 'wa', 'ku', 'mu', 'ki', 'vi', 'zi',
    'mimi', 'wewe', 'yeye', 'sisi', 'ninyi', 'wao',
    'hapa', 'pale', 'huko', 'humu', 'mahali',
    'leo', 'kesho', 'jana', 'sasa', 'bado',
    'ndiyo', 'hapana', 'labda', 'kama', 'ila', 'kwa sababu'
  ],
  english: ['the', 'and', 'you', 'with', 'that', 'from', 'this', 'not', 'are', 'but'],
} as const;

function detectLanguageLocally(text: string): 'Swahili' | 'English' | 'Unknown' {
  const swahiliHints = LANGUAGE_HINTS.swahili;
  const englishHints = LANGUAGE_HINTS.english;

  const normalized = text.toLowerCase();
  const swHits = swahiliHints.filter((hint) =>
    normalized.includes(hint)
  ).length;
  const enHits = englishHints.filter((hint) =>
    normalized.includes(hint)
  ).length;

  if (swHits === 0 && enHits === 0) {
    return 'Unknown';
  }
  return swHits > enHits ? 'Swahili' : 'English';
}

async function callOpenAIForTranslation(
  text: string,
  sourceLanguage: string = 'Swahili',
  targetLanguage: string = 'English'
): Promise<TranslationResult | null> {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const systemPrompt = `You are a professional translator specializing in Swahili to English translation.

Your task:
1. Detect if the input text is Swahili or English
2. Translate to the target language (English if input is Swahili, Swahili if input is English)
3. Provide a back-translation to verify accuracy
4. Return a concise JSON response

Use this JSON schema:
{
  "translatedText": "string",
  "detectedSourceLanguage": "string",
  "detectedTargetLanguage": "string",
  "backTranslation": "string"
}

Translation guidelines:
- Preserve the original meaning and context
- Handle Swahili's complex noun class system
- Translate cultural expressions appropriately
- Maintain professional or casual tone as appropriate
- Always respond with valid JSON only`;

  const userPrompt = `Text to translate: """${text}"""
Target: English (if Swahili input) or Swahili (if English input)
Provide accurate translation with cultural context awareness.`;

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
        temperature: 0.3,
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
    const { text, inputType = 'text', direction = 'auto' }: TranslationRequest =
      await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Detect input language
    const detectedLanguage = detectLanguageLocally(text);

    // Try AI translation first
    const aiResult = await callOpenAIForTranslation(text, detectedLanguage, 'English');

    if (aiResult) {
      return NextResponse.json({
        translated: aiResult.translatedText,
        original: text,
        inputType,
        direction: 'swahili-to-english',
        message: 'Translation successful',
        detectedInputLanguage: aiResult.detectedSourceLanguage.toLowerCase(),
        detectedTargetLanguage: aiResult.detectedTargetLanguage.toLowerCase(),
        backTranslation: aiResult.backTranslation,
        confidence: aiResult.detectedSourceLanguage === 'Swahili' ? 0.9 : 0.8,
        timestamp: new Date().toISOString()
      });
    }

    // Fallback translation for demo purposes
    const isSwahili = detectedLanguage === 'Swahili';
    const fallbackTranslation = isSwahili
      ? `[Swahili to English translation of: "${text}"] - This is a demo translation. In production, this would provide an accurate English translation.`
      : `[English to Swahili translation of: "${text}"] - This is a demo translation. In production, this would provide an accurate Swahili translation.`;

    return NextResponse.json({
      translated: fallbackTranslation,
      original: text,
      inputType,
      direction: 'swahili-to-english',
      message: 'Translation completed in demo mode',
      detectedInputLanguage: detectedLanguage.toLowerCase(),
      detectedTargetLanguage: isSwahili ? 'english' : 'swahili',
      backTranslation: null,
      confidence: 0.5,
      warning: 'AI translation unavailable, using demo mode.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Swahili to English translation error:', error);
    return NextResponse.json(
      {
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Swahili to English Translator API',
    description: 'Translate between Swahili and English with AI-powered accuracy',
    usage: {
      endpoint: '/api/swahili-to-english-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction: 'auto (optional, default: auto)'
      }
    },
    features: [
      'Bidirectional Swahili-English translation',
      'Automatic language detection',
      'Cultural context awareness',
      'Swahili noun class system handling',
      'Back-translation verification',
      'Up to 5000 characters per request'
    ],
    supportedLanguages: ['Swahili', 'English'],
    maxTextLength: 5000,
    timestamp: new Date().toISOString()
  });
}