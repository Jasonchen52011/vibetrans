import UniversalToolTemplate from '@/components/tools/UniversalToolTemplate';
// @ts-nocheck - Translation keys type mismatch
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

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
    namespace: 'ChineseToEnglishTranslatorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${(t as any)('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/chinese-to-english-translator', locale),
    image: '/images/docs/what-is-chinese-to-english-translator.webp',
  });
}

interface ChineseToEnglishTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ChineseToEnglishTranslatorPage(
  props: ChineseToEnglishTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'ChineseToEnglishTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Chinese to English Translator',
    description: (t as any)('description'),
  });

  // Minimal page data for the tool - only what's needed for initial render
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
      modeLabel: (t as any)('tool.modeLabel'),
      modeGeneral: (t as any)('tool.modeGeneral'),
      modeGeneralDesc: (t as any)('tool.modeGeneralDesc'),
      modeTechnical: (t as any)('tool.modeTechnical'),
      modeTechnicalDesc: (t as any)('tool.modeTechnicalDesc'),
      modeLegal: (t as any)('tool.modeLegal'),
      modeLegalDesc: (t as any)('tool.modeLegalDesc'),
      modeLiterary: (t as any)('tool.modeLiterary'),
      modeLiteraryDesc: (t as any)('tool.modeLiteraryDesc'),
      modeIdioms: (t as any)('tool.modeIdioms'),
      modeIdiomsDesc: (t as any)('tool.modeIdiomsDesc'),
      inputTypeLabel: (t as any)('tool.inputTypeLabel'),
      textInput: (t as any)('tool.textInput'),
      imageInput: (t as any)('tool.imageInput'),
      audioInput: (t as any)('tool.audioInput'),
      imageUploadPlaceholder: (t as any)('tool.imageUploadPlaceholder'),
      imageSupportedFormats: (t as any)('tool.imageSupportedFormats'),
      imageHint: (t as any)('tool.imageHint'),
      extractedTextLabel: (t as any)('tool.extractedTextLabel'),
      noImage: (t as any)('tool.noImage'),
      recordButton: (t as any)('tool.recordButton'),
      recording: (t as any)('tool.recording'),
      stopRecording: (t as any)('tool.stopRecording'),
      audioHint: (t as any)('tool.audioHint'),
      microphonePermission: (t as any)('tool.microphonePermission'),
      transcriptionLabel: (t as any)('tool.transcriptionLabel'),
      noAudio: (t as any)('tool.noAudio'),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section */}
        <div className="bg-white dark:bg-zinc-900 pt-12 pb-8">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {(t as any)('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {(t as any)('hero.description')}
            </p>
          </div>
        </div>

        {/* Tool Component - Dynamically Loaded */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <UniversalToolTemplate
            toolPath="chinese-to-english-translator"
            pageData={pageData}
            locale={locale}
          />
        </div>
      </div>
    </>
  );
}
