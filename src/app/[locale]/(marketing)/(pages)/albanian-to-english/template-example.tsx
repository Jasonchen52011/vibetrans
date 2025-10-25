// @ts-nocheck - Translation keys type mismatch
import SimpleToolTemplate, {
  type ToolPageConfig,
  generateToolMetadata,
} from '@/components/templates/SimpleToolTemplate';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import AlbanianToEnglishTool from './AlbanianToEnglishTool';
// Tool configuration
const albanianToEnglishConfig: ToolPageConfig = {
  namespace: 'AlbanianToEnglishPage',
  route: '/albanian-to-english',
  imagePath: '/images/docs/what-is-albanian-to-english-translator.webp',
  toolComponent: AlbanianToEnglishTool,
  structuredDataFeatureList: [
    'Text Translation',
    'File Upload Support',
    'Instant Translation',
    'Cultural Context',
  ],
  exploreToolKeys: [
    'Ancient Greek Translator',
    'Creole to English Translator',
    'Esperanto Translator',
    'Gen Alpha Translator',
    'Bad Translator',
    'Gen Z Translator',
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

export default async function AlbanianToEnglishPage(
  props: AlbanianToEnglishPageProps
) {
  return (
    <SimpleToolTemplate
      params={props.params}
      config={albanianToEnglishConfig}
    />
  );
}
