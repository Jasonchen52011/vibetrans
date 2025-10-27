/**
 * 轻量 Gemini REST 客户端，替代 @google/generative-ai SDK 以缩减打包体积。
 * 仅实现当前项目所需的 generateContent 功能，并保持与原 SDK 相同的调用方式：
 *
 * const genAI = new GoogleGenerativeAI(apiKey);
 * const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
 * const result = await model.generateContent(prompt);
 * const text = result.response.text();
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

type InlineDataPart = {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

type TextPart = {
  text: string;
};

type ContentPart = TextPart | InlineDataPart;

type Content = {
  role: 'user' | 'system' | 'model';
  parts: ContentPart[];
};

type GenerateContentInput =
  | string
  | Content
  | Content[]
  | Array<string | ContentPart>;

interface GeminiModelOptions {
  generationConfig?: GenerationConfig;
  systemInstruction?: string | Content;
  safetySettings?: unknown;
}

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

interface GenerateContentOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  systemInstruction?: string | Content;
  safetySettings?: unknown;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: Content;
  }>;
  promptFeedback?: unknown;
  [key: string]: unknown;
}

class GeminiGenerativeModel {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly defaults: GeminiModelOptions;

  constructor(
    apiKey: string,
    model: string,
    defaults: GeminiModelOptions = {}
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.defaults = defaults;
  }

  async generateContent(
    input: GenerateContentInput,
    options?: GenerateContentOptions
  ): Promise<{
    response: {
      text: () => string;
      raw: GeminiResponse;
    };
    raw: GeminiResponse;
  }> {
    const body: {
      contents: Content[];
      systemInstruction?: Content;
      generationConfig?: GenerationConfig;
      safetySettings?: unknown;
    } = {
      contents: normalizeInput(input),
    };

    const systemInstruction =
      options?.systemInstruction ?? this.defaults.systemInstruction;

    if (systemInstruction) {
      body.systemInstruction = normalizeSystemInstruction(systemInstruction);
    }

    const generationConfig = mergeGenerationConfig(
      this.defaults.generationConfig,
      options
    );
    if (generationConfig) {
      body.generationConfig = generationConfig;
    }

    if (options?.safetySettings || this.defaults.safetySettings) {
      body.safetySettings =
        options?.safetySettings ?? this.defaults.safetySettings;
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as GeminiResponse;

    return {
      raw: data,
      response: {
        raw: data,
        text: () => extractTextFromResponse(data),
      },
    };
  }
}

export class GoogleGenerativeAI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getGenerativeModel(options: {
    model: string;
    generationConfig?: GenerationConfig;
    systemInstruction?: string | Content;
    safetySettings?: unknown;
  }): GeminiGenerativeModel {
    const { model, ...defaults } = options;
    if (!model) {
      throw new Error('Model name is required for Gemini generateContent');
    }
    return new GeminiGenerativeModel(this.apiKey, model, defaults);
  }
}

export type GenerativeModel = GeminiGenerativeModel;

function normalizeInput(input: GenerateContentInput): Content[] {
  if (Array.isArray(input)) {
    // 允许传入完整的 Content 数组
    if (input.length > 0 && isContent(input[0])) {
      return input.filter(isContent) as Content[];
    }

    const parts: ContentPart[] = input.map(convertToPart);
    return [
      {
        role: 'user',
        parts,
      },
    ];
  }

  if (isContent(input)) {
    return [input];
  }

  if (typeof input === 'string') {
    return [
      {
        role: 'user',
        parts: [{ text: input }],
      },
    ];
  }

  throw new Error('Unsupported Gemini input format');
}

function normalizeSystemInstruction(instruction: string | Content): Content {
  if (typeof instruction === 'string') {
    return {
      role: 'system',
      parts: [{ text: instruction }],
    };
  }

  if (isContent(instruction)) {
    return instruction;
  }

  throw new Error('Invalid system instruction format');
}

function mergeGenerationConfig(
  base?: GenerationConfig,
  options?: GenerateContentOptions
): GenerationConfig | undefined {
  if (!options) {
    return base && Object.keys(base).length > 0 ? base : undefined;
  }

  const config: GenerationConfig = {
    ...(base || {}),
  };

  if (typeof options.temperature === 'number') {
    config.temperature = options.temperature;
  }
  if (typeof options.topK === 'number') {
    config.topK = options.topK;
  }
  if (typeof options.topP === 'number') {
    config.topP = options.topP;
  }
  if (typeof options.maxOutputTokens === 'number') {
    config.maxOutputTokens = options.maxOutputTokens;
  }
  if (Array.isArray(options.stopSequences)) {
    config.stopSequences = options.stopSequences;
  }

  return Object.keys(config).length > 0 ? config : undefined;
}

function extractTextFromResponse(data: GeminiResponse): string {
  if (!data?.candidates?.length) {
    return '';
  }

  return data.candidates
    .map(
      (candidate) =>
        candidate?.content?.parts
          ?.map((part) =>
            'text' in part && typeof part.text === 'string' ? part.text : ''
          )
          .join('') ?? ''
    )
    .filter(Boolean)
    .join('\n')
    .trim();
}

function convertToPart(value: string | ContentPart): ContentPart {
  if (typeof value === 'string') {
    return { text: value };
  }

  if (value && typeof value === 'object') {
    if ('inlineData' in value) {
      return value;
    }
    if ('text' in value && typeof value.text === 'string') {
      return { text: value.text };
    }
  }

  throw new Error('Unsupported Gemini content part');
}

function isContent(value: unknown): value is Content {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'role' in (value as Record<string, unknown>) &&
      'parts' in (value as Record<string, unknown>)
  );
}
