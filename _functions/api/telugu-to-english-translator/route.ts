import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'te-en' | 'en-te';

type TranslationMode = 'technical' | 'literary' | 'business' | 'casual' | 'general';

type TranslationRequest = {
  text?: string;
  direction?: TranslatorDirection;
  mode?: TranslationMode;
  detectOnly?: boolean;
};

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

const TRANSLATION_MODES: Record<TranslationMode, { name: string; teluguToEnPrompt: string; enToTeluguPrompt: string }> = {
  technical: {
    name: 'Technical Translation',
    teluguToEnPrompt: `You are a professional technical translator specializing in Telugu to English translation.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Clear, precise language
- Maintaining technical context
- Software, hardware, and engineering terms
- Scientific and mathematical expressions

Translate the following Telugu text to English with technical precision:`,
    enToTeluguPrompt: `You are a professional technical translator specializing in English to Telugu translation.

Focus on:
- Accurate technical terminology in Telugu
- Industry-specific jargon
- Clear and concise Telugu phrasing
- Preserving technical context
- Engineering, software, and scientific vocabulary

Translate the following English text to Telugu with technical precision:`,
  },
  literary: {
    name: 'Literary Translation',
    teluguToEnPrompt: `You are a literary translator specializing in Telugu to English literary works.

Focus on:
- Preserving cultural nuances
- Maintaining literary style and tone
- Poetic and artistic expression
- Character voice and narrative flow
- Cultural references and idioms
- Emotional and aesthetic impact

Translate the following Telugu literary text to English while preserving its artistic essence:`,
    enToTeluguPrompt: `You are a literary translator specializing in English to Telugu literary adaptation.

Focus on:
- Keeping poetic style and emotional tone intact
- Expressive Telugu vocabulary
- Cultural nuance and idioms
- Narrative voice and cadence
- Imagery and metaphors in Telugu context

Translate the following English literary text to Telugu while preserving its artistic impact:`,
  },
  business: {
    name: 'Business Translation',
    teluguToEnPrompt: `You are a professional business translator specializing in Telugu to English business communication.

Focus on:
- Business terminology precision
- Formal and professional language
- Marketing and sales terminology
- Financial and economic terms
- Corporate communication style
- Maintaining business context

Translate the following Telugu business text to English with business accuracy:`,
    enToTeluguPrompt: `You are a professional business translator specializing in English to Telugu corporate communication.

Focus on:
- Formal Telugu vocabulary
- Marketing, finance, and corporate terminology
- Persuasive yet professional tone
- Cultural alignment for Telugu-speaking stakeholders

Translate the following English business text to Telugu with business accuracy:`,
  },
  casual: {
    name: 'Casual Translation',
    teluguToEnPrompt: `You are a casual translator specializing in Telugu to English everyday conversation.

Focus on:
- Natural, conversational tone
- Common expressions and slang
- Cultural context in daily life
- Modern usage and trends
- Relatable language
- Maintaining casual atmosphere

Translate the following Telugu casual text to English naturally:`,
    enToTeluguPrompt: `You are a casual translator specializing in English to Telugu everyday conversation.

Focus on:
- Natural Telugu colloquial expressions
- Friendly and approachable tone
- Cultural references relevant to Telugu speakers
- Modern usage and relatable language

Translate the following English casual text to Telugu naturally:`,
  },
  general: {
    name: 'General Translation',
    teluguToEnPrompt: `You are a translator for a Telugu to English translation service. Your task is to ALWAYS provide an English translation of the input text.

CRITICAL RULES:
- The output must ALWAYS be in English, regardless of input language
- If input is Telugu, translate it to English
- If input is English, rephrase it or provide an English equivalent (do NOT return the same text)
- Never return Telugu text as output
- Never return the exact same input text
- Output must be English only

Translate the following text to English:`,
    enToTeluguPrompt: `You are a professional English to Telugu translator. Translate the text directly without commentary, returning polished Telugu output.`,
  },
};

async function translateTeluguToEnglish(text: string, mode: TranslationMode) {
  const prompt = TRANSLATION_MODES[mode].teluguToEnPrompt;
  const result = await genAI
    .getGenerativeModel({ model: 'gemini-2.0-flash' })
    .generateContent(`${prompt}\n\nTelugu text: "${text}"\n\nEnglish translation:`);

  const content = result.response.text().trim();
  return stripQuotes(content);
}

async function translateEnglishToTelugu(text: string, mode: TranslationMode) {
  const prompt = TRANSLATION_MODES[mode].enToTeluguPrompt;
  const result = await genAI
    .getGenerativeModel({ model: 'gemini-2.0-flash' })
    .generateContent(`${prompt}\n\nEnglish text: "${text}"\n\nTelugu translation:`);

  const content = result.response.text().trim();
  return stripQuotes(content);
}

function stripQuotes(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('“') && value.endsWith('”'))) {
    return value.slice(1, -1);
  }
  return value;
}

function determineDirection(
  detectedLanguage: string,
  provided?: TranslatorDirection
): TranslatorDirection {
  if (provided) return provided;
  if (detectedLanguage === 'english') return 'en-te';
  if (detectedLanguage === 'telugu') return 'te-en';
  return 'te-en';
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'telugu'
      ? 'Telugu'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction: direction === 'te-en' ? 'Telugu → English' : 'English → Telugu',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'telugu'
        ? 'Auto-detected Telugu input, translated to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Telugu'
          : 'Translation completed',
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Telugu to English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const { text, direction, mode = 'general', detectOnly = false } =
      (await request.json()) as TranslationRequest;

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

    const detection = detectLanguage(text, 'telugu');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectedDirection = determineDirection(detectedLanguage, direction);
    const autoDetected = !direction;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection,
        confidence,
        autoDetected,
        languageInfo: buildLanguageInfo(
          detectedLanguage,
          detectedDirection,
          confidence
        ),
      });
    }

    let translated: string;

    if (detectedDirection === 'te-en') {
      translated = await translateTeluguToEnglish(text, mode);
    } else {
      translated = await translateEnglishToTelugu(text, mode);
    }

    if (!translated.trim()) {
      throw new Error('Translation provider returned empty result');
    }

    if (translated.trim().toLowerCase() === text.trim().toLowerCase()) {
      translated += ' (translation adjusted)';
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
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        detectedDirection,
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
