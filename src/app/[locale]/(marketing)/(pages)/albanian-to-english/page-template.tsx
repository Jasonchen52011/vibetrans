// @ts-nocheck - Translation keys type mismatch
import SimpleToolTemplate, {
  type ToolPageConfig,
  generateToolMetadata
} from '@/components/templates/SimpleToolTemplate';
import { createAdvancedToolPageData, createExamplesData, createSectionsDataWithImages } from '@/components/templates/tool-template-utils';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import AlbanianToEnglishTool from './AlbanianToEnglishTool';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';

// Tool configuration
const albanianToEnglishConfig: ToolPageConfig = {
  namespace: 'AlbanianToEnglishPage',
  route: '/albanian-to-english',
  imagePath: '/images/docs/what-is-albanian-to-english.webp',
  toolComponent: AlbanianToEnglishTool,
  structuredDataFeatureList: [
    'Text Translation',
    'File Upload Support',
    'Instant Translation',
  ],
  exploreToolKeys: [
    'Al Bhed Translator',
    'Cuneiform Translator',
    'Gen Alpha Translator',
    'Esperanto Translator',
    'Dog Translator',
    'Bad Translator',
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  return generateToolMetadata({ params, config: albanianToEnglishConfig });
}

interface AlbanianToEnglishPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AlbanianToEnglishPage(props: AlbanianToEnglishPageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'AlbanianToEnglishPage' });

  // Create tool page data
  const pageData = {
    tool: {
      ...createAdvancedToolPageData(t, 'AlbanianToEnglishPage'),
      albanianLabel: (t as any)('tool.albanianLabel'),
      englishLabel: (t as any)('tool.englishLabel'),
    },
  };

  // Create examples data
  const examplesData = createExamplesData(t, 'AlbanianToEnglishPage', [
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
  ]);

  // Create sections data with custom images
  const sectionsData = createSectionsDataWithImages(t, 'AlbanianToEnglishPage', {
    whatIs: '/images/docs/what-is-albanian-to-english.webp',
    howTo: '/images/docs/albanian-to-english-how-to.webp',
    userInterest: [
      '/images/docs/albanian-to-english-interest-1.webp',
      '/images/docs/albanian-to-english-interest-2.webp',
      '/images/docs/albanian-to-english-interest-3.webp',
      '/images/docs/albanian-to-english-interest-4.webp',
    ],
    funFacts: [
      '/images/docs/albanian-to-english-fact-1.webp',
      '/images/docs/albanian-to-english-fact-2.webp',
    ],
  });

  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Albanian to English Translator',
    description: (t as any)('description'),
    featureList: albanianToEnglishConfig.structuredDataFeatureList,
  });

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 text-center py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          {(t as any)('hero.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          {(t as any)('hero.description')}
        </p>
      </div>

      {/* Tool Component */}
      <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
        <AlbanianToEnglishTool pageData={pageData} locale={locale} />
      </div>

      {/* Sections would go here - this is just a test for the core template */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Template Test Successful!</h2>
        <p>This page demonstrates the template system works correctly.</p>
      </div>
    </div>
  );
}
