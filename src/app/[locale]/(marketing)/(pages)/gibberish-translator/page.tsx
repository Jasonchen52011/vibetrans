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
import GibberishTranslatorTool from './GibberishTranslatorTool';

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
    namespace: 'GibberishTranslatorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${t('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/gibberish-translator', locale),
    image: '/images/docs/what-is-gibberish-translator.webp',
  });
}

interface GibberishTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function GibberishTranslatorPage(
  props: GibberishTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'GibberishTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Gibberish Translator',
    description: t('description'),
  });

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: t('tool.inputLabel'),
      gibberishLabel: t('tool.gibberishLabel'),
      outputLabel: t('tool.outputLabel'),
      inputPlaceholder: t('tool.inputPlaceholder'),
      gibberishPlaceholder: t('tool.gibberishPlaceholder'),
      outputPlaceholder: t('tool.outputPlaceholder'),
      translateButton: t('tool.translateButton'),
      uploadButton: t('tool.uploadButton'),
      uploadHint: t('tool.uploadHint'),
      styleLabel: t('tool.styleLabel'),
      styles: {
        random: t('tool.styles.random'),
        syllable: t('tool.styles.syllable'),
        reverse: t('tool.styles.reverse'),
      },
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
        alt: 'Hello → Heliblo',
        name: 'Hello → Heliblo',
      },
      {
        alt: 'Welcome → Welicomiber',
        name: 'Welcome → Welicomiber',
      },
      {
        alt: 'Thank you → Thaniber youbi',
        name: 'Thank you → Thaniber youbi',
      },
      {
        alt: 'Goodbye → Goodibbye',
        name: 'Goodbye → Goodibbye',
      },
      {
        alt: 'Friend → Friebiend',
        name: 'Friend → Friebiend',
      },
      {
        alt: 'Help me → Helpib mebe',
        name: 'Help me → Helpib mebe',
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
          src: '/images/docs/gibberish-origin-word.webp',
          alt: 'The Origin of the Word',
        },
      },
      {
        title: t('funfacts.items.1.title'),
        description: t('funfacts.items.1.description'),
        image: {
          src: '/images/docs/gibberish-educational.webp',
          alt: 'Gibberish Can Be Educational',
        },
      },
    ],
  };

  // User Interest section
  const userInterestSection = {
    name: 'userinterest',
    title: t('userInterest.title'),
    items: [
      {
        title: t('userInterest.items.0.title'),
        description: t('userInterest.items.0.description'),
        image: {
          src: '/images/docs/gibberish-secret-codes.webp',
          alt: 'Language Games and Secret Codes',
        },
      },
      {
        title: t('userInterest.items.1.title'),
        description: t('userInterest.items.1.description'),
        image: {
          src: '/images/docs/gibberish-education-purpose.webp',
          alt: 'Educational Purposes',
        },
      },
      {
        title: t('userInterest.items.2.title'),
        description: t('userInterest.items.2.description'),
        image: {
          src: '/images/docs/gibberish-content-creators.webp',
          alt: 'Content Creators and Entertainers',
        },
      },
      {
        title: t('userInterest.items.3.title'),
        description: t('userInterest.items.3.description'),
        image: {
          src: '/images/docs/gibberish-privacy-fun.webp',
          alt: 'Privacy and Fun Communication',
        },
      },
    ],
  };

  // Highlights section
  const highlightsSection = {
    name: 'highlights',
    title: t('highlights.title'),
    description: '',
    items: [
      {
        icon: 'FaPalette',
        title: t('highlights.items.0.title'),
        description: t('highlights.items.0.description'),
      },
      {
        icon: 'FaBolt',
        title: t('highlights.items.1.title'),
        description: t('highlights.items.1.description'),
      },
      {
        icon: 'FaFileAlt',
        title: t('highlights.items.2.title'),
        description: t('highlights.items.2.description'),
      },
      {
        icon: 'FaVolumeUp',
        title: t('highlights.items.3.title'),
        description: t('highlights.items.3.description'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: t('whatIs.title'),
    description: t('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-gibberish-translator.webp',
      alt: 'What is Gibberish Translator - Understanding Playful Language',
    },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: t('howto.title'),
    description: t('howto.description'),
    image: {
      src: '/images/docs/gibberish-translator-how-to.webp',
      alt: 'How to use Gibberish Translator step by step guide',
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
        icon: 'FaPalette',
      },
      {
        title: t('howto.steps.2.title'),
        description: t('howto.steps.2.description'),
        icon: 'FaMagic',
      },
      {
        title: t('howto.steps.3.title'),
        description: t('howto.steps.3.description'),
        icon: 'FaShare',
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
                    src="/images/avatars/female4.webp"
                    alt="User 1"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male3.webp"
                    alt="User 2"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female1.webp"
                    alt="User 3"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male1.webp"
                    alt="User 4"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female2.webp"
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
                  from 11,800+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Gibberish Translator Tool */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <GibberishTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios section={userInterestSection} />

        {/* Fun Facts */}
        <UserScenarios section={funFactsSection} />

        {/* Highlights/Why Choose */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Ancient Greek Translator',
            'Al Bhed Translator',
            'Bad Translator',
            'Dog Translator',
            'Gen Z Translator',
            'Gibberish Translator',
          ]}
        />

        {/* Testimonials Section */}
        <TestimonialsThreeColumnSection namespace="GibberishTranslatorPage.testimonials" />

        {/* FAQ Section */}
        <FaqSection namespace="GibberishTranslatorPage.faqs" />

        {/* Call to Action */}
        <CallToActionSection namespace="GibberishTranslatorPage.cta" />
      </div>
    </>
  );
}
