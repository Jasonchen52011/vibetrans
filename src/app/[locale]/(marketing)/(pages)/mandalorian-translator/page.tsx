import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials-three-column';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import MandalorianTranslatorTool from './MandalorianTranslatorTool';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return constructMetadata({
    title: `${t('MandalorianTranslatorPage.title')} | VibeTrans`,
    description: t('MandalorianTranslatorPage.description'),
    canonicalUrl: getUrlWithLocale('/mandalorian-translator', locale),
    image: t('MandalorianTranslatorPage.whatIs.image'),
  });
}

interface MandalorianTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function MandalorianTranslatorPage(
  props: MandalorianTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Mandalorian Translator',
    description: t('MandalorianTranslatorPage.description'),
  });

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: t('MandalorianTranslatorPage.tool.inputLabel'),
      outputLabel: t('MandalorianTranslatorPage.tool.outputLabel'),
      inputPlaceholder: t('MandalorianTranslatorPage.tool.inputPlaceholder'),
      outputPlaceholder: t('MandalorianTranslatorPage.tool.outputPlaceholder'),
      translateButton: t('MandalorianTranslatorPage.tool.translateButton'),
      uploadButton: t('MandalorianTranslatorPage.tool.uploadButton'),
      uploadHint: t('MandalorianTranslatorPage.tool.uploadHint'),
      loading: t('MandalorianTranslatorPage.tool.loading'),
      error: t('MandalorianTranslatorPage.tool.error'),
      noInput: t('MandalorianTranslatorPage.tool.noInput'),
    },
  };

  // Examples section data
  const examplesData = {
    title: t('MandalorianTranslatorPage.examples.title'),
    description: t('MandalorianTranslatorPage.examples.description'),
    images: [
      {
        alt: t('MandalorianTranslatorPage.examples.items.0.alt'),
        name: t('MandalorianTranslatorPage.examples.items.0.name'),
      },
      {
        alt: t('MandalorianTranslatorPage.examples.items.1.alt'),
        name: t('MandalorianTranslatorPage.examples.items.1.name'),
      },
      {
        alt: t('MandalorianTranslatorPage.examples.items.2.alt'),
        name: t('MandalorianTranslatorPage.examples.items.2.name'),
      },
      {
        alt: t('MandalorianTranslatorPage.examples.items.3.alt'),
        name: t('MandalorianTranslatorPage.examples.items.3.name'),
      },
      {
        alt: t('MandalorianTranslatorPage.examples.items.4.alt'),
        name: t('MandalorianTranslatorPage.examples.items.4.name'),
      },
      {
        alt: t('MandalorianTranslatorPage.examples.items.5.alt'),
        name: t('MandalorianTranslatorPage.examples.items.5.name'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: t('MandalorianTranslatorPage.whatIs.title'),
    description: t('MandalorianTranslatorPage.whatIs.description'),
    features: [],
    image: {
      src: t('MandalorianTranslatorPage.whatIs.image'),
      alt: 'What is Mandalorian Translator',
    },
    cta: { text: t('MandalorianTranslatorPage.ctaButton') },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: t('MandalorianTranslatorPage.howto.title'),
    description: t('MandalorianTranslatorPage.howto.description'),
    image: {
      src: t('MandalorianTranslatorPage.howto.image'),
      alt: 'How to use Mandalorian Translator',
    },
    items: [
      {
        title: t('MandalorianTranslatorPage.howto.steps.0.title'),
        description: t('MandalorianTranslatorPage.howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: t('MandalorianTranslatorPage.howto.steps.1.title'),
        description: t('MandalorianTranslatorPage.howto.steps.1.description'),
        icon: 'FaPencilAlt',
      },
      {
        title: t('MandalorianTranslatorPage.howto.steps.2.title'),
        description: t('MandalorianTranslatorPage.howto.steps.2.description'),
        icon: 'FaLanguage',
      },
    ],
  };

  // Highlights section
  const fallbackHighlightDescription =
    'VibeTrans offers the best translation experience with powerful features and accurate results.';

  let highlightsDescription = fallbackHighlightDescription;
  try {
    const desc = t('MandalorianTranslatorPage.highlights.description');
    if (typeof desc === 'string' && desc.trim().length > 0) {
      highlightsDescription = desc;
    }
  } catch {
    highlightsDescription = fallbackHighlightDescription;
  }

  const defaultHighlightIcons = [
    'FaRocket',
    'FaBrain',
    'FaShieldAlt',
    'FaChartLine',
  ];

  let highlightItems = [];
  try {
    const rawItems = t.raw('MandalorianTranslatorPage.highlights.items');
    if (Array.isArray(rawItems)) {
      highlightItems = rawItems.slice(0, 4).map((item, index) => ({
        icon:
          item?.icon ||
          defaultHighlightIcons[index % defaultHighlightIcons.length],
        title: item?.title || '',
        description: item?.description || '',
        tagline: '',
        statLabel: item?.statLabel || null,
        statValue: item?.statValue || null,
        microCopy: '',
      }));
    }
  } catch {
    highlightItems = [];
  }

  if (highlightItems.length === 0) {
    highlightItems = defaultHighlightIcons.map((icon, index) => ({
      icon,
      title: t(`MandalorianTranslatorPage.highlights.items.${index}.title`),
      description: t(
        `MandalorianTranslatorPage.highlights.items.${index}.description`
      ),
      tagline: '',
      statLabel: t(
        `MandalorianTranslatorPage.highlights.items.${index}.statLabel`
      ),
      statValue: t(
        `MandalorianTranslatorPage.highlights.items.${index}.statValue`
      ),
      microCopy: '',
    }));
  }

  const highlightsSection = {
    name: 'highlights',
    title: t('MandalorianTranslatorPage.highlights.title'),
    description: highlightsDescription,
    items: highlightItems,
  };

  // Fun Facts section
  const funFactsSection = {
    name: 'funFacts',
    title: t('MandalorianTranslatorPage.funFacts.title'),
    items: [
      {
        title: t('MandalorianTranslatorPage.funFacts.items.0.title'),
        description: t(
          'MandalorianTranslatorPage.funFacts.items.0.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.funFacts.items.0.image'),
          alt: t('MandalorianTranslatorPage.funFacts.items.0.title'),
        },
      },
      {
        title: t('MandalorianTranslatorPage.funFacts.items.1.title'),
        description: t(
          'MandalorianTranslatorPage.funFacts.items.1.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.funFacts.items.1.image'),
          alt: t('MandalorianTranslatorPage.funFacts.items.1.title'),
        },
      },
    ],
  };

  // User Interest section (4 content blocks)
  const userInterestSection = {
    name: 'userInterest',
    title: t('MandalorianTranslatorPage.userInterest.title'),
    items: [
      {
        title: t('MandalorianTranslatorPage.userInterest.items.0.title'),
        description: t(
          'MandalorianTranslatorPage.userInterest.items.0.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.userInterest.items.0.image'),
          alt: t('MandalorianTranslatorPage.userInterest.items.0.title'),
        },
      },
      {
        title: t('MandalorianTranslatorPage.userInterest.items.1.title'),
        description: t(
          'MandalorianTranslatorPage.userInterest.items.1.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.userInterest.items.1.image'),
          alt: t('MandalorianTranslatorPage.userInterest.items.1.title'),
        },
      },
      {
        title: t('MandalorianTranslatorPage.userInterest.items.2.title'),
        description: t(
          'MandalorianTranslatorPage.userInterest.items.2.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.userInterest.items.2.image'),
          alt: t('MandalorianTranslatorPage.userInterest.items.2.title'),
        },
      },
      {
        title: t('MandalorianTranslatorPage.userInterest.items.3.title'),
        description: t(
          'MandalorianTranslatorPage.userInterest.items.3.description'
        ),
        image: {
          src: t('MandalorianTranslatorPage.userInterest.items.3.image'),
          alt: t('MandalorianTranslatorPage.userInterest.items.3.title'),
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
              {t('MandalorianTranslatorPage.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('MandalorianTranslatorPage.hero.description')}
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
          <MandalorianTranslatorTool pageData={pageData} locale={locale} />
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
          ctaText={t('MandalorianTranslatorPage.ctaButton')}
        />

        {/* Fun Facts */}
        <UserScenarios
          section={funFactsSection}
          ctaText={t('MandalorianTranslatorPage.ctaButton')}
        />

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
        <TestimonialsSection namespace="MandalorianTranslatorPage.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="MandalorianTranslatorPage.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="MandalorianTranslatorPage.cta" />
      </div>
    </>
  );
}
