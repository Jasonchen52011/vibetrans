import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, prompt, context } = body;

    if (!text && !prompt) {
      return NextResponse.json(
        { error: 'Please provide text or prompt parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build request content
    let requestText;
    if (prompt) {
      // If custom prompt provided, use it
      requestText = prompt;
    } else if (context) {
      // If context provided (like translation language), build complete prompt
      requestText = `${context}\n\nPlease translate the following content. Return ONLY the translation, no prefixes or explanations:\n\n${text}`;
    } else {
      // Default: general translation prompt
      requestText = `Please accurately translate the following text, maintaining the original tone and style. Return ONLY the translation result, no prefixes like "Translation:" or explanations:\n\n${text}`;
    }

    console.log(`[Gemini API] Request content: ${requestText.substring(0, 100)}...`);

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: requestText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Gemini API] Error response: ${errorData}`);
      return NextResponse.json(
        { error: 'Translation service temporarily unavailable' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      console.error(`[Gemini API] No candidate response: ${JSON.stringify(data)}`);
      return NextResponse.json(
        { error: 'Translation failed, please try again later' },
        { status: 500 }
      );
    }

    let result = data.candidates[0].content.parts[0].text;
    console.log(`[Gemini API] Success response: ${result.substring(0, 100)}...`);

    // Clean up response - remove prefixes like "Persian translation of:" or similar patterns
    result = result.trim();

    // Remove common translation prefixes
    const prefixPatterns = [
      /^[^:]*translation of:\s*/i,
      /^[^:]*translation:\s*/i,
      /^Translation:\s*/i,
      /^Translated text:\s*/i,
      /^Result:\s*/i,
      /^\w+ translation of:\s*/i,
      /^\w+ translation:\s*/i,
    ];

    prefixPatterns.forEach(pattern => {
      result = result.replace(pattern, '');
    });

    // Remove surrounding quotes if present
    if ((result.startsWith('"') && result.endsWith('"')) ||
        (result.startsWith("'") && result.endsWith("'"))) {
      result = result.slice(1, -1);
    }

    return NextResponse.json({
      success: true,
      result: result.trim(),
      translated: result.trim(),
    });

  } catch (error) {
    console.error(`[Gemini API] Server error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}