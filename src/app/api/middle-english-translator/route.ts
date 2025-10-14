import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: 'modern-to-middle' | 'middle-to-modern';
      dialect?: 'northern' | 'kentish' | 'midlands' | 'general';
      period?: '1150-1300' | '1300-1450' | '1450-1500';
    };

    const {
      text,
      direction = 'modern-to-middle',
      dialect = 'general',
      period = '1300-1450',
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Construct dialect-specific and period-specific prompts
    const dialectInfo = {
      northern: 'Northern Middle English (Yorkshire, Durham)',
      kentish: 'Kentish Middle English (Kent, Southeast England)',
      midlands: 'East Midlands Middle English (basis of modern English)',
      general: 'General Middle English',
    };

    const periodInfo = {
      '1150-1300': 'Early Middle English (1150-1300)',
      '1300-1450': 'Classical Middle English (1300-1450, Chaucer era)',
      '1450-1500': 'Late Middle English (1450-1500, transitioning to Early Modern)',
    };

    let prompt = '';

    if (direction === 'modern-to-middle') {
      prompt = `You are an expert Middle English translator specializing in ${dialectInfo[dialect]} from the ${periodInfo[period]} period.

Translate the following Modern English text to authentic Middle English. Follow these rules strictly:

1. **Vocabulary**: Use period-appropriate Middle English words
   - "knight" → "knyght"
   - "church" → "chirche"
   - "through" → "thurgh"
   - "enough" → "ynough"

2. **Grammar**:
   - Use "ye" (you plural/formal), "thou" (you singular informal)
   - Verb endings: -eth (3rd person), -en (plural)
   - Past tense often adds -ed/-de

3. **Spelling**: Use Middle English orthography
   - "gh" for throat sounds
   - "y" for "i" in many words
   - Double vowels (aa, ee, oo)

4. **Style**: Match the ${period} period's linguistic features

Text to translate:
"${text}"

Provide ONLY the Middle English translation, no explanations.`;
    } else {
      // middle-to-modern
      prompt = `You are an expert Middle English scholar. Translate the following Middle English text to clear, natural Modern English.

Context: This text is from ${periodInfo[period]}, ${dialectInfo[dialect]} dialect.

Guidelines:
1. Preserve the original meaning and tone
2. Update archaic vocabulary to modern equivalents
3. Modernize grammar while keeping the style natural
4. Provide a fluent, readable translation

Middle English text:
"${text}"

Provide ONLY the Modern English translation, no explanations or notes.`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translated = response.text().trim();

    return NextResponse.json({
      translated,
      original: text,
      direction,
      dialect,
      period,
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
