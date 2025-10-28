import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsThreeColumnSection from '@/components/blocks/testimonials/testimonials-three-column';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import MinionTranslatorTool from './MinionTranslatorTool';

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
    namespace: 'MinionTranslatorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${t('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/minion-translator', locale),
    image: (gt as any)('whatIs.image'),
  });
}

interface MinionTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function MinionTranslatorPage(
  props: MinionTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'MinionTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Minion Translator',
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
      loading: t('tool.loading'),
      error: t('tool.error'),
      noInput: t('tool.noInput'),
    },
  };

  // Examples section data
  const examplesData = {
    title: t('examples.title'),
    description: t('examples.description'),
    images: [
      {
        alt: t('examples.items.0.alt'),
        name: t('examples.items.0.name'),
      },
      {
        alt: t('examples.items.1.alt'),
        name: t('examples.items.1.name'),
      },
      {
        alt: t('examples.items.2.alt'),
        name: t('examples.items.2.name'),
      },
      {
        alt: t('examples.items.3.alt'),
        name: t('examples.items.3.name'),
      },
      {
        alt: t('examples.items.4.alt'),
        name: t('examples.items.4.name'),
      },
      {
        alt: t('examples.items.5.alt'),
        name: t('examples.items.5.name'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: t('whatIs.title'),
    description: t('whatIs.description'),
    features: [],
    image: {
      src: t('whatIs.image'),
      alt: t('whatIs.imageAlt'),
    },
    cta: { text: t('ctaButton') },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: t('howto.title'),
    description: t('howto.description'),
    image: {
      src: '/images/docs/minion-translator-how-to.webp',
      alt: 'How to use Minion Translator',
    },
    items: [
      {
        title: t('howto.steps.0.name'),
        description: t('howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: t('howto.steps.1.name'),
        description: t('howto.steps.1.description'),
        icon: 'FaPencilAlt',
      },
      {
        title: t('howto.steps.2.name'),
        description: t('howto.steps.2.description'),
        icon: 'FaLanguage',
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
        icon: 'FaRocket',
        title: t('highlights.items.0.title'),
        description: t('highlights.items.0.description'),
      },
      {
        icon: 'FaBrain',
        title: t('highlights.items.1.title'),
        description: t('highlights.items.1.description'),
      },
      {
        icon: 'FaShieldAlt',
        title: t('highlights.items.2.title'),
        description: t('highlights.items.2.description'),
      },
      {
        icon: 'FaChartLine',
        title: t('highlights.items.3.title'),
        description: t('highlights.items.3.description'),
      },
    ],
  };

  // Fun Facts section
  const funFactsSection = {
    name: 'funfacts',
    title: t('funfacts.title'),
    items: [
      {
        title: t('funfacts.items.0.title'),
        description: t('funfacts.items.0.description'),
        image: {
          src: t('funfacts.items.0.image'),
          alt: t('funfacts.items.0.imageAlt'),
        },
      },
      {
        title: t('funfacts.items.1.title'),
        description: t('funfacts.items.1.description'),
        image: {
          src: t('funfacts.items.1.image'),
          alt: t('funfacts.items.1.imageAlt'),
        },
      },
    ],
  };

  // User Interest section (4 content blocks)
  const userInterestSection = {
    name: 'userInterest',
    title: t('userInterest.title'),
    items: [
      {
        title: t('userInterest.items.0.title'),
        description: t('userInterest.items.0.content'),
        image: {
          src: t('userInterest.items.0.image'),
          alt: t('userInterest.items.0.imageAlt'),
        },
      },
      {
        title: t('userInterest.items.1.title'),
        description: t('userInterest.items.1.content'),
        image: {
          src: t('userInterest.items.1.image'),
          alt: t('userInterest.items.1.imageAlt'),
        },
      },
      {
        title: t('userInterest.items.2.title'),
        description: t('userInterest.items.2.content'),
        image: {
          src: t('userInterest.items.2.image'),
          alt: t('userInterest.items.2.imageAlt'),
        },
      },
      {
        title: t('userInterest.items.3.title'),
        description: t('userInterest.items.3.content'),
        image: {
          src: t('userInterest.items.3.image'),
          alt: t('userInterest.items.3.imageAlt'),
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
          <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('hero.description')}
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
                  from 20,000+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <MinionTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios section={userInterestSection} ctaText={t('ctaButton')} />

        {/* Fun Facts */}
        <UserScenarios section={funFactsSection} ctaText={t('ctaButton')} />

        {/* Highlights */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Gen Z Translator',
            'Dog Translator',
            'Bad Translator',
            'Ancient Greek Translator',
            'Gibberish Translator',
            'Esperanto Translator',
          ]}
        />

        {/* Testimonials */}
        <TestimonialsThreeColumnSection namespace="MinionTranslatorPage.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="MinionTranslatorPage.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="MinionTranslatorPage.cta" />
      </div>
    </>
  );
}
