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
      direction?: 'creole-to-en' | 'en-to-creole';
      detectOnly?: boolean; // 仅检测语言，不翻译
    };
    const { text, direction, detectOnly = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言（用于信息反馈）
    const detection = detectLanguage(text, 'creole');
    const { detectedLanguage, suggestedDirection, confidence } = detection;

    // 确定翻译方向：优先使用自动检测，用户可以手动覆盖
    const finalDirection: 'creole-to-en' | 'en-to-creole' = direction
      ? direction
      : suggestedDirection === 'to-english'
        ? 'creole-to-en'
        : 'en-to-creole';

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
              : detectedLanguage === 'creole'
                ? 'Haitian Creole'
                : 'Unknown',
          direction:
            finalDirection === 'creole-to-en'
              ? 'Creole → English'
              : 'English → Creole',
          confidence: Math.round(confidence * 100),
          explanation: direction
            ? `Manually set to ${finalDirection === 'creole-to-en' ? 'Creole → English' : 'English → Creole'}`
            : detectedLanguage === 'english'
              ? 'Detected English input, will translate to Creole'
              : detectedLanguage === 'creole'
                ? 'Detected Creole input, will translate to English'
                : 'Language detection uncertain, please input Creole or English',
        },
      });
    }

    // 执行翻译
    let translatedText: string;
    const translationSteps: string[] = [];

    if (finalDirection === 'en-to-creole') {
      // 英语 → 克里奥尔语
      const langpair = 'en|ht';
      const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      const data = await fetchWithRetry(apiUrl);
      translatedText = data.responseData?.translatedText || text;
      translationSteps.push(
        `English → Creole: "${text}" → "${translatedText}"`
      );
    } else {
      // 克里奥尔语 → 英语
      const langpair = 'ht|en';
      const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      const data = await fetchWithRetry(apiUrl);
      translatedText = data.responseData?.translatedText || text;
      translationSteps.push(
        `Creole → English: "${text}" → "${translatedText}"`
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
            : detectedLanguage === 'creole'
              ? 'Haitian Creole'
              : 'Unknown',
        direction:
          finalDirection === 'creole-to-en'
            ? 'Creole → English'
            : 'English → Creole',
        confidence: Math.round(confidence * 100),
        explanation: direction
          ? `Manual translation: ${finalDirection === 'creole-to-en' ? 'Creole → English' : 'English → Creole'}`
          : detectedLanguage === 'english'
            ? 'Auto-detected English input, translated to Creole'
            : detectedLanguage === 'creole'
              ? 'Auto-detected Creole input, translated to English'
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
