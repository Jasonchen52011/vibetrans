// @ts-nocheck - Translation keys type mismatch
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
import OghamTranslatorTool from './OghamTranslatorTool';

// Edge runtime configuration for Cloudflare Pages compatibility
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
    namespace: 'OghamTranslatorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${(t as any)('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/ogham-translator', locale),
    image: '/images/docs/what-is-ogham-translator.webp',
  });
}

interface OghamTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function OghamTranslatorPage(
  props: OghamTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'OghamTranslatorPage' });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Ogham Translator',
    description: (t as any)('description'),
  });

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
  let whatIsImageSrc = '/images/docs/ogham-translation-tool.webp';
  let whatIsImageAlt = 'What is Ogham Translator';
  try {
    const candidate = (t as any)('whatIs.image');
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      whatIsImageSrc = candidate;
    }
  } catch {
    whatIsImageSrc = '/images/docs/ogham-translation-tool.webp';
  }
  try {
    const candidateAlt = (t as any)('whatIs.imageAlt');
    if (typeof candidateAlt === 'string' && candidateAlt.trim().length > 0) {
      whatIsImageAlt = candidateAlt;
    }
  } catch {
    whatIsImageAlt = 'What is Ogham Translator';
  }

  const whatIsSection = {
    title: (t as any)('whatIs.title'),
    description: (t as any)('whatIs.description'),
    features: [],
    image: {
      src: whatIsImageSrc,
      alt: whatIsImageAlt,
    },
    cta: { text: (t as any)('ctaButton') },
  };

  // How to section
  let howtoImageSrc = '/images/docs/translate-improve-arrows.webp';
  let howtoImageAlt = 'How to use Ogham Translator';
  try {
    const candidate = (t as any)('howto.image');
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      howtoImageSrc = candidate;
    }
  } catch {
    howtoImageSrc = '/images/docs/translate-improve-arrows.webp';
  }
  try {
    const candidateAlt = (t as any)('howto.imageAlt');
    if (typeof candidateAlt === 'string' && candidateAlt.trim().length > 0) {
      howtoImageAlt = candidateAlt;
    }
  } catch {
    howtoImageAlt = 'How to use Ogham Translator';
  }

  const howtoSection = {
    name: 'howto',
    title: (t as any)('howto.title'),
    description: (t as any)('howto.description'),
    image: {
      src: howtoImageSrc,
      alt: howtoImageAlt,
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
  const fallbackHighlightDescription =
    'VibeTrans offers the best translation experience with powerful features and accurate results.';

  let highlightsDescription = fallbackHighlightDescription;
  try {
    const desc = (t as any)('highlights.description');
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
    const rawFeatures = (t as any).raw('highlights.features');
    if (Array.isArray(rawFeatures)) {
      highlightItems = rawFeatures.slice(0, 4).map((feature, index) => ({
        icon:
          feature?.icon ||
          defaultHighlightIcons[index % defaultHighlightIcons.length],
        title: feature?.title || '',
        description: feature?.description || '',
      }));
    }
  } catch {
    highlightItems = [];
  }

  if (highlightItems.length === 0) {
    highlightItems = defaultHighlightIcons.map((icon, index) => ({
      icon,
      title: (t as any)(`highlights.features.${index}.title`),
      description: (t as any)(`highlights.features.${index}.description`),
    }));
  }

  const highlightsSection = {
    name: 'highlights',
    title: (t as any)('highlights.title'),
    description: highlightsDescription,
    items: highlightItems,
  };

  // Fun Facts section
  let funFactsItems: Array<{
    title: string;
    description: string;
    image: { src: string; alt: string };
  }> = [];

  try {
    const rawFunFacts = (t as any).raw('funFacts.items');
    if (Array.isArray(rawFunFacts)) {
      funFactsItems = rawFunFacts.map((item: any) => ({
        title: item?.title || '',
        description: item?.description || '',
        image: {
          src: item?.image || '/images/docs/ogham-alphabet-trees.webp',
          alt: item?.imageAlt || item?.title || 'Ogham insight',
        },
      }));
    }
  } catch {
    funFactsItems = [];
  }

  if (funFactsItems.length === 0) {
    funFactsItems = [
      {
        title: (t as any)('funFacts.items.0.title'),
        description: (t as any)('funFacts.items.0.description'),
        image: {
          src: '/images/docs/ogham-alphabet-trees.webp',
          alt: (t as any)('funFacts.items.0.title'),
        },
      },
      {
        title: (t as any)('funFacts.items.1.title'),
        description: (t as any)('funFacts.items.1.description'),
        image: {
          src: '/images/docs/unicode-ogham-space.webp',
          alt: (t as any)('funFacts.items.1.title'),
        },
      },
    ];
  }

  const funFactsSection = {
    name: 'funFacts',
    title: (t as any)('funFacts.title'),
    items: funFactsItems,
  };

  // User Interest section (4 content blocks) - Dynamic image loading from translation files
  const userInterestSection = {
    name: 'userInterest',
    title: (t as any)('userInterest.title'),
    items: [
      {
        title: (t as any)('userInterest.items.0.title'),
        description: (t as any)('userInterest.items.0.description'),
        image: (() => {
          let imageSrc = '/images/docs/ogham-translator-interest-1.webp';
          try {
            const candidate = (t as any)('userInterest.items.0.image');
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              imageSrc = candidate;
            }
          } catch {
            // Fallback to default
          }
          return {
            src: imageSrc,
            alt: (t as any)('userInterest.items.0.title'),
          };
        })(),
      },
      {
        title: (t as any)('userInterest.items.1.title'),
        description: (t as any)('userInterest.items.1.description'),
        image: (() => {
          let imageSrc = '/images/docs/ogham-translator-interest-2.webp';
          try {
            const candidate = (t as any)('userInterest.items.1.image');
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              imageSrc = candidate;
            }
          } catch {
            // Fallback to default
          }
          return {
            src: imageSrc,
            alt: (t as any)('userInterest.items.1.title'),
          };
        })(),
      },
      {
        title: (t as any)('userInterest.items.2.title'),
        description: (t as any)('userInterest.items.2.description'),
        image: (() => {
          let imageSrc = '/images/docs/ogham-translator-interest-3.webp';
          try {
            const candidate = (t as any)('userInterest.items.2.image');
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              imageSrc = candidate;
            }
          } catch {
            // Fallback to default
          }
          return {
            src: imageSrc,
            alt: (t as any)('userInterest.items.2.title'),
          };
        })(),
      },
      {
        title: (t as any)('userInterest.items.3.title'),
        description: (t as any)('userInterest.items.3.description'),
        image: (() => {
          let imageSrc = '/images/docs/ogham-translator-interest-4.webp';
          try {
            const candidate = (t as any)('userInterest.items.3.image');
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
              imageSrc = candidate;
            }
          } catch {
            // Fallback to default
          }
          return {
            src: imageSrc,
            alt: (t as any)('userInterest.items.3.title'),
          };
        })(),
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
                {['female1', 'male2', 'female2', 'male5', 'female3'].map(
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
                  {(t as any)('hero.userCount')}
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <OghamTranslatorTool pageData={pageData} locale={locale} />
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
            'Gen Z Translator',
            'Dog Translator',
            'Bad Translator',
            'Ancient Greek Translator',
            'Gibberish Translator',
            'Esperanto Translator',
          ]}
        />

        {/* Testimonials */}
        <TestimonialsSection namespace="OghamTranslatorPage.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="OghamTranslatorPage.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="OghamTranslatorPage.cta" />
      </div>
    </>
  );
}
