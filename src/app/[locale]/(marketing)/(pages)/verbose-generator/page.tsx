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
import VerboseGeneratorTool from './VerboseGeneratorTool';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const gt = await getTranslations({
    locale,
    namespace: 'VerboseGeneratorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${(t as any)('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/verbose-generator', locale),
    image: '/images/docs/what-is-verbose-generator.webp',
  });
}

interface VerboseGeneratorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function VerboseGeneratorPage(
  props: VerboseGeneratorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'VerboseGeneratorPage',
  });

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VibeTrans Verbose Generator',
    applicationCategory: 'UtilityApplication',
    description: (t as any)('description'),
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Text Translation',
      'File Upload Support',
      'Instant Translation',
    ],
  };

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: (t as any)('tool.inputLabel'),
      outputLabel: (t as any)('tool.outputLabel'),
      inputPlaceholder: (t as any)('tool.inputPlaceholder'),
      outputPlaceholder: (t as any)('tool.outputPlaceholder'),
      translateButton: (t as any)('tool.translateButton'),
      uploadButton: (t as any)('tool.uploadButton'),
      uploadHint: (t as any)('tool.uploadHint'),
      loading: (t as any)('tool.loading'),
      error: (t as any)('tool.error'),
      noInput: (t as any)('tool.noInput'),
      styleLabel: (t as any)('tool.styleLabel'),
      styles: {
        academic: {
          label: (t as any)('tool.styles.academic.label'),
          description: (t as any)('tool.styles.academic.description'),
        },
        creative: {
          label: (t as any)('tool.styles.creative.label'),
          description: (t as any)('tool.styles.creative.description'),
        },
        humorous: {
          label: (t as any)('tool.styles.humorous.label'),
          description: (t as any)('tool.styles.humorous.description'),
        },
        technical: {
          label: (t as any)('tool.styles.technical.label'),
          description: (t as any)('tool.styles.technical.description'),
        },
        narrative: {
          label: (t as any)('tool.styles.narrative.label'),
          description: (t as any)('tool.styles.narrative.description'),
        },
        business: {
          label: (t as any)('tool.styles.business.label'),
          description: (t as any)('tool.styles.business.description'),
        },
      },
    },
  };

  // Examples section data
  const examplesData = {
    title: (t as any)('examples.title'),
    description: (t as any)('examples.description'),
    images: [
      {
        alt: (t as any)('examples.items.0.alt'),
        name: (t as any)('examples.items.0.name'),
      },
      {
        alt: (t as any)('examples.items.1.alt'),
        name: (t as any)('examples.items.1.name'),
      },
      {
        alt: (t as any)('examples.items.2.alt'),
        name: (t as any)('examples.items.2.name'),
      },
      {
        alt: (t as any)('examples.items.3.alt'),
        name: (t as any)('examples.items.3.name'),
      },
      {
        alt: (t as any)('examples.items.4.alt'),
        name: (t as any)('examples.items.4.name'),
      },
      {
        alt: (t as any)('examples.items.5.alt'),
        name: (t as any)('examples.items.5.name'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: (t as any)('whatIs.title'),
    description: (t as any)('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-verbose-generator.webp',
      alt: 'What is Verbose Generator',
    },
    cta: { text: (t as any)('ctaButton') },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: (t as any)('howto.title'),
    description: (t as any)('howto.description'),
    image: {
      src: '/images/docs/verbose-generator-how-to.webp',
      alt: 'How to use Verbose Generator',
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
        icon: 'FaPencilAlt',
      },
      {
        title: (t as any)('howto.steps.2.title'),
        description: (t as any)('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: (t as any)('howto.steps.3.title'),
        description: (t as any)('howto.steps.3.description'),
        icon: 'FaCheckCircle',
      },
    ],
  };

  // Highlights section
  const highlightsSection = {
    name: 'highlights',
    title: (t as any)('highlights.title'),
    description: (t as any)('highlights.description'),
    items: [
      {
        icon: 'FaRocket',
        title: (t as any)('highlights.items.0.title'),
        description: (t as any)('highlights.items.0.description'),
      },
      {
        icon: 'FaBrain',
        title: (t as any)('highlights.items.1.title'),
        description: (t as any)('highlights.items.1.description'),
      },
      {
        icon: 'FaShieldAlt',
        title: (t as any)('highlights.items.2.title'),
        description: (t as any)('highlights.items.2.description'),
      },
      {
        icon: 'FaChartLine',
        title: (t as any)('highlights.items.3.title'),
        description: (t as any)('highlights.items.3.description'),
      },
    ],
  };

  // Fun Facts section
  const funFactsSection = {
    name: 'funFacts',
    title: (t as any)('funFacts.title'),
    items: [
      {
        title: (t as any)('funFacts.items.0.title'),
        description: (t as any)('funFacts.items.0.description'),
        image: {
          src: '/images/docs/verbose-generator-fact-1.webp',
          alt: (t as any)('funFacts.items.0.title'),
        },
      },
      {
        title: (t as any)('funFacts.items.1.title'),
        description: (t as any)('funFacts.items.1.description'),
        image: {
          src: '/images/docs/verbose-generator-fact-2.webp',
          alt: (t as any)('funFacts.items.1.title'),
        },
      },
    ],
  };

  // User Interest section (4 content blocks)
  const userInterestSection = {
    name: 'userInterest',
    title: (t as any)('userInterest.title'),
    items: [
      {
        title: (t as any)('userInterest.items.0.title'),
        description: (t as any)('userInterest.items.0.description'),
        image: {
          src: '/images/docs/verbose-generator-interest-1.webp',
          alt: (t as any)('userInterest.items.0.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.1.title'),
        description: (t as any)('userInterest.items.1.description'),
        image: {
          src: '/images/docs/verbose-generator-interest-2.webp',
          alt: (t as any)('userInterest.items.1.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.2.title'),
        description: (t as any)('userInterest.items.2.description'),
        image: {
          src: '/images/docs/verbose-generator-interest-3.webp',
          alt: (t as any)('userInterest.items.2.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.3.title'),
        description: (t as any)('userInterest.items.3.description'),
        image: {
          src: '/images/docs/verbose-generator-interest-4.webp',
          alt: (t as any)('userInterest.items.3.title'),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section */}
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
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden"
                  >
                    <img
                      src={`/images/avatars/${i % 2 === 0 ? 'female' : 'male'}${i}.webp`}
                      alt={`User ${i}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
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
                  from 10,000+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <VerboseGeneratorTool pageData={pageData} locale={locale} />
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

        {/* Highlights */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
        'Dumb It Down AI',
        'Bad Translator',
        'Alien Text Generator',
        'Gen Z Translator',
        'Chinese to English Translator',
        'Gibberish Translator'
      ]}
        />

        {/* Testimonials */}
        <TestimonialsSection namespace="VerboseGeneratorPage.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="VerboseGeneratorPage.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="VerboseGeneratorPage.cta" />
      </div>
    </>
  );
}
