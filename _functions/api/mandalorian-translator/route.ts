import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const MODEL_NAME = 'gemini-2.0-flash';
const DEFAULT_STYLE: MandalorianStyle = 'traditional';

type MandalorianStyle = 'traditional' | 'minimal';

const STYLE_INSTRUCTIONS: Record<MandalorianStyle, string> = {
  traditional: `Adopt the proud warrior cadence of Mandalorians (Mando'a). Use authentic vocabulary, contractions with apostrophes, and decisive phrasing. Keep the meaning faithful, but feel free to reorder sentences so they sound like commands or oaths. Do not add explanations, introductions, or annotations—only the translated Mandalorian text.`,
  minimal: `Translate the text directly into Mandalorian (Mando'a) with minimal embellishment. Preserve the original sentence structure where possible and avoid additional comments, exclamations, or prefixes. Return only the translated Mandalorian wording.`,
};

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function resolveStyle(style?: string): MandalorianStyle {
  if (style === 'minimal') return 'minimal';
  return DEFAULT_STYLE;
}

function buildPrompt(text: string, style: MandalorianStyle): string {
  const instruction = STYLE_INSTRUCTIONS[style];

  return [
    `You are an expert linguist who translates any input into Mandalorian Mando'a speech.`,
    instruction,
    `Always respond with Mandalorian only.`,
    `Input:\n"""${text}"""`,
    `Output:`,
  ].join('\n\n');
}

async function translateWithGemini(
  text: string,
  style: MandalorianStyle
): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Missing Google Generative AI API key');
  }

  const prompt = buildPrompt(text, style);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await model.generateContent([
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ]);

  const responseText = result.response.text().trim();

  if (!responseText) {
    throw new Error('Empty response received from Gemini');
  }

  return responseText;
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Mandalorian Translator API (Gemini 2.0 Flash)',
    provider: 'google-gemini',
    model: MODEL_NAME,
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const { text, style } = (await request.json()) as {
      text?: string;
      style?: MandalorianStyle | string;
    };

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No valid text provided' },
        { status: 400 }
      );
    }

    const resolvedStyle = resolveStyle(style);
    const translated = await translateWithGemini(text, resolvedStyle);

    const originalNormalised = normalise(text.toLowerCase());
    const translatedNormalised = normalise(translated.toLowerCase());
    const isTranslated = translatedNormalised !== originalNormalised;

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Translation successful'
        : 'Minimal changes made - input may already match Mandalorian style',
      translator: {
        name: 'Mandalorian Translator',
        type: 'ai-model',
        provider: 'google-gemini',
        model: MODEL_NAME,
      },
      style: resolvedStyle,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Mandalorian translation error:', error);
    return NextResponse.json(
      {
        error: 'Translation failed',
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
