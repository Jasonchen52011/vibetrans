/**
 * 翻译内容分层器 - 解决22MB bundle问题
 * 核心思路：仅包含必要的翻译，SEO内容通过API异步加载
 */

export interface CoreTranslation {
  title: string;
  description: string;
  hero: {
    title: string;
    description: string;
  };
  tool: {
    inputLabel: string;
    outputLabel: string;
    inputPlaceholder: string;
    outputPlaceholder: string;
    translateButton: string;
    uploadButton?: string;
    loading?: string;
    error?: string;
  };
  ctaButton: string;
}

export interface ExtendedTranslation extends CoreTranslation {
  whatIs: any;
  examples: any;
  howto: any;
  highlights: any;
  funfacts: any;
  userInterest: any;
  testimonials: any;
  faqs: any;
  cta: any;
}

/**
 * 提取核心翻译内容 - 仅包含页面必要字段
 */
export function extractCoreTranslation(fullTranslation: any): CoreTranslation {
  return {
    title: fullTranslation.title || '',
    description: fullTranslation.description || '',
    hero: {
      title: fullTranslation.hero?.title || '',
      description: fullTranslation.hero?.description || '',
    },
    tool: {
      inputLabel: fullTranslation.tool?.inputLabel || 'Input Text',
      outputLabel: fullTranslation.tool?.outputLabel || 'Output Text',
      inputPlaceholder:
        fullTranslation.tool?.inputPlaceholder || 'Enter text...',
      outputPlaceholder:
        fullTranslation.tool?.outputPlaceholder || 'Translation...',
      translateButton: fullTranslation.tool?.translateButton || 'Translate',
      uploadButton: fullTranslation.tool?.uploadButton,
      loading: fullTranslation.tool?.loading,
      error: fullTranslation.tool?.error,
    },
    ctaButton: fullTranslation.ctaButton || 'Try Now',
  };
}

/**
 * 异步加载扩展翻译内容 - SEO内容
 */
export async function loadExtendedTranslation(
  translatorKey: string,
  locale = 'en'
): Promise<Partial<ExtendedTranslation>> {
  try {
    // 这里可以改为API调用或动态导入
    const module = await import(
      `../../messages/pages/${translatorKey}/${locale}.json`
    );
    const fullTranslation = module.default || module;

    // 只返回SEO相关内容
    return {
      whatIs: fullTranslation.whatIs,
      examples: fullTranslation.examples,
      howto: fullTranslation.howto,
      highlights: fullTranslation.highlights,
      funfacts: fullTranslation.funfacts,
      userInterest: fullTranslation.userInterest,
      testimonials: fullTranslation.testimonials,
      faqs: fullTranslation.faqs,
      cta: fullTranslation.cta,
    };
  } catch (error) {
    console.warn(
      `Failed to load extended translation for ${translatorKey}:`,
      error
    );
    return {};
  }
}

/**
 * 优化的翻译加载器 - 仅加载核心内容到bundle
 */
export function createOptimizedTranslationLoader(translatorKey: string) {
  // 返回轻量级的核心翻译内容
  const coreTranslations: Record<string, CoreTranslation> = {
    'minion-translator': {
      title: 'Minion Translator - Translate to Banana Language',
      description:
        'Translate your text to Minion banana language with AI-powered precision.',
      hero: {
        title: 'Best Minion Translator for Banana Language Fun',
        description:
          'Transform your text into hilarious Minion banana language instantly.',
      },
      tool: {
        inputLabel: 'Normal Text',
        outputLabel: 'Minion Text',
        inputPlaceholder: 'Type or paste your text here...',
        outputPlaceholder: 'Your Minion translation will appear here...',
        translateButton: 'Translate to Minion',
        uploadButton: 'Upload File',
        loading: 'Translating...',
        error: 'Translation failed, please try again',
      },
      ctaButton: 'Try Minion Translator',
    },
    'drow-translator': {
      title: 'Drow Translator - AI-Powered Dark Elf Language',
      description:
        'Translate between Drow and 100+ languages with AI-powered precision.',
      hero: {
        title: 'Best Drow Translator for Fantasy Gaming',
        description:
          'Experience accurate Drow translation powered by advanced AI.',
      },
      tool: {
        inputLabel: 'Input Text',
        outputLabel: 'Translated Text',
        inputPlaceholder: 'Enter text to translate...',
        outputPlaceholder: 'Your translation will appear here...',
        translateButton: 'Translate',
        uploadButton: 'Upload File',
        loading: 'Translating...',
        error: 'Translation failed, please try again',
      },
      ctaButton: 'Try Drow Translator',
    },
  };

  return (
    coreTranslations[translatorKey] || coreTranslations['minion-translator']
  );
}
