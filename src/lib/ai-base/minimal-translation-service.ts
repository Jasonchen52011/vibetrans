/**
 * 轻量级翻译服务 - 专为Cloudflare Pages优化
 */

import { GoogleGenerativeAI } from '@/lib/ai/gemini';

// 最小化配置
const MINIMAL_CONFIGS = {
  'japanese-to-english-translator': {
    prompt: 'Translate the following Japanese text to English: ',
    model: 'gemini-2.0-flash',
  },
  'cantonese-translator': {
    prompt: 'Translate the following Cantonese text to English: ',
    model: 'gemini-2.0-flash',
  },
  // 可以轻松添加更多配置
};

export async function translateWithMinimalBase(request: {
  text: string;
  translator: string;
}) {
  const config =
    MINIMAL_CONFIGS[request.translator as keyof typeof MINIMAL_CONFIGS];
  if (!config) {
    return { success: false, error: 'Unsupported translator' };
  }

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!
    );
    const model = genAI.getGenerativeModel({ model: config.model });

    const result = await model.generateContent(config.prompt + request.text);
    const translated = result.response.text().trim();

    return {
      success: true,
      translated,
      original: request.text,
      translator: request.translator,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      original: request.text,
      translator: request.translator,
    };
  }
}
