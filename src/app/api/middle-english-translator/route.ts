import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// Handle GET method for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Middle English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

// Handle OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    // 验证API密钥配置
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error - missing API key' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      text: string;
      direction?: 'modern-to-middle' | 'middle-to-modern';
      dialect?: 'northern' | 'kentish' | 'midlands' | 'general';
      period?: '1150-1300' | '1300-1450' | '1450-1500';
      autoDetect?: boolean;
      detectOnly?: boolean;
    };

    const {
      text,
      direction = 'modern-to-middle',
      dialect = 'general',
      period = '1300-1450',
      autoDetect = true,
      detectOnly = false,
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能语言检测
    let actualDirection = direction;
    let detectionResult = null;

    if (autoDetect) {
      try {
        detectionResult = detectLanguage(text, 'middle-english');

        // 后端日志记录（开发者调试用）
        if (detectionResult.confidence > 0.6) {
          console.log(
            `[Middle English Translator] Language detected: ${detectionResult.detectedLanguage} (confidence: ${(detectionResult.confidence * 100).toFixed(1)}%)`
          );
          console.log(
            `[Middle English Translator] User direction: ${direction} → Final direction: ${actualDirection}`
          );
        }

        // 如果检测到现代英语且当前方向是中古英语到现代英语，自动切换
        if (
          detectionResult.detectedLanguage === 'english' &&
          detectionResult.confidence > 0.6 &&
          direction === 'middle-to-modern'
        ) {
          actualDirection = 'modern-to-middle';
          console.log(
            '[Middle English Translator] Auto-switched: Modern English detected, switching to Modern→Middle English'
          );
        }
        // 如果检测到中古英语且当前方向是现代英语到中古英语，自动切换
        else if (
          detectionResult.detectedLanguage === 'middle-english' &&
          detectionResult.confidence > 0.6 &&
          direction === 'modern-to-middle'
        ) {
          actualDirection = 'middle-to-modern';
          console.log(
            '[Middle English Translator] Auto-switched: Middle English detected, switching to Middle→Modern English'
          );
        }
      } catch (error) {
        console.error('Language detection failed:', error);
        // 继续使用用户指定的方向
      }
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage:
          detectionResult?.detectedLanguage === 'middle-english'
            ? 'middle-english'
            : detectionResult?.detectedLanguage === 'english'
              ? 'english'
              : 'unknown',
        detectedDirection:
          actualDirection === 'middle-to-modern'
            ? 'middle-english-to-en'
            : 'en-to-middle-english',
        confidence: detectionResult?.confidence || 0,
        autoDetected: true,
        languageInfo: {
          detected:
            detectionResult?.detectedLanguage === 'english' ||
            detectionResult?.detectedLanguage === 'middle-english',
          originalDirection: direction,
          finalDirection: actualDirection,
          dialect,
          period,
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
      '1450-1500':
        'Late Middle English (1450-1500, transitioning to Early Modern)',
    };

    let prompt = '';

    if (actualDirection === 'modern-to-middle') {
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
      direction: actualDirection,
      originalDirection: direction,
      dialect,
      period,
      message: 'Translation successful',
      autoDetect,
      detection: detectionResult,
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
