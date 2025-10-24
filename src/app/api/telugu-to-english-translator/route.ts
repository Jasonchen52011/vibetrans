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
    teluguToEnPrompt: `You are a translator for a Telugu to English translation service. Your task is to ALWAYS provide an English translation of the input text.

CRITICAL RULES:
- The output must ALWAYS be in English, regardless of input language
- If input is Telugu, translate it to English
- If input is English, rephrase it or provide an English equivalent (do NOT return the same text)
- Never return Telugu text as output
- Never return the exact same input text
- Output must be English only

Example:
Input: "నేను బాగున్నాను" → Output: "I am fine"
Input: "Hello world" → Output: "Hello everyone in this world" or similar English rephrasing

Translate the following text to English:`,
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
  const fullPrompt = `${systemPrompt}\n\nTelugu text: "${text}"\n\nEnglish translation:`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  let translatedText = response.text().trim();

  // Remove quotes if present
  if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
    translatedText = translatedText.slice(1, -1);
  }

  return translatedText;
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

  const fullPrompt = `${systemPrompt}\n\nEnglish text: "${text}"\n\nTelugu translation:`;

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

    // 智能翻译逻辑 - 根据检测结果选择翻译方向
    let actualSourceLanguage: string;
    let actualTargetLanguage: string;
    let translationDirection: string;
    let translation: string;

    // 根据检测结果确定翻译方向
    if (detectedLanguage === 'english') {
      // 英语输入，翻译成泰卢固语
      actualSourceLanguage = 'english';
      actualTargetLanguage = 'telugu';
      translationDirection = 'English → Telugu';
    } else if (detectedLanguage === 'telugu') {
      // 泰卢固语输入，翻译成英语
      actualSourceLanguage = 'telugu';
      actualTargetLanguage = 'english';
      translationDirection = 'Telugu → English';
    } else {
      // 未知语言，假设为泰卢固语处理
      actualSourceLanguage = 'telugu';
      actualTargetLanguage = 'english';
      translationDirection = 'Assumed Telugu → English';
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
                : 'Language detection uncertain, will attempt Telugu to English translation',
        },
      });
    }

    // 执行翻译 - 根据检测结果选择翻译方向
    try {
      if (detectedLanguage === 'english') {
        // 英语 → 泰卢固语
        translation = await translateEnglishToTelugu(text, mode);
      } else {
        // 泰卢固语 → 英语（包括未知语言的情况）
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
      actualTranslationDirection: translationDirection,
      message: 'Translation successful',
      status: 'success',
      timestamp: new Date().toISOString(),
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
              ? 'Auto-detected English input, translated to Telugu'
              : `Language detection uncertain, attempted ${translationDirection}`,
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
