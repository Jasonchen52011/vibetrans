import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
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
    sqToEnPrompt: `You are a professional technical translator specializing in Albanian to English translation.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Clear, precise language
- Maintaining technical context
- Software, hardware, and engineering terms
- Scientific and mathematical expressions

Translate the following Albanian text to English with technical precision:`,
    enToSqPrompt: `You are a professional technical translator specializing in English to Albanian translation.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Clear, precise language
- Maintaining technical context
- Software, hardware, and engineering terms
- Scientific and mathematical expressions

Translate the following English text to Albanian with technical precision:`,
  },
  legal: {
    name: 'Legal Translation',
    sqToEnPrompt: `You are a certified legal translator specializing in Albanian to English legal document translation.

Focus on:
- Legal terminology precision
- Formal legal language structure
- Contract and statute terminology
- Preserving legal meaning and intent
- Court and regulatory language
- Maintaining legal formality

Translate the following Albanian legal text to English with legal accuracy:`,
    enToSqPrompt: `You are a certified legal translator specializing in English to Albanian legal document translation.

Focus on:
- Legal terminology precision
- Formal legal language structure
- Contract and statute terminology
- Preserving legal meaning and intent
- Court and regulatory language
- Maintaining legal formality

Translate the following English legal text to Albanian with legal accuracy:`,
  },
  literary: {
    name: 'Literary Translation',
    sqToEnPrompt: `You are a literary translator specializing in Albanian to English literary works.

Focus on:
- Preserving cultural nuances
- Maintaining literary style and tone
- Poetic and artistic expression
- Character voice and narrative flow
- Cultural references and idioms
- Emotional and aesthetic impact

Translate the following Albanian literary text to English while preserving its artistic essence:`,
    enToSqPrompt: `You are a literary translator specializing in English to Albanian literary works.

Focus on:
- Preserving cultural nuances
- Maintaining literary style and tone
- Poetic and artistic expression
- Character voice and narrative flow
- Cultural references and idioms
- Emotional and aesthetic impact

Translate the following English literary text to Albanian while preserving its artistic essence:`,
  },
  idioms: {
    name: 'Idioms & Slang Translation',
    sqToEnPrompt: `You are a cultural linguistics expert specializing in Albanian idioms, slang, and colloquial expressions.

Focus on:
- Albanian idioms and their meanings
- Modern slang and internet language
- Cultural context and explanations
- Equivalent English expressions
- Regional dialects and variations
- Providing both literal and contextual translations

Translate the following Albanian text to English, explaining idioms and slang:`,
    enToSqPrompt: `You are a cultural linguistics expert specializing in English idioms, slang, and colloquial expressions.

Focus on:
- English idioms and their meanings
- Modern slang and internet language
- Cultural context and explanations
- Equivalent Albanian expressions
- Regional dialects and variations
- Providing both literal and contextual translations

Translate the following English text to Albanian, explaining idioms and slang:`,
  },
  general: {
    name: 'General Translation',
    sqToEnPrompt: `You are a professional Albanian to English translator. Translate the text directly without any explanations or instructions.

Translate the following Albanian text to English:`,
    enToSqPrompt: `You are a professional English to Albanian translator. Translate the text directly without any explanations or instructions. Only output the Albanian translation.

Translate the following English text to Albanian:`,
  },
};

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 支持的图片 MIME 类型
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Base64 转换辅助函数
function base64ToBuffer(base64: string): Uint8Array {
  // 移除 data URL 前缀（如果有）
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// 处理文本翻译
async function translateText(
  text: string,
  mode: TranslationMode,
  direction: 'sq-to-en' | 'en-to-sq'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];

  // 根据方向选择正确的 prompt
  const systemPrompt =
    direction === 'sq-to-en'
      ? modeConfig.sqToEnPrompt
      : modeConfig.enToSqPrompt;

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text();
}

