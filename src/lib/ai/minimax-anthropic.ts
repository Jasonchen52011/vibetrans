/**
 * Minimax Anthropic API 客户端
 * 基于 Minimax 的 Anthropic 兼容 API
 */

import Anthropic from '@anthropic-ai/sdk';

export interface MinimaxAnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface MinimaxTranslationRequest {
  text: string;
  prompt?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MinimaxTranslationResponse {
  success: boolean;
  input: string;
  output: string;
  model: string;
  timestamp: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * Minimax Anthropic API 客户端类
 */
export class MinimaxAnthropicClient {
  private client: Anthropic;
  private config: MinimaxAnthropicConfig;

  constructor(config: MinimaxAnthropicConfig) {
    this.config = {
      baseUrl: 'https://api.minimax.io/anthropic',
      model: 'MiniMax-M2',
      maxTokens: 2048,
      temperature: 0.7,
      ...config,
    };

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  /**
   * 执行翻译任务
   */
  async translate(
    request: MinimaxTranslationRequest
  ): Promise<MinimaxTranslationResponse> {
    try {
      const { text, prompt, systemInstruction, temperature, maxTokens } =
        request;

      if (!text && !prompt) {
        return {
          success: false,
          input: '',
          output: '',
          model: this.config.model!,
          timestamp: new Date().toISOString(),
          error: 'Text or prompt is required',
        };
      }

      // 构建消息内容
      let fullPrompt = '';
      if (systemInstruction) {
        fullPrompt += `${systemInstruction}\n\n`;
      }
      if (prompt) {
        fullPrompt += `${prompt}\n\n`;
      }
      fullPrompt += `输入：${text || prompt}\n\n请直接处理上述内容并返回结果：`;

      // 调用 Minimax Anthropic API
      const response = await this.client.messages.create({
        model: this.config.model!,
        max_tokens: maxTokens || this.config.maxTokens!,
        temperature: temperature || this.config.temperature!,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      // 提取响应内容
      const output = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('')
        .trim();

      return {
        success: true,
        input: text || prompt,
        output,
        model: this.config.model!,
        timestamp: new Date().toISOString(),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens:
            response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      console.error('Minimax Anthropic API error:', error);

      let errorMessage = 'Translation failed';

      if (error.message?.includes('API key') || error.status === 401) {
        errorMessage = 'Invalid API key configuration';
      } else if (
        error.message?.includes('quota') ||
        error.message?.includes('rate limit') ||
        error.status === 429
      ) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message?.includes('content') || error.status === 400) {
        errorMessage = 'Content policy violation. Please modify your input.';
      } else if (error.message?.includes('model') || error.status === 404) {
        errorMessage = 'Model not available or unsupported.';
      }

      return {
        success: false,
        input: request.text || request.prompt || '',
        output: '',
        model: this.config.model!,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'error';
    message: string;
    model?: string;
  }> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model!,
        max_tokens: 10,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      });

      return {
        status: 'healthy',
        message: 'Minimax Anthropic API is accessible',
        model: this.config.model,
      };
    } catch (error: any) {
      console.error('Minimax Anthropic health check failed:', error);
      return {
        status: 'error',
        message: 'Minimax Anthropic API is not accessible',
      };
    }
  }

  /**
   * 获取配置信息
   */
  getConfig(): Omit<MinimaxAnthropicConfig, 'apiKey'> {
    return {
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    };
  }
}

/**
 * 创建默认的 Minimax Anthropic 客户端实例
 */
export function createMinimaxAnthropicClient(): MinimaxAnthropicClient | null {
  const apiKey = process.env.MINIMAX_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('MINIMAX_ANTHROPIC_API_KEY environment variable is not set');
    return null;
  }

  return new MinimaxAnthropicClient({
    apiKey,
    baseUrl:
      process.env.MINIMAX_ANTHROPIC_BASE_URL ||
      'https://api.minimax.io/anthropic',
    model: process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
    maxTokens: Number.parseInt(
      process.env.MINIMAX_ANTHROPIC_MAX_TOKENS || '2048'
    ),
    temperature: Number.parseFloat(
      process.env.MINIMAX_ANTHROPIC_TEMPERATURE || '0.7'
    ),
  });
}

/**
 * 默认客户端实例
 */
export const minimaxAnthropicClient = createMinimaxAnthropicClient();
