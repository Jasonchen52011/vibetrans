import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 按语系分组的语言池，增加翻译多样性
const LANGUAGE_POOLS = {
  asian: ['zh', 'ja', 'ko', 'th', 'vi', 'ar', 'hi', 'fa'],
  european: ['fr', 'de', 'es', 'it', 'pt', 'nl', 'sv', 'pl', 'ru', 'el'],
  other: ['tr', 'he', 'id', 'ms', 'sw', 'fi', 'da', 'no', 'cs', 'hu'],
};

// 语言相似性矩阵 - 避免相似语言间直接翻译
const SIMILAR_LANGUAGES: Record<string, string[]> = {
  zh: ['ja', 'ko'],
  ja: ['zh', 'ko'],
  ko: ['zh', 'ja'],
  fr: ['es', 'it', 'pt'],
  es: ['fr', 'it', 'pt'],
  it: ['fr', 'es', 'pt'],
  pt: ['fr', 'es', 'it'],
  de: ['nl', 'sv', 'da'],
  nl: ['de', 'sv', 'da'],
  sv: ['de', 'nl', 'da'],
  da: ['de', 'nl', 'sv'],
  ru: ['pl', 'cs'],
  pl: ['ru', 'cs'],
  cs: ['ru', 'pl'],
};

// 混乱度配置
const CHAOS_CONFIG = {
  humor: {
    chainLength: 5,
    diversity: 'medium' as const,
    skipSimilar: false,
    useAllPools: false,
  },
  absurd: {
    chainLength: 8,
    diversity: 'high' as const,
    skipSimilar: true,
    useAllPools: true,
  },
  funny: {
    chainLength: 6,
    diversity: 'medium' as const,
    skipSimilar: false,
    useAllPools: false,
  },
  chaos: {
    chainLength: 12,
    diversity: 'maximum' as const,
    skipSimilar: true,
    useAllPools: true,
  },
};

/**
 * 检查两种语言是否相似，避免相似语言间翻译
 */
function areLanguagesSimilar(lang1: string, lang2: string): boolean {
  return (
    SIMILAR_LANGUAGES[lang1]?.includes(lang2) ||
    SIMILAR_LANGUAGES[lang2]?.includes(lang1)
  );
}

/**
 * 从语言池中获取不重复的多样化语言序列
 */
function getDiverseLanguageSequence(
  length: number,
  diversity: 'low' | 'medium' | 'high' | 'maximum',
  skipSimilar: boolean,
  useAllPools: boolean
): string[] {
  const allLanguages = Object.values(LANGUAGE_POOLS).flat();
  const selectedLanguages: string[] = [];
  const usedPools = new Set<string>();

  // 根据多样性要求决定使用多少个语言池
  const poolCount =
    diversity === 'low'
      ? 1
      : diversity === 'medium'
        ? 2
        : diversity === 'high'
          ? 3
          : Object.keys(LANGUAGE_POOLS).length;

  // 随机选择语言池
  const availablePools = Object.keys(LANGUAGE_POOLS);
  const selectedPools = availablePools
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(poolCount, availablePools.length));

  for (let i = 0; i < length; i++) {
    let candidates: string[] = [];

    if (useAllPools && selectedPools.length > 1) {
      // 从所有选中的池中随机选择
      const pool = selectedPools[i % selectedPools.length];
      candidates = [...LANGUAGE_POOLS[pool as keyof typeof LANGUAGE_POOLS]];
    } else {
      // 从候选池中合并语言
      candidates = selectedPools.flatMap(
        (pool) => LANGUAGE_POOLS[pool as keyof typeof LANGUAGE_POOLS]
      );
    }

    // 过滤已使用的语言（如果需要多样性）
    if (diversity !== 'low') {
      candidates = candidates.filter(
        (lang) => !selectedLanguages.includes(lang)
      );
    }

    // 过滤相似语言
    if (skipSimilar && selectedLanguages.length > 0) {
      const lastLang = selectedLanguages[selectedLanguages.length - 1];
      candidates = candidates.filter(
        (lang) => !areLanguagesSimilar(lastLang, lang)
      );
    }

    // 如果没有候选语言了，重置已使用语言列表
    if (candidates.length === 0) {
      if (useAllPools && selectedPools.length > 0) {
        const pool = selectedPools[i % selectedPools.length];
        candidates = [...LANGUAGE_POOLS[pool as keyof typeof LANGUAGE_POOLS]];
      } else {
        candidates = [...allLanguages];
      }
    }

    // 随机选择一个语言
    const selectedLang = candidates.sort(() => Math.random() - 0.5)[0];
    if (selectedLang) {
      selectedLanguages.push(selectedLang);
    }
  }

  return selectedLanguages;
}

