/**
 * Queued Gemini Fetch - 队列化的 Gemini API fetch 请求
 *
 * 用于替换直接的 fetch() 调用，自动加入队列管理
 * 提供并发控制、自动重试、超时保护
 */

import { getGeminiQueueManager } from './gemini-queue-manager';

/**
 * 队列化的 Gemini fetch 请求
 * 直接替换 fetch() 调用，无需大幅改动现有代码
 *
 * @param url - Gemini API URL
 * @param options - fetch 请求选项
 * @param taskName - 任务名称（用于日志和统计）
 * @returns Promise<Response>
 *
 * @example
 * // 之前
 * const response = await fetch(url, options);
 *
 * // 之后
 * const response = await queuedGeminiFetch(url, options, 'my-task');
 */
export async function queuedGeminiFetch(
  url: string,
  options: RequestInit,
  taskName = 'gemini-fetch'
): Promise<Response> {
  const queueManager = getGeminiQueueManager();

  return queueManager.enqueue(async () => {
    const response = await fetch(url, options);

    // 如果是 429 错误，抛出以触发重试
    if (response.status === 429) {
      const errorText = await response.text();
      throw new Error(`rate limit: ${response.status} - ${errorText}`);
    }

    return response;
  }, taskName);
}

/**
 * 构建 Gemini API URL
 *
 * @param model - 模型名称 (默认 gemini-2.0-flash)
 * @param apiKey - API 密钥
 * @returns 完整的 API URL
 */
export function buildGeminiUrl(
  apiKey: string,
  model = 'gemini-2.0-flash'
): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

/**
 * 构建 Gemini 请求体
 *
 * @param prompt - 提示词
 * @param config - 生成配置
 * @returns JSON 字符串格式的请求体
 */
export function buildGeminiRequestBody(
  prompt: string,
  config: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  } = {}
): string {
  return JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 1024,
      topP: config.topP,
      topK: config.topK,
    },
  });
}

/**
 * 解析 Gemini 响应
 *
 * @param response - fetch 响应
 * @returns 解析后的文本内容
 * @throws Error 如果响应无效或解析失败
 */
export async function parseGeminiResponse(response: Response): Promise<string> {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('No valid response from Gemini API');
  }

  return text;
}

/**
 * 一站式队列化 Gemini 调用
 * 封装了 URL 构建、请求体构建、队列执行、响应解析
 *
 * @param prompt - 提示词
 * @param options - 配置选项
 * @returns 解析后的文本响应
 *
 * @example
 * const result = await queuedGeminiCall(
 *   'Translate "Hello" to Chinese',
 *   { taskName: 'chinese-translate', temperature: 0.3 }
 * );
 */
export async function queuedGeminiCall(
  prompt: string,
  options: {
    taskName?: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }

  const url = buildGeminiUrl(apiKey, options.model);
  const body = buildGeminiRequestBody(prompt, {
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    topP: options.topP,
    topK: options.topK,
  });

  const response = await queuedGeminiFetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
    options.taskName || 'gemini-call'
  );

  return parseGeminiResponse(response);
}
