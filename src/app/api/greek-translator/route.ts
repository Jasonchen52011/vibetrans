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
  modern: {
    name: 'Modern Greek Translation',
    prompt: `You are a professional translator specializing in Modern Greek to English translation.

Focus on:
- Contemporary Greek usage and expressions
- Modern Greek grammar and syntax
- Current cultural references and context
- Everyday language and colloquialisms
- Modern Greek idioms and slang

Translate the following Modern Greek text to natural, contemporary English:`,
  },
  ancient: {
    name: 'Ancient Greek Translation',
    prompt: `You are a classical scholar specializing in Ancient Greek to English translation.

Focus on:
- Classical Greek grammar and syntax
- Historical context and cultural references
- Philosophical and literary terminology
- Mythological references
- Preserving the ancient style and tone

Translate the following Ancient Greek text to English, maintaining classical elements:`,
  },
  literary: {
    name: 'Literary Translation',
    prompt: `You are a literary translator specializing in Greek to English literary works.

Focus on:
- Preserving literary style and artistic expression
- Greek poetry, prose, and drama elements
- Cultural and literary devices
- Metaphors and symbolic language
- Maintaining emotional and aesthetic impact

Translate the following Greek literary text to English while preserving its artistic essence:`,
  },
  general: {
    name: 'General Translation',
    prompt: `You are a professional Greek to English translator. Translate the text directly without any explanations or instructions.

Translate the following Greek text to English:`,
  },
};

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 检测希腊语类型（现代vs古代）
function detectGreekType(text: string): 'modern' | 'ancient' | 'unknown' {
  // 简化的检测逻辑 - 实际应用中可能需要更复杂的分析
  const ancientIndicators = [
    'Ἀ',
    'Ἀν',
    'δὲ',
    'γὰρ',
    'μὲν',
    'οὐ',
    'ἔστιν',
    'ἔστι',
    'εἰς',
    'ἐπὶ',
  ];
  const modernIndicators = [
    'και',
    'είναι',
    'όχι',
    'να',
    'το',
    'της',
    'για',
    'με',
    'σε',
    'είναι',
    'έχω',
  ];

  const textLower = text.toLowerCase();
  let ancientScore = 0;
  let modernScore = 0;

  ancientIndicators.forEach((indicator) => {
    if (text.includes(indicator)) ancientScore++;
  });

  modernIndicators.forEach((indicator) => {
    if (textLower.includes(indicator)) modernScore++;
  });

  if (ancientScore > modernScore) return 'ancient';
  if (modernScore > ancientScore) return 'modern';
  return 'unknown';
}

// 处理文本翻译
async function translateText(
  text: string,
  mode: TranslationMode = 'general',
  greekType?: 'modern' | 'ancient'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];
  let systemPrompt = modeConfig.prompt;

  // 如果是古代希腊语且不是general模式，添加额外信息
  if (greekType === 'ancient' && mode !== 'general') {
    systemPrompt = `This text is in Ancient Greek. ${systemPrompt}`;
  }

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Greek Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: TranslationMode;
      greekType?: 'modern' | 'ancient';
      detectOnly?: boolean;
    };

    const { text, mode = 'general', greekType, detectOnly = false } = body;

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
    const detection = detectLanguage(text, 'greek');
    const { detectedLanguage, confidence } = detection;

    // 自动检测希腊语类型
    const detectedGreekType = greekType || detectGreekType(text);

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedGreekType,
        confidence,
        autoDetected: true,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'greek'
              ? 'Greek'
              : detectedLanguage === 'english'
                ? 'English'
                : 'Unknown',
          greekType: detectedGreekType,
          direction:
            detectedLanguage === 'greek' ? 'Greek → English' : 'Unknown',
          confidence: Math.round(confidence * 100),
          explanation:
            detectedLanguage === 'greek'
              ? `Detected ${detectedGreekType} Greek input, will translate to English`
              : detectedLanguage === 'english'
                ? 'Detected English input'
                : 'Language detection uncertain, please input Greek text',
        },
      });
    }

    // 执行翻译
    const translation = await translateText(text, mode, detectedGreekType);

    const isTranslated = translation !== text;

    const result = {
      translated: translation,
      original: text,
      isTranslated,
      message: isTranslated ? 'Translation successful' : 'No translation needed',
      translator: {
        name: 'Greek Translator',
        type: 'bilingual'
      },
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      greekType: detectedGreekType,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: true,
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'greek'
            ? 'Greek'
            : detectedLanguage === 'english'
              ? 'English'
              : 'Unknown',
        greekType: detectedGreekType,
        direction: 'Greek → English',
        confidence: Math.round(confidence * 100),
        explanation:
          detectedLanguage === 'greek'
            ? `Auto-detected ${detectedGreekType} Greek input, translated to English`
            : detectedLanguage === 'english'
              ? 'Detected English input'
              : 'Translation completed',
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Greek translation error:', error);

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