// 处理图片 OCR + 翻译
async function translateImage(
  imageData: string,
  mimeType: string,
  mode: TranslationMode,
  direction: 'sq-to-en' | 'en-to-sq' = 'sq-to-en'
): Promise<{
  extractedText: string;
  translation: string;
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];

  // 根据方向选择正确的 prompt
  const systemPrompt =
    direction === 'sq-to-en'
      ? modeConfig.sqToEnPrompt
      : modeConfig.enToSqPrompt;

  // 根据方向构建多模态提示
  const sourceLanguage = direction === 'sq-to-en' ? 'Albanian' : 'English';
  const targetLanguage = direction === 'sq-to-en' ? 'English' : 'Albanian';

  const prompt = `First, extract all ${sourceLanguage} text from this image (menu, sign, comic, document, etc.).
Then, ${systemPrompt}

Please provide your response in this format:
[EXTRACTED TEXT]
(${sourceLanguage} text from the image)

[TRANSLATION]
(${targetLanguage} translation based on the ${modeConfig.name} style)

[CONTEXT]
(Brief explanation of any cultural references or special terms if applicable)`;

  // 准备图片数据
  const imageBuffer = base64ToBuffer(imageData);

  // 发送多模态请求
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: Buffer.from(imageBuffer).toString('base64'),
        mimeType: mimeType,
      },
    },
  ]);

  const response = result.response;
  const fullText = response.text();

  // 解析响应
  const extractedMatch = fullText.match(
    /\[EXTRACTED TEXT\]\n([\s\S]*?)\n\[TRANSLATION\]/
  );
  const translationMatch = fullText.match(
    /\[TRANSLATION\]\n([\s\S]*?)(?:\n\[CONTEXT\]|$)/
  );

  const extractedText = extractedMatch ? extractedMatch[1].trim() : '';
  const translation = translationMatch ? translationMatch[1].trim() : fullText;

  return {
    extractedText,
    translation,
  };
}

