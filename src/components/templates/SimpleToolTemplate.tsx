// @ts-nocheck - Translation keys type mismatch
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

export const runtime = 'edge';

// Types for tool configuration
export interface SimpleToolConfig {
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder: string;
  outputPlaceholder: string;
  translateButton: string;
  uploadButton?: string;
  uploadHint?: string;
  loading: string;
  error: string;
  noInput: string;
}

export interface AdvancedToolConfig extends SimpleToolConfig {
  // Additional options for complex tools
  styles?: Record<string, string>;
  styleLabel?: string;
  dialects?: Record<string, string>;
  dialectLabel?: string;
  levels?: Record<string, string>;
  levelLabel?: string;
  iterationsLabel?: string;
  downloadButton?: string;
  resetButton?: string;
  // Add more as needed
}

export interface ToolPageConfig {
  namespace: string;
  route: string;
  imagePath: string;
  toolComponent: React.ComponentType<{
    pageData: { tool: SimpleToolConfig | AdvancedToolConfig };
    locale: Locale;
  }>;
  structuredDataFeatureList: string[];
  exploreToolKeys: string[];
  customSections?: Array<{
    name: string;
    title: string;
    items: any[];
  }>;
}

export interface SimpleToolPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateToolMetadata({
  params,
  config,
}: {
  params: Promise<{ locale: Locale }>;
  config: ToolPageConfig;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const gt = await getTranslations({ locale, namespace: config.namespace });

  return constructMetadata({
    title: `${gt('title')} | ${(t as any)('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale(config.route, locale),
    image: config.imagePath,
  });
}

export function createStructuredData(
  config: ToolPageConfig,
  description: string
) {
  return buildToolStructuredData({
    name: `VibeTrans ${config.namespace.replace('Page', '')}`,
    description,
    featureList: config.structuredDataFeatureList,
  });
}

export function createHeroSection({
  title,
  description,
  userCount,
  avatars,
}: {
  title: string;
  description: string;
  userCount: string;
  avatars?: string[];
}) {
  return (
    <AuroraBackground className="bg-white dark:bg-zinc-900 !h-auto -mt-16 pt-16">
      <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          {description}
        </p>

        {/* User Avatars and Rating */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex -space-x-3">
            {(
              avatars || ['female3', 'male4', 'female2', 'male1', 'female1']
            ).map((avatar, i) => (
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
              from {userCount} happy users
            </p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}

export function createSectionsData(t: any, namespace: string) {
  return {
    whatIsSection: {
      title: (t as any)('whatIs.title'),
      description: (t as any)('whatIs.description'),
      features: [],
      image: {
        src: '/images/docs/what-is-placeholder.webp', // Will be overridden
        alt: 'What is this tool',
      },
      cta: { text: (t as any)('ctaButton') },
    },
    howtoSection: {
      name: 'howto',
      title: (t as any)('howto.title'),
      description: (t as any)('howto.description'),
      image: {
        src: '/images/docs/how-to-placeholder.webp', // Will be overridden
        alt: 'How to use this tool',
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
    },
    highlightsSection: {
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
    },
    userInterestSection: {
      name: 'userinterest',
      title: (t as any)('userInterest.title'),
      items: [
        {
          title: (t as any)('userInterest.items.0.title'),
          description: (t as any)('userInterest.items.0.description'),
          image: {
            src: '/images/docs/user-interest-1.webp', // Will be overridden
            alt: (t as any)('userInterest.items.0.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.1.title'),
          description: (t as any)('userInterest.items.1.description'),
          image: {
            src: '/images/docs/user-interest-2.webp', // Will be overridden
            alt: (t as any)('userInterest.items.1.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.2.title'),
          description: (t as any)('userInterest.items.2.description'),
          image: {
            src: '/images/docs/user-interest-3.webp', // Will be overridden
            alt: (t as any)('userInterest.items.2.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.3.title'),
          description: (t as any)('userInterest.items.3.description'),
          image: {
            src: '/images/docs/user-interest-4.webp', // Will be overridden
            alt: (t as any)('userInterest.items.3.title'),
          },
        },
      ],
    },
  };
}

export default async function SimpleToolTemplate({
  params,
  config,
}: {
  params: Promise<{ locale: Locale }>;
  config: ToolPageConfig;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: config.namespace });

  const structuredData = createStructuredData(
    config,
    (t as any)('description')
  );
  const sectionsData = createSectionsData(t, config.namespace);

  // Override specific section images if provided
  if (config.imagePath) {
    sectionsData.whatIsSection.image.src = config.imagePath;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section with Tool */}
        {createHeroSection({
          title: (t as any)('hero.title'),
          description: (t as any)('hero.description'),
          userCount: (t as any)('hero.userCount') || '10,000+',
        })}

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <config.toolComponent pageData={{ tool: {} }} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={sectionsData.whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection
          beforeAfterGallery={{
            title: (t as any)('examples.title'),
            description: (t as any)('examples.description'),
            images: [], // Will be populated by specific tool
          }}
        />

        {/* How to Section */}
        <HowTo section={sectionsData.howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios
          section={sectionsData.userInterestSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Highlights/Why Choose */}
        <WhyChoose section={sectionsData.highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools toolKeys={config.exploreToolKeys} />

        {/* Testimonials Section */}
        <TestimonialsThreeColumnSection
          namespace={`${config.namespace}.testimonials`}
        />

        {/* FAQ Section */}
        <FaqSection namespace={`${config.namespace}.faqs`} />

        {/* Call to Action */}
        <CallToActionSection namespace={`${config.namespace}.cta`} />
      </div>
    </>
  );
}