/**
 * 生成真正的多语言接力翻译链
 */
function generateTranslationChain(
  iterations: number,
  style: 'humor' | 'absurd' | 'funny' | 'chaos'
): { chain: string[]; actualSteps: number } {
  const config = CHAOS_CONFIG[style];

  // 确保链长度不超过迭代次数
  const chainLength = Math.min(
    config.chainLength,
    Math.max(3, Math.floor(iterations / 2))
  );

  // 生成多样化的语言序列
  const languageSequence = getDiverseLanguageSequence(
    chainLength,
    config.diversity,
    config.skipSimilar,
    config.useAllPools
  );

  return {
    chain: languageSequence,
    actualSteps: languageSequence.length,
  };
}

/**
 * 增强的翻译函数，包含重试机制和更好的错误处理
 */
async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'auto',
  retryCount = 0
): Promise<{ success: boolean; result: string; detectedLang?: string }> {
  const maxRetries = 2;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      responseStatus: number;
      responseDetails?: string;
      responseData: {
        translatedText: string;
        detectedLanguage?: string;
      };
    };

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed');
    }

    return {
      success: true,
      result: data.responseData.translatedText || text,
      detectedLang: data.responseData.detectedLanguage,
    };
  } catch (error) {
    console.error('Translation error:', error);

    // 重试机制
    if (retryCount < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * (retryCount + 1))
      );
      return translateText(text, targetLang, sourceLang, retryCount + 1);
    }

    return {
      success: false,
      result: text, // 返回原文本
    };
  }
}

/**
 * 执行真正的多语言接力翻译
 */
async function executeBadTranslation(
  text: string,
  chain: string[]
): Promise<{
  result: string;
  translationSteps: Array<{
    from: string;
    to: string;
    success: boolean;
    intermediateResult?: string;
  }>;
}> {
  let currentText = text;
  let currentLang = 'en'; // 假设输入是英文
  const translationSteps: Array<{
    from: string;
    to: string;
    success: boolean;
    intermediateResult?: string;
  }> = [];

  // 逐步翻译
  for (let i = 0; i < chain.length; i++) {
    const targetLang = chain[i];

    // 添加延迟避免速率限制
    if (i > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, 150 + Math.random() * 100)
      );
    }

    const translationResult = await translateText(
      currentText,
      targetLang,
      currentLang
    );

    translationSteps.push({
      from: currentLang,
      to: targetLang,
      success: translationResult.success,
      intermediateResult: translationResult.result,
    });

    if (translationResult.success) {
      currentText = translationResult.result;
      currentLang = targetLang;
    } else {
      // 如果翻译失败，继续使用原文本
      console.warn(
        `Translation failed from ${currentLang} to ${targetLang}, using original text`
      );
    }
  }

  // 最后翻译回英文
  if (currentLang !== 'en') {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const finalResult = await translateText(currentText, 'en', currentLang);

    translationSteps.push({
      from: currentLang,
      to: 'en',
      success: finalResult.success,
      intermediateResult: finalResult.result,
    });

    if (finalResult.success) {
      currentText = finalResult.result;
    }
  }

  return {
    result: currentText,
    translationSteps,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      iterations?: number;
      style?: 'humor' | 'absurd' | 'funny' | 'chaos';
    };

    const { text, iterations = 5, style = 'humor' } = body;

    // 验证输入
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 500 characters.' },
        { status: 400 }
      );
    }

    // 生成翻译链
    const { chain, actualSteps } = generateTranslationChain(iterations, style);

    // 执行翻译
    const { result, translationSteps } = await executeBadTranslation(
      text,
      chain
    );

    return NextResponse.json({
      original: text,
      translated: result,
      chain: chain,
      actualSteps,
      requestedIterations: iterations,
      style: style,
      success: true,
      translationSteps, // 详细的翻译步骤
    });
  } catch (error: any) {
    console.error('Error processing bad translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process translation. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Bad Translator API - Use POST method to translate text',
      version: '2.0',
      supported_styles: ['humor', 'absurd', 'funny', 'chaos'],
      max_iterations: 20,
      language_pools: LANGUAGE_POOLS,
      features: [
        'Multi-language relay translation',
        'Language diversity optimization',
        'Similar language avoidance',
        'Retry mechanism',
        'Detailed translation steps',
      ],
    },
    { status: 200 }
  );
}
