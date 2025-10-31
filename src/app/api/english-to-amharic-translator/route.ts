export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Translation service unavailable' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text, includeTransliteration = false } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model =
      process.env.TRANSLATION_MODEL ||
      process.env.CONTENT_MODEL ||
      'gpt-4o-mini';

    const systemPrompt =
      'You are a professional translator specializing in English ↔ Amharic. Return precise Amharic that respects tone, honorifics, and domain context.';
    const userPrompt = `Translate the following English text into Amharic. Preserve formatting and numbers. Always reply with valid JSON using the schema {"translation": "Amharic text", "transliteration": "Latin transliteration or empty string"}. ${
      includeTransliteration
        ? 'Provide a helpful Latin transliteration.'
        : 'Return an empty string for "transliteration".'
    }

Text:
"""
${text}
"""`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Translation provider error: ${response.status} ${errorBody}`
      );
    }

    const data = await response.json();
    const content =
      data?.choices?.[0]?.message?.content?.trim() ?? '{"translation": ""}';

    let parsed: { translation?: string; transliteration?: string };

    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        parsed = { translation: content };
      }
    }

    const translated = parsed.translation?.trim() ?? '';
    const transliteration = parsed.transliteration?.trim() ?? '';

    if (!translated) {
      throw new Error('Empty translation received from provider');
    }

    return new Response(JSON.stringify({ translated, transliteration }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return new Response(JSON.stringify({ error: 'Translation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
