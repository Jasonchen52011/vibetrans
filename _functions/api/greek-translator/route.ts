import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'gr-en' | 'en-gr';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

const TRANSLATION_MODES = {
  modern: {
    name: 'Modern Greek Translation',
    prompt: `You are a professional translator specializing in Modern Greek to English translation.

Focus on:
- Contemporary Greek usage and expressions
- Modern Greek grammar and syntax
- Current cultural references and context
- Everyday language and colloquialisms
- Modern Greek idioms and slang

Translate the following Modern Greek text to natural, contemporary English:`,
  },
  ancient: {
    name: 'Ancient Greek Translation',
    prompt: `You are a classical scholar specializing in Ancient Greek to English translation.

Focus on:
- Classical Greek grammar and syntax
- Historical context and cultural references
- Philosophical and literary terminology
- Mythological references
- Preserving the ancient style and tone

Translate the following Ancient Greek text to English, maintaining classical elements:`,
  },
  literary: {
    name: 'Literary Translation',
    prompt: `You are a literary translator specializing in Greek to English literary works.

Focus on:
- Preserving literary style and artistic expression
- Greek poetry, prose, and drama elements
- Cultural and literary devices
- Metaphors and symbolic language
- Maintaining emotional and aesthetic impact

Translate the following Greek literary text to English while preserving its artistic essence:`,
  },
  general: {
    name: 'General Translation',
    prompt: `You are a professional Greek to English translator. Translate the text directly without any explanations or instructions.

Translate the following Greek text to English:`,
  },
} as const;

type TranslationMode = keyof typeof TRANSLATION_MODES;

type TranslationRequest = {
  text?: string;
  mode?: TranslationMode;
  greekType?: 'modern' | 'ancient';
  direction?: TranslatorDirection;
  detectOnly?: boolean;
};

function detectGreekType(text: string): 'modern' | 'ancient' | 'unknown' {
  const ancientIndicators = [
    'Ἀ',
    'Ἀν',
    'δὲ',
    'γὰρ',
    'μὲν',
    'οὐ',
    'ἔστιν',
    'ἔστι',
    'εἰς',
    'ἐπὶ',
  ];
  const modernIndicators = [
    'και',
    'είναι',
    'όχι',
    'να',
    'το',
    'της',
    'για',
    'με',
    'σε',
    'έχω',
  ];

  const textLower = text.toLowerCase();
  let ancientScore = 0;
  let modernScore = 0;

  ancientIndicators.forEach((indicator) => {
    if (text.includes(indicator)) ancientScore++;
  });

  modernIndicators.forEach((indicator) => {
    if (textLower.includes(indicator)) modernScore++;
  });

  if (ancientScore > modernScore) return 'ancient';
  if (modernScore > ancientScore) return 'modern';
  return 'unknown';
}

async function translateGreekToEnglish(
  text: string,
  mode: TranslationMode = 'general',
  greekType?: 'modern' | 'ancient'
) {
  const modeConfig = TRANSLATION_MODES[mode];
  let systemPrompt = modeConfig.prompt;

  if (greekType === 'ancient' && mode !== 'general') {
    systemPrompt = `This text is in Ancient Greek. ${systemPrompt}`;
  }

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await genAI
    .getGenerativeModel({ model: 'gemini-2.0-flash' })
    .generateContent(fullPrompt);

  return result.response.text().trim();
}

async function translateEnglishToGreek(
  text: string,
  mode: TranslationMode = 'general'
) {
  let systemPrompt: string;

  switch (mode) {
    case 'modern':
      systemPrompt = `You are a professional translator specializing in English to Modern Greek translation.

Focus on:
- Contemporary Greek usage and natural expressions
- Modern Greek grammar and syntax
- Current cultural context
- Everyday language that Greeks actually use
- Proper Greek idioms and colloquialisms

Translate the following English text to natural, contemporary Modern Greek:`;
      break;
    case 'ancient':
      systemPrompt = `You are a classical scholar specializing in English to Ancient Greek translation.

Focus on:
- Classical Greek grammar and syntax
- Ancient Greek vocabulary and style
- Historical context appropriate for ancient texts
- Proper classical Greek structure and forms
- Maintaining ancient Greek literary conventions

Translate the following English text to Ancient Greek:`;
      break;
    case 'literary':
      systemPrompt = `You are a literary translator specializing in English to Greek literary translation.

Focus on:
- Preserving literary style and artistic expression
- Greek literary devices and metaphors
- Cultural and literary context
- Maintaining emotional and aesthetic impact
- Appropriate Greek poetic or prose style

Translate the following English literary text to Greek while preserving its artistic essence:`;
      break;
    default:
      systemPrompt = `You are a professional English to Greek translator. Translate the text directly without any explanations or instructions.

Translate the following English text to Greek:`;
  }

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await genAI
    .getGenerativeModel({ model: 'gemini-2.0-flash' })
    .generateContent(fullPrompt);

  return result.response.text().trim();
}

function determineDirection(
  detectedLanguage: string,
  provided?: TranslatorDirection
): TranslatorDirection {
  if (provided) return provided;
  if (detectedLanguage === 'greek') return 'gr-en';
  if (detectedLanguage === 'english') return 'en-gr';
  return 'gr-en';
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number,
  greekType?: 'modern' | 'ancient' | 'unknown'
) {
  const friendlyLanguage =
    detectedLanguage === 'greek'
      ? 'Greek'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction: direction === 'gr-en' ? 'Greek → English' : 'English → Greek',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'greek'
        ? `Auto-detected ${greekType || 'greek'} input, translated to English`
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Greek'
          : 'Translation completed',
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Greek Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const {
      text,
      mode = 'general',
      greekType,
      direction,
      detectOnly = false,
    } = (await request.json()) as TranslationRequest;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
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

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const detection = detectLanguage(text, 'greek');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectedGreekType = greekType || detectGreekType(text);
    const detectedDirection = determineDirection(detectedLanguage, direction);
    const autoDetected = !direction;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection,
        confidence,
        autoDetected,
        greekType: detectedGreekType,
        languageInfo: buildLanguageInfo(
          detectedLanguage,
          detectedDirection,
          confidence,
          detectedGreekType
        ),
      });
    }

    let translated: string;

    if (detectedDirection === 'gr-en') {
      translated = await translateGreekToEnglish(text, mode, detectedGreekType);
    } else {
      translated = await translateEnglishToGreek(text, mode);
    }

    if (!translated.trim()) {
      throw new Error('Translation returned empty result');
    }

    return NextResponse.json({
      translated: translated.trim(),
      original: text,
      direction: detectedDirection,
      detectedDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected,
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      greekType: detectedGreekType,
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        detectedDirection,
        confidence,
        detectedGreekType
      ),
    });
  } catch (error: any) {
    console.error('Greek translation error:', error);

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
