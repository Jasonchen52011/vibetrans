import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// 简单的重试函数
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`API attempt ${i + 1} failed:`, error.message);

      if (i === maxRetries) {
        throw error;
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: 'sm-to-en' | 'en-to-sm';
      detectOnly?: boolean; // 仅检测语言，不翻译
    };
    const { text, direction, detectOnly = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言（用于信息反馈）
    const detection = detectLanguage(text, 'samoan');
    const { detectedLanguage, suggestedDirection, confidence } = detection;

    // 确定翻译方向：优先使用自动检测，用户可以手动覆盖
    const finalDirection: 'sm-to-en' | 'en-to-sm' = direction
      ? direction
      : suggestedDirection === 'to-english'
        ? 'sm-to-en'
        : 'en-to-sm';

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'samoan'
                ? 'Samoan'
                : 'Unknown',
          direction:
            finalDirection === 'sm-to-en'
              ? 'Samoan → English'
              : 'English → Samoan',
          confidence: Math.round(confidence * 100),
          explanation: direction
            ? `Manually set to ${finalDirection === 'sm-to-en' ? 'Samoan → English' : 'English → Samoan'}`
            : detectedLanguage === 'english'
              ? 'Detected English input, will translate to Samoan'
              : detectedLanguage === 'samoan'
                ? 'Detected Samoan input, will translate to English'
                : 'Language detection uncertain, please input Samoan or English',
        },
      });
    }

    // 执行翻译
    let translatedText: string;
    const translationSteps: string[] = [];

    if (finalDirection === 'en-to-sm') {
      // 英语 → 萨摩亚语 (使用相关语言对)
      const langpair = 'en|sm';
      const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      const data = await fetchWithRetry(apiUrl);
      translatedText = data.responseData?.translatedText || text;
      translationSteps.push(
        `English → Samoan: "${text}" → "${translatedText}"`
      );
    } else {
      // 萨摩亚语 → 英语
      const langpair = 'sm|en';
      const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      const data = await fetchWithRetry(apiUrl);
      translatedText = data.responseData?.translatedText || text;
      translationSteps.push(
        `Samoan → English: "${text}" → "${translatedText}"`
      );
    }

    return NextResponse.json({
      translated: translatedText,
      original: text,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: !direction,
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'english'
            ? 'English'
            : detectedLanguage === 'samoan'
              ? 'Samoan'
              : 'Unknown',
        direction:
          finalDirection === 'sm-to-en'
            ? 'Samoan → English'
            : 'English → Samoan',
        confidence: Math.round(confidence * 100),
        explanation: direction
          ? `Manual translation: ${finalDirection === 'sm-to-en' ? 'Samoan → English' : 'English → Samoan'}`
          : detectedLanguage === 'english'
            ? 'Auto-detected English input, translated to Samoan'
            : detectedLanguage === 'samoan'
              ? 'Auto-detected Samoan input, translated to English'
              : 'Translation completed',
      },
      translationSteps,
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
