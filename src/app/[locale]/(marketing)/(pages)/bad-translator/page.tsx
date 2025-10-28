import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsThreeColumnSection from '@/components/blocks/testimonials/testimonials-three-column';
import UniqueSection from '@/components/blocks/unique';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import BadTranslatorTool from './BadTranslatorTool';

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
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const bt = await getTranslations({ locale, namespace: 'BadTranslatorPage' });

  return constructMetadata({
    title: `${bt('title')} | ${t('name')}`,
    description: bt('description'),
    canonicalUrl: getUrlWithLocale('/bad-translator', locale),
    image: '/images/docs/what-is-bad-translator.webp',
  });
}

interface BadTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function BadTranslatorPage(props: BadTranslatorPageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'BadTranslatorPage' });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Bad Translator',
    description: t('description'),
  });

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: t('tool.inputLabel'),
      outputLabel: t('tool.outputLabel'),
      inputPlaceholder: t('tool.inputPlaceholder'),
      outputPlaceholder: t('tool.outputPlaceholder'),
      translateButton: t('tool.translateButton'),
      uploadButton: t('tool.uploadButton'),
      uploadHint: t('tool.uploadHint'),
      downloadButton: t('tool.downloadButton'),
      resetButton: t('tool.resetButton'),
      loading: t('tool.loading'),
      error: t('tool.error'),
      noInput: t('tool.noInput'),
      iterationsLabel: t('tool.iterationsLabel'),
      styleLabel: t('tool.styleLabel'),
      styles: {
        humor: t('tool.styles.humor'),
        absurd: t('tool.styles.absurd'),
        funny: t('tool.styles.funny'),
        chaos: t('tool.styles.chaos'),
      },
    },
  };

  // Examples section data
  const examplesData = {
    title: t('examples.title'),
    description: t('examples.description'),
    images: [
      {
        alt: 'Original: Hello → Bad: Greetings from afar',
        name: 'Hello → Greetings from afar',
      },
      {
        alt: 'Original: How are you → Bad: What is your wellness status',
        name: 'How are you → Wellness status',
      },
      {
        alt: 'Original: Good morning → Bad: Pleasant dawn period',
        name: 'Good morning → Pleasant dawn',
      },
      {
        alt: 'Original: Thank you → Bad: Gratitude expression received',
        name: 'Thank you → Gratitude received',
      },
      {
        alt: 'Original: I love you → Bad: Affection emotion transmitted',
        name: 'I love you → Affection transmitted',
      },
      {
        alt: 'Original: Goodbye → Bad: Farewell until next encounter',
        name: 'Goodbye → Next encounter',
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: t('whatIs.title'),
    description: t('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-bad-translator.webp',
      alt: 'What is Bad Translator - Fun Translation Tool',
    },
    cta: {
      text: t('ctaButton'),
    },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: t('howto.title'),
    description: t('howto.description'),
    image: {
      src: '/images/docs/bad-translator-how-to.webp',
      alt: 'How to use Bad Translator step by step guide',
    },
    items: [
      {
        title: t('howto.steps.0.title'),
        description: t('howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: t('howto.steps.1.title'),
        description: t('howto.steps.1.description'),
        icon: 'FaCog',
      },
      {
        title: t('howto.steps.2.title'),
        description: t('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: t('howto.steps.3.title'),
        description: t('howto.steps.3.description'),
        icon: 'FaDownload',
      },
    ],
  };

  // Highlights section
  const highlightsSection = {
    name: 'highlights',
    title: t('highlights.title'),
    description: t('highlights.description'),
    items: [
      {
        icon: 'FaLaughBeam',
        title: t('highlights.items.0.title'),
        description: t('highlights.items.0.description'),
      },
      {
        icon: 'FaRandom',
        title: t('highlights.items.1.title'),
        description: t('highlights.items.1.description'),
      },
      {
        icon: 'FaFileUpload',
        title: t('highlights.items.2.title'),
        description: t('highlights.items.2.description'),
      },
      {
        icon: 'FaDownload',
        title: t('highlights.items.3.title'),
        description: t('highlights.items.3.description'),
      },
    ],
  };

  // Fun Facts section (using UserScenarios component)
  const funFactsSection = {
    name: 'funFacts',
    title: t('funFacts.title'),
    items: [
      {
        title: t('funFacts.items.0.title'),
        description: t('funFacts.items.0.fact'),
        image: {
          src: '/images/docs/fun-and-meme-creation.webp',
          alt: t('funFacts.items.0.title'),
        },
      },
      {
        title: t('funFacts.items.1.title'),
        description: t('funFacts.items.1.fact'),
        image: {
          src: '/images/docs/funfact-languages.webp',
          alt: t('funFacts.items.1.title'),
        },
      },
    ],
  };

  // User Interests section (using UniqueSection)
  const userInterestsSection = {
    name: 'userInterests',
    title: t('userInterests.title'),
    items: [
      {
        title: t('userInterests.sections.0.title'),
        description: t('userInterests.sections.0.content'),
        image: {
          src: '/images/docs/bad-translator-accuracy-concept.webp',
          alt: t('userInterests.sections.0.title'),
        },
      },
      {
        title: t('userInterests.sections.1.title'),
        description: t('userInterests.sections.1.content'),
        image: {
          src: '/images/docs/bad-translator-social-media.webp',
          alt: t('userInterests.sections.1.title'),
        },
      },
      {
        title: t('userInterests.sections.2.title'),
        description: t('userInterests.sections.2.content'),
        image: {
          src: '/images/docs/bad-translator-advertising.webp',
          alt: t('userInterests.sections.2.title'),
        },
      },
      {
        title: t('userInterests.sections.3.title'),
        description: t('userInterests.sections.3.content'),
        image: {
          src: '/images/docs/bad-translator-meme-creators.webp',
          alt: t('userInterests.sections.3.title'),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section with Tool */}
        <AuroraBackground className="bg-white dark:bg-zinc-900 !pt-12 !h-auto">
          <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('hero.description')}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Avatar Images */}
              <div className="flex -space-x-3">
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male2.webp"
                    alt="User 1"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female3.webp"
                    alt="User 2"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male1.webp"
                    alt="User 3"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female4.webp"
                    alt="User 4"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male4.webp"
                    alt="User 5"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Stars and Text */}
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
                  from 8,700+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Bad Translator Tool */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <BadTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* Fun Facts Section */}
        <UserScenarios section={funFactsSection} ctaText={t('ctaButton')} />

        {/* User Interests Section */}
        <UniqueSection
          section={userInterestsSection}
          ctaText={t('ctaButton')}
        />

        {/* Highlights/Why Choose */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Gibberish Translator',
            'Dog Translator',
            'Gen Z Translator',
            'Gen Alpha Translator',
            'Ancient Greek Translator',
            'Alien Text Generator',
          ]}
        />

        {/* Testimonials Section */}
        <TestimonialsThreeColumnSection namespace="BadTranslatorPage.testimonials" />

        {/* FAQ Section */}
        <FaqSection namespace="BadTranslatorPage.faqs" />

        {/* Call to Action */}
        <CallToActionSection namespace="BadTranslatorPage.cta" />
      </div>
    </>
  );
}
