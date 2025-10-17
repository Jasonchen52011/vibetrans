// @ts-nocheck - Translation keys type mismatch
import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import CuneiformTranslatorTool from './CuneiformTranslatorTool';

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
  const gt = await getTranslations({
    locale,
    namespace: 'CuneiformTranslatorPage',
  });

  return constructMetadata({
    // @ts-ignore - Translation type mismatch
    title: `${gt('title')} | ${(t as any)('name')}`,
    // @ts-ignore - Translation type mismatch
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/cuneiform-translator', locale),
    image: (t as any)('whatIs.image') || '/images/docs/cuneiform-translator.webp',
  });
}

interface CuneiformTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CuneiformTranslatorPage(
  props: CuneiformTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  // @ts-ignore - Translation keys are dynamic
  const t = await getTranslations({
    locale,
    namespace: 'CuneiformTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VibeTrans Cuneiform Translator',
    applicationCategory: 'UtilityApplication',
    description: (t as any)('description'),
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Sumerian Translation',
      'Akkadian Translation',
      'Babylonian Translation',
      'Bidirectional Translation',
      'File Upload Support',
      'AI-Powered Translation',
    ],
  };

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: (t as any)('tool.inputLabel'),
      cuneiformLabel: (t as any)('tool.cuneiformLabel'),
      outputLabel: (t as any)('tool.outputLabel'),
      inputPlaceholder: (t as any)('tool.inputPlaceholder'),
      cuneiformPlaceholder: (t as any)('tool.cuneiformPlaceholder'),
      outputPlaceholder: (t as any)('tool.outputPlaceholder'),
      translateButton: (t as any)('tool.translateButton'),
      uploadButton: (t as any)('tool.uploadButton'),
      uploadHint: (t as any)('tool.uploadHint'),
      scriptLabel: (t as any)('tool.scriptLabel'),
      scripts: {
        sumerian: (t as any)('tool.scripts.sumerian'),
        akkadian: (t as any)('tool.scripts.akkadian'),
        babylonian: (t as any)('tool.scripts.babylonian'),
      },
      loading: (t as any)('tool.loading'),
      error: (t as any)('tool.error'),
      noInput: (t as any)('tool.noInput'),
    },
  };

  // Examples section data
  const examplesData = {
    title: (t as any)('examples.title'),
    description: (t as any)('examples.description'),
    images: [
      {
        alt: 'Sumerian Cuneiform Translation Example',
        name: 'Sumerian Script',
      },
      {
        alt: 'Akkadian Cuneiform Translation Example',
        name: 'Akkadian Script',
      },
      {
        alt: 'Babylonian Cuneiform Translation Example',
        name: 'Babylonian Script',
      },
      {
        alt: 'Ancient Mesopotamian Text Translation',
        name: 'Mesopotamian Text',
      },
      {
        alt: 'Cuneiform Unicode Characters',
        name: 'Unicode Cuneiform',
      },
      {
        alt: 'Historical Cuneiform Document Translation',
        name: 'Historical Text',
      },
    ],
  };

  // Fun Facts section
  const funFactsSection = {
    name: 'funfacts',
    title: (t as any)('funfacts.title'),
    items: [
      {
        title: (t as any)('funfacts.items.0.title'),
        description: (t as any)('funfacts.items.0.description'),
        image: {
          src: (t as any)('funfacts.items.0.image') || '/images/docs/ancient-written-law.webp',
          alt: (t as any)('funfacts.items.0.imageAlt') || 'Ancient Written Law',
        },
      },
      {
        title: (t as any)('funfacts.items.1.title'),
        description: (t as any)('funfacts.items.1.description'),
        image: {
          src: (t as any)('funfacts.items.1.image') || '/images/docs/multi-purpose-script.webp',
          alt: (t as any)('funfacts.items.1.imageAlt') || 'Multi-Purpose Cuneiform Script',
        },
      },
    ],
  };

  // Highlights section
  const highlightsSection = {
    name: 'highlights',
    title: (t as any)('highlights.title'),
    description: '',
    items: [
      {
        icon: 'FaCheckCircle',
        title: (t as any)('highlights.items.0.title'),
        description: (t as any)('highlights.items.0.description'),
      },
      {
        icon: 'FaKeyboard',
        title: (t as any)('highlights.items.1.title'),
        description: (t as any)('highlights.items.1.description'),
      },
      {
        icon: 'FaBrain',
        title: (t as any)('highlights.items.2.title'),
        description: (t as any)('highlights.items.2.description'),
      },
      {
        icon: 'FaGlobe',
        title: (t as any)('highlights.items.3.title'),
        description: (t as any)('highlights.items.3.description'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: (t as any)('whatIs.title'),
    description: (t as any)('whatIs.description'),
    features: [],
    image: {
      src: (t as any)('whatIs.image') || '/images/docs/what-is-cuneiform-translator.webp',
      alt: (t as any)('whatIs.imageAlt') || 'What is Cuneiform Translator - Ancient Script Translation',
    },
    cta: {
      text: (t as any)('ctaButton'),
    },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: (t as any)('howto.title'),
    description: (t as any)('howto.description'),
    image: {
      src: (t as any)('howto.image') || '/images/docs/cuneiform-translator-how.webp',
      alt: (t as any)('howto.imageAlt') || 'How to use Cuneiform Translator step by step guide',
    },
    items: [
      {
        title: (t as any)('howto.steps.0.title'),
        description: (t as any)('howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: (t as any)('howto.steps.1.title'),
        description: (t as any)('howto.steps.1.description'),
        icon: 'FaGlobe',
      },
      {
        title: (t as any)('howto.steps.2.title'),
        description: (t as any)('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: (t as any)('howto.steps.3.title'),
        description: (t as any)('howto.steps.3.description'),
        icon: 'FaDownload',
      },
    ],
  };

  // User Interest section
  const userInterestSection = {
    name: 'userinterest',
    title: (t as any)('userInterest.title'),
    items: [
      {
        title: (t as any)('userInterest.items.0.title'),
        description: (t as any)('userInterest.items.0.description'),
        image: {
          src: (t as any)('userInterest.items.0.image') || '/images/docs/cuneiform-texts-research.webp',
          alt: (t as any)('userInterest.items.0.imageAlt') || 'Cuneiform Texts in Modern Research',
        },
      },
      {
        title: (t as any)('userInterest.items.1.title'),
        description: (t as any)('userInterest.items.1.description'),
        image: {
          src: (t as any)('userInterest.items.1.image') || '/images/docs/cultural-heritage-preservation.webp',
          alt: (t as any)('userInterest.items.1.imageAlt') || 'Cultural Heritage and Preservation',
        },
      },
      {
        title: (t as any)('userInterest.items.2.title'),
        description: (t as any)('userInterest.items.2.description'),
        image: {
          src: (t as any)('userInterest.items.2.image') || '/images/docs/cuneiform-ai-technology.webp',
          alt: (t as any)('userInterest.items.2.imageAlt') || 'Cuneiform and AI Technology',
        },
      },
      {
        title: (t as any)('userInterest.items.3.title'),
        description: (t as any)('userInterest.items.3.description'),
        image: {
          src: (t as any)('userInterest.items.3.image') || '/images/docs/why-learn-cuneiform.webp',
          alt: (t as any)('userInterest.items.3.imageAlt') || 'Why Learn Cuneiform',
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
          <div className="container max-w-5xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {(t as any)('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {(t as any)('hero.description')}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Avatar Images */}
              <div className="flex -space-x-3">
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male1.webp"
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
                    src="/images/avatars/male2.webp"
                    alt="User 3"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female1.webp"
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
                  from 9,600+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Cuneiform Translator Tool */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <CuneiformTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios
          section={userInterestSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Fun Facts */}
        <UserScenarios
          section={funFactsSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Highlights/Why Choose */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Ancient Greek Translator',
            'Cuneiform Translator',
            'Al Bhed Translator',
            'Esperanto Translator',
            'Gibberish Translator',
            'Gen Z Translator',
          ]}
        />

        {/* Testimonials Section */}
        <TestimonialsSection namespace="CuneiformTranslatorPage.testimonials" />

        {/* FAQ Section */}
        <FaqSection namespace="CuneiformTranslatorPage.faqs" />

        {/* Call to Action */}
        <CallToActionSection namespace="CuneiformTranslatorPage.cta" />
      </div>
    </>
  );
}
