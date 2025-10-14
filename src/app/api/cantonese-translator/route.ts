import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: 'yue-to-en' | 'en-to-yue';
    };
    const { text, direction = 'yue-to-en' } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create direction-specific prompts
    const yueToEnPrompt = `Translate the following Cantonese text to English. Only output the English translation, no explanations:

${text}`;

    const enToYuePrompt = `Translate the following English text to Cantonese (Traditional Chinese with Cantonese characters). Only output the Cantonese translation, no explanations:

${text}`;

    const prompt = direction === 'yue-to-en' ? yueToEnPrompt : enToYuePrompt;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({
      translated: translatedText,
      original: text,
      direction: direction,
      message: 'Translation successful',
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
