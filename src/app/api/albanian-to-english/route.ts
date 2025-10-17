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
      direction?: 'al-to-en' | 'en-to-al';
      detectOnly?: boolean; // 仅检测语言，不翻译
    };
    const { text, direction, detectOnly = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言（用于信息反馈）
    const detection = detectLanguage(text, 'albanian');
    const { detectedLanguage, suggestedDirection, confidence } = detection;

    // 确定翻译方向：优先使用自动检测，用户可以手动覆盖
    const finalDirection: 'al-to-en' | 'en-to-al' = direction
      ? direction
      : suggestedDirection === 'to-english'
        ? 'al-to-en'
        : 'en-to-al';

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
              : detectedLanguage === 'albanian'
                ? 'Albanian'
                : 'Unknown',
          direction:
            finalDirection === 'al-to-en'
              ? 'Albanian → English'
              : 'English → Albanian',
          confidence: Math.round(confidence * 100),
          explanation: direction
            ? `Manually set to ${finalDirection === 'al-to-en' ? 'Albanian → English' : 'English → Albanian'}`
            : detectedLanguage === 'english'
              ? 'Detected English input, will translate to Albanian'
              : detectedLanguage === 'albanian'
                ? 'Detected Albanian input, will translate to English'
                : 'Language detection uncertain, please input Albanian or English',
        },
      });
    }

    // Determine language pair based on final direction
    const langpair = finalDirection === 'al-to-en' ? 'sq|en' : 'en|sq';

    // Call MyMemory Translation API with retry mechanism
    const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const data = await fetchWithRetry(apiUrl);

    return NextResponse.json({
      translated:
        data.responseData?.translatedText || 'Translation not available',
      original: text,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: !direction,
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
          finalDirection === 'al-to-en'
            ? 'Albanian → English'
            : 'English → Albanian',
        confidence: Math.round(confidence * 100),
        explanation: direction
          ? `Manual translation: ${finalDirection === 'al-to-en' ? 'Albanian → English' : 'English → Albanian'}`
          : detectedLanguage === 'english'
            ? 'Auto-detected English input, translated to Albanian'
            : detectedLanguage === 'albanian'
              ? 'Auto-detected Albanian input, translated to English'
              : 'Translation completed',
      },
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
