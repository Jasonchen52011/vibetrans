// @ts-nocheck - Translation keys type mismatch
import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import FeaturesSection from '@/components/blocks/features/features';
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
import DogTranslatorTool from './DogTranslatorTool';

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
  const dt = await getTranslations({ locale, namespace: 'DogTranslatorPage' });

  return constructMetadata({
    // @ts-ignore - Translation type mismatch
    title: `${dt('title')} | ${(t as any)('name')}`,
    // @ts-ignore - Translation type mismatch
    description: dt('description'),
    canonicalUrl: getUrlWithLocale('/dog-translator', locale),
    image: '/images/docs/pet-training-made-fun.webp',
  });
}

interface DogTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function DogTranslatorPage(props: DogTranslatorPageProps) {
  const params = await props.params;
  const { locale } = params;
  // @ts-ignore - Translation keys are dynamic
  const t = await getTranslations({ locale, namespace: 'DogTranslatorPage' });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Dog Translator',
    description: (t as any)('description'),
  });

  // Page data for the tool
  const pageData = {
    tool: {
      yourWords: (t as any)('tool.yourWords'),
      doggyVibe: (t as any)('tool.doggyVibe'),
      inputPlaceholder: (t as any)('tool.inputPlaceholder'),
      translateButton: (t as any)('tool.translateButton'),
      playButton: (t as any)('tool.playButton'),
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
        src: '',
        alt: (t as any)('examples.items.0.alt'),
        name: (t as any)('examples.items.0.name'),
        audio: '/voice/happy.mp3',
        emotion: 'Happy',
      },
      {
        src: '',
        alt: (t as any)('examples.items.1.alt'),
        name: (t as any)('examples.items.1.name'),
        audio: '/voice/happy3.mp3',
        emotion: 'Excited',
      },
      {
        src: '',
        alt: (t as any)('examples.items.2.alt'),
        name: (t as any)('examples.items.2.name'),
        audio: '/voice/sad.mp3',
        emotion: 'Sad',
      },
      {
        src: '',
        alt: (t as any)('examples.items.3.alt'),
        name: (t as any)('examples.items.3.name'),
        audio: '/voice/angry.mp3',
        emotion: 'Angry',
      },
      {
        src: '',
        alt: (t as any)('examples.items.4.alt'),
        name: (t as any)('examples.items.4.name'),
        audio: '/voice/normal.mp3',
        emotion: 'Calm',
      },
      {
        src: '',
        alt: (t as any)('examples.items.5.alt'),
        name: (t as any)('examples.items.5.name'),
        audio: '/voice/happy2.mp3',
        emotion: 'Playful',
      },
    ],
  };

  // User scenarios section
  const userScenariosSection = {
    name: 'userscenarios',
    title: (t as any)('userScenarios.title'),
    items: [
      {
        title: (t as any)('userScenarios.items.0.title'),
        description: (t as any)('userScenarios.items.0.description'),
        image: {
          src: '/images/docs/family-entertainment.webp',
          alt: (t as any)('userScenarios.items.0.title'),
        },
      },
      {
        title: (t as any)('userScenarios.items.1.title'),
        description: (t as any)('userScenarios.items.1.description'),
        image: {
          src: '/images/docs/pet-training-made-fun.webp',
          alt: (t as any)('userScenarios.items.1.title'),
        },
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
        icon: 'FaHeart',
        title: (t as any)('highlights.items.2.title'),
        description: (t as any)('highlights.items.2.description'),
      },
      {
        icon: 'FaShieldAlt',
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
      src: '/images/docs/what-is-dog-translator.webp',
      alt: 'Dog Translator Overview',
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
      src: '/images/docs/dog-translator-how-to.webp',
      alt: 'How to Use Dog Translator',
    },
    items: [
      {
        title: (t as any)('howto.steps.0.title'),
        description: (t as any)('howto.steps.0.description'),
        icon: 'FaPencilAlt',
      },
      {
        title: (t as any)('howto.steps.1.title'),
        description: (t as any)('howto.steps.1.description'),
        icon: 'FaBrain',
      },
      {
        title: (t as any)('howto.steps.2.title'),
        description: (t as any)('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: (t as any)('howto.steps.3.title'),
        description: (t as any)('howto.steps.3.description'),
        icon: 'FaVolumeUp',
      },
    ],
  };

  // Unique section
  const uniqueSection = {
    name: 'unique',
    title: (t as any)('unique.title'),
    subtitle: (t as any)('unique.subtitle'),
    description: (t as any)('unique.description'),
    items: [
      {
        title: (t as any)('unique.items.0.title'),
        description: (t as any)('unique.items.0.description'),
        image: {
          src: '/images/docs/ai-emotion-intelligence.webp',
          alt: (t as any)('unique.items.0.title'),
        },
      },
      {
        title: (t as any)('unique.items.1.title'),
        description: (t as any)('unique.items.1.description'),
        image: {
          src: '/images/docs/authentic-sound-library.webp',
          alt: (t as any)('unique.items.1.title'),
        },
      },
      {
        title: (t as any)('unique.items.2.title'),
        description: (t as any)('unique.items.2.description'),
        image: {
          src: '/images/docs/speak-dog-in-any-language.webp',
          alt: (t as any)('unique.items.2.title'),
        },
      },
      {
        title: (t as any)('unique.items.3.title'),
        description: (t as any)('unique.items.3.description'),
        image: {
          src: '/images/docs/personalized-settings.webp',
          alt: (t as any)('unique.items.3.title'),
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
                    src="/images/avatars/female2.webp"
                    alt="User 2"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male3.webp"
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
                    src="/images/avatars/male2.webp"
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
                  from 9,200+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Dog Translator Tool */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <DogTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* Unique Section */}
        <UniqueSection
          section={uniqueSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* User Scenarios */}
        <UserScenarios
          section={userScenariosSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Highlights/Why Choose */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Dog Translator',
            'Gen Z Translator',
            'Gibberish Translator',
            'Bad Translator',
            'Ancient Greek Translator',
            'Esperanto Translator',
          ]}
        />

        {/* FAQ Section */}
        <FaqSection namespace="DogTranslatorPage.faqs" />

        {/* Testimonials Section */}
        <TestimonialsThreeColumnSection namespace="DogTranslatorPage.testimonials" />

        {/* Call to Action */}
        <CallToActionSection namespace="DogTranslatorPage.cta" />
      </div>
    </>
  );
}
