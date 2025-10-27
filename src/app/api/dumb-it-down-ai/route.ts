import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SIMPLIFICATION_PROMPT = `You are "Dumb It Down AI", a tool for simplifying complex text into clear, easy-to-understand language.

TASK:
- Simplify the INPUT text while keeping the meaning intact
- Use simple, everyday words that anyone can understand
- Keep the tone neutral and the structure clear (preserve headings, bullet points, etc.)
- Break down complex sentences into shorter, simpler ones
- Replace jargon and technical terms with plain language
- Maintain the original format and structure as much as possible

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Use active voice when possible
- Aim for 6th-8th grade reading level

OUTPUT:
- Return ONLY the simplified text, nothing else`;

async function simplifyText(text: string): Promise<string> {
  try {
    const { text: simplifiedText } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'system',
          content: SIMPLIFICATION_PROMPT,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return simplifiedText;
  } catch (error) {
    console.error('Error simplifying text:', error);
    throw new Error('Failed to simplify text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
    };
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Perform simplification
    const simplified = await simplifyText(text);

    return NextResponse.json({
      original: text,
      simplified: simplified,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing simplification:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process simplification',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Dumb It Down AI API - Use POST method to simplify text',
      version: '1.0',
      maxLength: 5000,
    },
    { status: 200 }
  );
}
