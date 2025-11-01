import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import SEOContentLoader, { SEOContentRenderer } from '@/components/blocks/seo-content-loader';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { extractCoreTranslation } from '@/lib/translation-split';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import AlienTextGeneratorTool from './AlienTextGeneratorTool';
import './types'; // 导入类型声明

export const runtime = 'edge';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'AlienTextGeneratorPage',
  });
  return constructMetadata({
    title: `${t('title')} | VibeTrans`,
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/alien-text-generator', locale),
    image: t('whatIs.image'),
  });
}

interface AlienTextGeneratorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AlienTextGeneratorPage(
  props: AlienTextGeneratorPageProps
) {
  const params = await props.params;
  const { locale } = params;

  // 使用优化的翻译获取 - 仅加载核心翻译内容
  const t = await getTranslations({
    locale,
    namespace: 'AlienTextGeneratorPage',
  });

  // 提取核心翻译内容，避免加载SEO内容到bundle
  const coreTranslation = extractCoreTranslation({
    AlienTextGeneratorPage: {
      title: t('title'),
      description: t('description'),
      hero: {
        title: t('hero.title'),
        description: t('hero.description'),
      },
      tool: {
        inputLabel: t('tool.inputLabel'),
        outputLabel: t('tool.outputLabel'),
        inputPlaceholder: t('tool.inputPlaceholder'),
        outputPlaceholder: t('tool.outputPlaceholder'),
        translateButton: t('tool.translateButton'),
        uploadButton: t('tool.uploadButton'),
        loading: t('tool.loading'),
        error: t('tool.error'),
      },
      ctaButton: t('ctaButton'),
    }
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Alien Text Generator',
    description: coreTranslation.description,
  });

  // 构建轻量级页面数据
  const pageData = {
    tool: coreTranslation.tool,
  };

  // 默认SEO内容
  function getDefaultSEOContent() {
    return {
      whatIs: {
        title: 'What is Alien Text Generator?',
        description: 'Alien Text Generator is a creative AI tool that transforms your text into fascinating extraterrestrial languages. Perfect for sci-fi fans, game developers, and creative writers looking to add authentic alien flavor to their content!',
        image: {
          src: '/images/docs/alien-text-generator-hero.webp',
          alt: 'Alien text generation illustration',
        },
      },
      examples: {
        title: 'Generation Examples',
        description: 'See how our alien text tool works with real examples.',
        items: [
          {
            alt: 'Normal: Hello Earthlings → Alien: *Zorp glorp bleep*',
            name: 'First Contact',
          },
          {
            alt: 'Normal: We come in peace → Alien: *Vortex harmonics engage*',
            name: 'Peace Message',
          },
          {
            alt: 'Normal: Take me to your leader → Alien: *Quantum signal transmit*',
            name: 'Diplomatic Request',
          },
        ],
      },
      howto: {
        name: 'howto',
        title: 'How to Use',
        subtitle: 'Simple steps to get started',
        description: 'Follow these easy steps to generate alien text.',
        items: [
          {
            title: 'Enter Your Text',
            description: 'Type or paste your message in the input field.',
          },
          {
            title: 'Generate',
            description: 'Press the Generate Alien Text button to process your text.',
          },
          {
            title: 'Get Results',
            description: 'Your alien language will appear instantly.',
          },
          {
            title: 'Copy & Share',
            description: 'Copy the result and share it with friends!',
          },
        ],
      },
      highlights: {
        name: 'highlights',
        title: 'Why Choose Us',
        subtitle: 'Professional translation features',
        description: 'Experience the best alien text tool with advanced features.',
        items: [
          {
            title: 'Fast & Accurate',
            description: 'Get instant translations with high accuracy.',
          },
          {
            title: 'Easy to Use',
            description: 'Simple interface designed for everyone.',
          },
          {
            title: 'Free to Use',
            description: 'No registration or payment required.',
          },
          {
            title: 'Multiple Languages',
            description: 'Support for various languages and dialects.',
          },
        ],
      },
      funFacts: {
        name: 'funfacts',
        title: 'Translation Insights',
        subtitle: 'Learn something new',
        description: 'Learn fascinating facts about translation and language.',
        items: [
          {
            title: 'AI Translation Evolution',
            description: 'Modern AI translation has evolved from simple word replacement to understanding context and nuance.',
          },
        ],
      },
      userInterest: {
        name: 'userInterest',
        title: 'Use Cases',
        subtitle: 'Perfect for everyone',
        description: 'See how people use our translation tool.',
        items: [
          {
            title: 'Business Communication',
            description: 'Professional translation for international business.',
          },
          {
            title: 'Language Learning',
            description: 'Practice and learn new languages effectively.',
          },
        ],
      },
      testimonials: {
        name: 'testimonials',
        title: 'User Reviews',
        subtitle: 'What our users say',
        description: 'Read reviews from our happy users.',
        items: [
          {
            title: 'Amazing Tool!',
            description: 'The translation quality is outstanding and very accurate.',
          },
          {
            title: 'So Much Fun',
            description: 'Easy to use interface and fast translations.',
          },
        ],
      },
      faqs: {
        name: 'faqs',
        title: 'Frequently Asked Questions',
        subtitle: 'Got questions? We have answers.',
        description: 'Find answers to common questions about our translation tool.',
        items: [
          {
            title: 'Is this tool free?',
            description: 'Yes, our translation tool is completely free to use.',
          },
          {
            title: 'How accurate are the translations?',
            description: 'Our AI-powered translations are highly accurate for most use cases.',
          },
          {
            title: 'Can I use this for commercial purposes?',
            description: 'Yes, you can use our translations for personal and commercial purposes.',
          },
          {
            title: 'Do I need to register?',
            description: 'No registration required. Just start translating right away!',
          },
        ],
      },
      cta: {
        title: 'Start Translating Today!',
        description: 'Start translating your text now with our powerful AI translator.',
        primaryButton: 'Start Translating',
        secondaryButton: 'Explore More Tools',
      },
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section */}
        <AuroraBackground className="bg-white dark:bg-zinc-900 !pt-12 !h-auto">
          <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {coreTranslation.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {coreTranslation.hero.description}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {['female3', 'male1', 'female4', 'male2', 'female1'].map(
                  (avatar, i) => (
                    <div
                      key={i}
                      className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden"
                    >
                      <img
                        src={`/images/avatars/${avatar}.webp`}
                        alt={`User ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  from 12,900+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <AlienTextGeneratorTool
            pageData={pageData}
            locale={locale}
          />
        </div>

        {/* SEO Content - 异步加载，不包含在服务器bundle中 */}
        <SEOContentLoader translatorKey="alien-text-generator" locale={locale}>
          <SEOContentRenderer content={getDefaultSEOContent()} />
        </SEOContentLoader>

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Gibberish Translator',
            'Bad Translator',
            'Al Bhed Translator',
            'Ancient Greek Translator',
            'Gen Alpha Translator',
            'Gen Z Translator',
          ]}
        />
      </div>
    </>
  );
}
