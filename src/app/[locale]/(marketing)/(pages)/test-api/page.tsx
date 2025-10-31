import { AuroraBackground } from '@/components/ui/aurora-background';
import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import ApiTestingTool from './ApiTestingTool';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'TestApiPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    canonicalUrl: getUrlWithLocale('/test-api', locale),
    image: '/images/docs/what-is-vibetrans.webp',
  });
}

interface ApiTestingToolPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ApiTestingToolPage(
  props: ApiTestingToolPageProps
) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({
    locale,
    namespace: 'TestApiPage',
  });

  return (
    <AuroraBackground className="bg-white dark:bg-zinc-900 !pt-12 !h-auto">
      <Container className="px-4 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <header className="relative text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('description')}
            </p>
          </header>

          {/* Tool Component */}
          <ApiTestingTool />
        </div>
      </Container>
    </AuroraBackground>
  );
}