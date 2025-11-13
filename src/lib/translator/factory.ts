import type { TranslationTool } from './types';

type TranslatorClass = new () => any;
type TranslatorLoader = () => Promise<TranslatorClass>;

const translatorLoaders = new Map<string, TranslatorLoader>();
const translatorConstructors = new Map<string, TranslatorClass>();
const translatorToolCache = new Map<string, TranslationTool>();

export function registerTranslator(
  toolId: string,
  loader: TranslatorLoader
): void {
  if (!translatorLoaders.has(toolId)) {
    translatorLoaders.set(toolId, loader);
  }
}

async function loadTranslatorClass(toolId: string): Promise<TranslatorClass> {
  if (translatorConstructors.has(toolId)) {
    return translatorConstructors.get(toolId)!;
  }

  const loader = translatorLoaders.get(toolId);
  if (!loader) {
    throw new Error(`Translator not found: ${toolId}`);
  }

  const TranslatorClass = await loader();
  translatorConstructors.set(toolId, TranslatorClass);
  return TranslatorClass;
}

export async function getTranslator(toolId: string): Promise<any> {
  const TranslatorClass = await loadTranslatorClass(toolId);
  return new TranslatorClass();
}

async function ensureToolMetadata(toolId: string): Promise<TranslationTool> {
  if (translatorToolCache.has(toolId)) {
    return translatorToolCache.get(toolId)!;
  }
  const TranslatorClass = await loadTranslatorClass(toolId);
  const instance = new TranslatorClass();
  translatorToolCache.set(toolId, instance.config.tool);
  return instance.config.tool;
}

export async function getAvailableTools(): Promise<TranslationTool[]> {
  const tools: TranslationTool[] = [];
  for (const toolId of translatorLoaders.keys()) {
    try {
      const tool = await ensureToolMetadata(toolId);
      tools.push(tool);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to load tool info for ${toolId}:`, error);
      }
    }
  }
  return tools;
}

export function hasTranslator(toolId: string): boolean {
  return translatorLoaders.has(toolId);
}

export function initializeTranslators(): void {
  if (translatorLoaders.size > 0) {
    return;
  }

  registerTranslator(
    'chinese-english',
    async () =>
      (await import('./translators/chinese-english')).ChineseEnglishTranslator
  );
  registerTranslator(
    'swahili-english',
    async () =>
      (await import('./translators/swahili-english')).SwahiliEnglishTranslator
  );
  registerTranslator(
    'esperanto',
    async () => (await import('./translators/esperanto')).EsperantoTranslator
  );
  registerTranslator(
    'albanian-english',
    async () =>
      (await import('./translators/albanian-english')).AlbanianEnglishTranslator
  );
  registerTranslator(
    'japanese-english',
    async () =>
      (await import('./translators/japanese-english')).JapaneseEnglishTranslator
  );
  registerTranslator(
    'greek-english',
    async () =>
      (await import('./translators/greek-english')).GreekEnglishTranslator
  );
  registerTranslator(
    'english-polish',
    async () =>
      (await import('./translators/english-polish')).EnglishPolishTranslator
  );
  registerTranslator(
    'morse-code',
    async () => (await import('./translators/morse-code')).MorseCodeTranslator
  );
  registerTranslator(
    'dragon-language',
    async () =>
      (await import('./translators/dragon-language')).DragonLanguageTranslator
  );
}

export async function getToolsByCategory(): Promise<
  Record<string, TranslationTool[]>
> {
  const tools = await getAvailableTools();
  const categorized: Record<string, TranslationTool[]> = {
    language: [],
    fictional: [],
    stylistic: [],
  };

  tools.forEach((tool) => {
    categorized[tool.type].push(tool);
  });

  return categorized;
}

export async function searchTools(query: string): Promise<TranslationTool[]> {
  const tools = await getAvailableTools();
  const lowerQuery = query.toLowerCase();

  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.id.toLowerCase().includes(lowerQuery)
  );
}
