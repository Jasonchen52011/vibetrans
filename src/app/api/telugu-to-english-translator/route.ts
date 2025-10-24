import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// 翻译模式定义
const TRANSLATION_MODES = {
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
  },
  general: {
    name: 'General Translation',
    teluguToEnPrompt: `You are a professional Telugu to English translator. Translate the text directly without any explanations or instructions.

Translate the following Telugu text to English:`,
  },
};

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 处理文本翻译 (Telugu → English)
async function translateText(
  text: string,
  mode: TranslationMode = 'general'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];
  const systemPrompt = modeConfig.teluguToEnPrompt;
  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

// 处理反向文本翻译 (English → Telugu)
async function translateEnglishToTelugu(
  text: string,
  mode: TranslationMode = 'general'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  // 根据模式选择不同的反向翻译提示词
  let systemPrompt = '';
  switch (mode) {
    case 'technical':
      systemPrompt = `You are a professional technical translator specializing in English to Telugu translation.

Focus on:
- Technical terminology accuracy in Telugu
- Industry-specific jargon translation
- Clear, precise Telugu language
- Maintaining technical context
- Software, hardware, and engineering terms in Telugu
- Scientific and mathematical expressions in Telugu

Translate the following English text to Telugu with technical precision:`;
      break;
    case 'literary':
      systemPrompt = `You are a literary translator specializing in English to Telugu literary works.

Focus on:
- Preserving cultural nuances in Telugu
- Maintaining literary style and tone in Telugu
- Poetic and artistic expression in Telugu
- Character voice and narrative flow in Telugu
- Cultural references and idioms in Telugu
- Emotional and aesthetic impact in Telugu

Translate the following English literary text to Telugu while preserving its artistic essence:`;
      break;
    case 'business':
      systemPrompt = `You are a professional business translator specializing in English to Telugu business communication.

Focus on:
- Business terminology precision in Telugu
- Formal and professional Telugu language
- Marketing and sales terminology in Telugu
- Financial and economic terms in Telugu
- Corporate communication style in Telugu
- Maintaining business context

Translate the following English business text to Telugu with business accuracy:`;
      break;
    case 'casual':
      systemPrompt = `You are a casual translator specializing in English to Telugu everyday conversation.

Focus on:
- Natural, conversational Telugu tone
- Common expressions and slang in Telugu
- Cultural context in daily life
- Modern usage and trends in Telugu
- Relatable Telugu language
- Maintaining casual atmosphere

Translate the following English casual text to Telugu naturally:`;
      break;
    default:
      systemPrompt = `You are a professional English to Telugu translator. Translate the text directly without any explanations or instructions.

Translate the following English text to Telugu:`;
  }

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

// Handle GET method for health checks
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
    const body = (await request.json()) as {
      text?: string;
      sourceLanguage?: string;
      targetLanguage?: string;
      mode?: TranslationMode;
      detectOnly?: boolean; // 仅检测语言，不翻译
    };

    const {
      text,
      sourceLanguage,
      targetLanguage,
      mode = 'general',
      detectOnly = false,
    } = body;

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 验证翻译模式
    if (!TRANSLATION_MODES[mode]) {
      return NextResponse.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言
    const detection = detectLanguage(text, 'telugu');
    const { detectedLanguage, confidence } = detection;

    // 根据检测结果和用户指定的语言参数，智能确定翻译方向
    let actualSourceLanguage = sourceLanguage;
    let actualTargetLanguage = targetLanguage;
    let translationDirection = 'Telugu → English';
    let shouldTranslate = true;

    // 如果用户没有明确指定语言，则使用自动检测结果
    if (!sourceLanguage || !targetLanguage) {
      if (detectedLanguage === 'telugu') {
        actualSourceLanguage = 'telugu';
        actualTargetLanguage = 'english';
        translationDirection = 'Telugu → English';
      } else if (detectedLanguage === 'english') {
        actualSourceLanguage = 'english';
        actualTargetLanguage = 'telugu';
        translationDirection = 'English → Telugu';
        // 如果检测到英文但期望泰卢固语到英语翻译，给出提示但仍进行翻译
        if (sourceLanguage === 'telugu' && targetLanguage === 'english') {
          shouldTranslate = false;
        }
      } else {
        // 语言检测不确定，使用用户指定或默认值
        actualSourceLanguage = sourceLanguage || 'telugu';
        actualTargetLanguage = targetLanguage || 'english';
        translationDirection = 'Telugu → English';
      }
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        confidence,
        autoDetected: true,
        sourceLanguage: actualSourceLanguage,
        targetLanguage: actualTargetLanguage,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'telugu'
              ? 'Telugu'
              : detectedLanguage === 'english'
                ? 'English'
                : 'Unknown',
          direction: translationDirection,
          confidence: Math.round(confidence * 100),
          explanation:
            detectedLanguage === 'telugu'
              ? 'Auto-detected Telugu input, will translate to English'
              : detectedLanguage === 'english'
                ? 'Auto-detected English input, will translate to Telugu'
                : 'Language detection uncertain, using default translation direction',
        },
      });
    }

    // 如果不应该翻译（比如检测到英文但期望Telugu→English）
    if (!shouldTranslate) {
      return NextResponse.json({
        translated: text,
        original: text,
        mode: mode,
        modeName: TRANSLATION_MODES[mode].name,
        detectedInputLanguage: detectedLanguage,
        confidence,
        autoDetected: true,
        message:
          'No translation needed - input appears to be in target language',
        languageInfo: {
          detected: true,
          detectedLanguage: 'English',
          direction: 'English → Telugu',
          confidence: Math.round(confidence * 100),
          explanation:
            'Detected English input but Telugu → English translation requested',
        },
      });
    }

    // 执行翻译
    let translation: string;
    try {
      if (
        actualSourceLanguage === 'telugu' &&
        actualTargetLanguage === 'english'
      ) {
        // Telugu → English
        translation = await translateText(text, mode);
      } else if (
        actualSourceLanguage === 'english' &&
        actualTargetLanguage === 'telugu'
      ) {
        // English → Telugu (需要实现反向翻译)
        translation = await translateEnglishToTelugu(text, mode);
      } else {
        // 默认 Telugu → English
        translation = await translateText(text, mode);
      }
    } catch (translationError) {
      console.error('Translation processing error:', translationError);
      return NextResponse.json(
        { error: 'Translation processing failed. Please try again.' },
        { status: 500 }
      );
    }

    const result = {
      translated: translation,
      original: text,
      mode: mode,
      modeName: TRANSLATION_MODES[mode].name,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: true,
      sourceLanguage: actualSourceLanguage,
      targetLanguage: actualTargetLanguage,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'telugu'
            ? 'Telugu'
            : detectedLanguage === 'english'
              ? 'English'
              : 'Unknown',
        direction: translationDirection,
        confidence: Math.round(confidence * 100),
        explanation:
          detectedLanguage === 'telugu'
            ? 'Auto-detected Telugu input, translated to English'
            : detectedLanguage === 'english'
              ? actualTargetLanguage === 'telugu'
                ? 'Auto-detected English input, translated to Telugu'
                : 'Detected English input, but Telugu → English requested'
              : 'Translation completed using auto-detection',
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 处理特定的 Gemini 错误
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