// 处理语音转文字 + 翻译
async function translateAudio(
  audioData: string,
  mimeType: string,
  mode: TranslationMode,
  direction: 'sq-to-en' | 'en-to-sq' = 'sq-to-en'
): Promise<{
  transcription: string;
  translation: string;
}> {
  // 注意：Gemini 2.0 Flash 支持音频输入
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];

  // 根据方向选择正确的 prompt
  const systemPrompt =
    direction === 'sq-to-en'
      ? modeConfig.sqToEnPrompt
      : modeConfig.enToSqPrompt;

  // 根据方向构建音频处理提示
  const sourceLanguage = direction === 'sq-to-en' ? 'Albanian' : 'English';
  const targetLanguage = direction === 'sq-to-en' ? 'English' : 'Albanian';

  const prompt = `Listen to this ${sourceLanguage} audio and:
1. Transcribe the ${sourceLanguage} speech to text
2. ${systemPrompt}

Please provide your response in this format:
[TRANSCRIPTION]
(${sourceLanguage} text from the audio)

[TRANSLATION]
(${targetLanguage} translation based on the ${modeConfig.name} style)`;

  // 准备音频数据
  const audioBuffer = base64ToBuffer(audioData);

  // 发送多模态请求（包含音频）
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: Buffer.from(audioBuffer).toString('base64'),
        mimeType: mimeType,
      },
    },
  ]);

  const response = result.response;
  const fullText = response.text();

  // 解析响应
  const transcriptionMatch = fullText.match(
    /\[TRANSCRIPTION\]\n([\s\S]*?)\n\[TRANSLATION\]/
  );
  const translationMatch = fullText.match(/\[TRANSLATION\]\n([\s\S]*?)$/);

  const transcription = transcriptionMatch ? transcriptionMatch[1].trim() : '';
  const translation = translationMatch ? translationMatch[1].trim() : fullText;

  return {
    transcription,
    translation,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      imageData?: string;
      imageMimeType?: string;
      audioData?: string;
      audioMimeType?: string;
      mode?: TranslationMode;
      direction?: 'sq-to-en' | 'en-to-sq';
      inputType: 'text' | 'image' | 'audio';
      detectOnly?: boolean; // 仅检测语言，不翻译
    };

    const {
      text,
      imageData,
      imageMimeType,
      audioData,
      audioMimeType,
      mode = 'general',
      direction,
      inputType,
      detectOnly = false,
    } = body;

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      }
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

    let result: any = {};

    // 根据输入类型处理
    switch (inputType) {
      case 'text':
        if (!text) {
          return NextResponse.json(
            { error: 'No text provided' },
            { status: 400 }
          );
        }

        // 智能检测输入语言（用于信息反馈）
        const detection = detectLanguage(text, 'albanian');
        const { detectedLanguage, suggestedDirection, confidence } = detection;

        // 确定翻译方向：优先使用自动检测，用户可以手动覆盖
        let finalDirection: 'sq-to-en' | 'en-to-sq';

        if (direction) {
          // 用户手动指定了方向
          finalDirection = direction;
        } else {
          // 根据检测结果自动确定方向
          if (detectedLanguage === 'english') {
            finalDirection = 'en-to-sq'; // 检测到英文，翻译成阿尔巴尼亚语
          } else if (detectedLanguage === 'albanian') {
            finalDirection = 'sq-to-en'; // 检测到阿尔巴尼亚语，翻译成英文
          } else {
            // 检测不确定时，使用建议的方向
            finalDirection =
              suggestedDirection === 'to-english' ? 'sq-to-en' : 'en-to-sq';
          }
        }

        // 如果只是检测语言，返回检测结果
        if (detectOnly) {
          return NextResponse.json({
            detectedInputLanguage: detectedLanguage,
            detectedDirection: finalDirection,
            confidence,
            autoDetected: true, // 对于detectOnly请求，总是标记为自动检测
            languageInfo: {
              detected: true,
              detectedLanguage:
                detectedLanguage === 'english'
                  ? 'English'
                  : detectedLanguage === 'albanian'
                    ? 'Albanian'
                    : 'Unknown',
              direction:
                finalDirection === 'sq-to-en'
                  ? 'Albanian → English'
                  : 'English → Albanian',
              confidence: Math.round(confidence * 100),
              explanation:
                detectedLanguage === 'english'
                  ? 'Detected English input, will translate to Albanian'
                  : detectedLanguage === 'albanian'
                    ? 'Detected Albanian input, will translate to English'
                    : 'Language detection uncertain, please input Albanian or English',
            },
          });
        }

        const translation = await translateText(text, mode, finalDirection);
        result = {
          translated: translation,
          original: text,
          mode: mode,
          modeName: TRANSLATION_MODES[mode].name,
          direction: finalDirection,
          detectedInputLanguage: detectedLanguage,
          confidence,
          autoDetected: !direction,
          inputType: 'text',
          message: 'Translation successful',
          languageInfo: {
            detected: true,
            detectedLanguage:
              detectedLanguage === 'english'
                ? 'English'
                : detectedLanguage === 'albanian'
                  ? 'Albanian'
                  : 'Unknown',
            direction:
              finalDirection === 'sq-to-en'
                ? 'Albanian → English'
                : 'English → Albanian',
            confidence: Math.round(confidence * 100),
            explanation: direction
              ? `Manual translation: ${finalDirection === 'sq-to-en' ? 'Albanian → English' : 'English → Albanian'}`
              : detectedLanguage === 'english'
                ? 'Auto-detected English input, translated to Albanian'
                : detectedLanguage === 'albanian'
                  ? 'Auto-detected Albanian input, translated to English'
                  : 'Translation completed',
          },
        };
        break;

      case 'image':
        if (!imageData || !imageMimeType) {
          return NextResponse.json(
            { error: 'No image data provided' },
            { status: 400 }
          );
        }
        if (!SUPPORTED_IMAGE_TYPES.includes(imageMimeType)) {
          return NextResponse.json(
            {
              error: `Unsupported image type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`,
            },
            { status: 400 }
          );
        }
        const imageResult = await translateImage(
          imageData,
          imageMimeType,
          mode,
          direction
        );
        result = {
          translated: imageResult.translation,
          extractedText: imageResult.extractedText,
          mode: mode,
          modeName: TRANSLATION_MODES[mode].name,
          direction: direction,
          inputType: 'image',
          message: 'Image processed and translated successfully',
        };
        break;

      case 'audio':
        if (!audioData || !audioMimeType) {
          return NextResponse.json(
            { error: 'No audio data provided' },
            { status: 400 }
          );
        }
        const audioResult = await translateAudio(
          audioData,
          audioMimeType,
          mode,
          direction
        );
        result = {
          translated: audioResult.translation,
          transcription: audioResult.transcription,
          mode: mode,
          modeName: TRANSLATION_MODES[mode].name,
          direction: direction,
          inputType: 'audio',
          message: 'Audio transcribed and translated successfully',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid input type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }

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
