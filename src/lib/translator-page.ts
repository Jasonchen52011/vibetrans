import type { Section } from '@/types/blocks/section';

type TranslationGetter = {
  <T = unknown>(key: string, params?: Record<string, unknown>): T;
  raw: <T = unknown>(key: string) => T;
};

interface TranslatorPageContentOptions {
  howToIcons?: string[];
  highlightIcons?: string[];
}

interface BeforeAfterGalleryItem {
  alt: string;
  name?: string;
  src?: string;
  audio?: string;
  emotion?: string;
}

interface BeforeAfterGallery {
  title: string;
  description?: string;
  images: BeforeAfterGalleryItem[];
}

interface ToolCopy {
  inputLabel?: string;
  outputLabel?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  translateButton?: string;
  uploadButton?: string;
  uploadHint?: string;
  loading?: string;
  error?: string;
  noInput?: string;
  [key: string]: unknown;
}

interface TranslatorPageContent {
  pageData: {
    tool: ToolCopy;
  };
  examples: BeforeAfterGallery;
  whatIs: {
    title: string;
    description?: string;
    features: string[];
    image?: {
      src: string;
      alt: string;
    };
    cta?: {
      text?: string;
    };
  };
  howTo: Section;
  highlights: Section;
  funFacts: Section;
  userInterest: Section;
}

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeImage(
  image: unknown,
  alt?: unknown,
  fallbackAlt?: string
):
  | {
      src: string;
      alt: string;
    }
  | undefined {
  if (typeof image === 'string') {
    return {
      src: image,
      alt: (alt as string | undefined) ?? fallbackAlt ?? '',
    };
  }

  if (image && typeof image === 'object') {
    const src = (image as Record<string, unknown>).src as string | undefined;
    const resolvedAlt =
      ((image as Record<string, unknown>).alt as string | undefined) ??
      (alt as string | undefined) ??
      fallbackAlt;
    if (src) {
      return {
        src,
        alt: resolvedAlt ?? '',
      };
    }
  }

  return undefined;
}

function mapSectionItems(
  items: Array<Record<string, unknown>> | null | undefined,
  icons: string[] = []
): Section['items'] {
  return ensureArray(items).map((item, index) => {
    const title =
      (item.title as string | undefined) ||
      (item.name as string | undefined) ||
      '';
    return {
      title,
      description:
        (item.description as string | undefined) ||
        (item.content as string | undefined),
      icon:
        (item.icon as string | undefined) ||
        icons[index] ||
        undefined,
      image: normalizeImage(
        item.image,
        (item.imageAlt as string | undefined) ??
          (item.alt as string | undefined),
        title || undefined
      ),
    };
  });
}

function buildSection(
  base: Record<string, unknown> | null | undefined,
  defaults: Partial<Section> = {},
  icons: string[] = []
): Section {
  const title =
    (base?.title as string | undefined) ||
    (base?.name as string | undefined) ||
    defaults.title;

  const image =
    normalizeImage(
      base?.image,
      base?.imageAlt,
      (title as string | undefined) ?? defaults.title
    ) ?? defaults.image;

  return {
    name: (base?.name as string | undefined) || defaults.name,
    title,
    subtitle:
      (base?.subtitle as string | undefined) || defaults.subtitle,
    description:
      (base?.description as string | undefined) || defaults.description,
    image,
    items: mapSectionItems(
      base?.items as Array<Record<string, unknown>>,
      icons
    ),
  };
}

export function buildTranslatorPageContent(
  t: TranslationGetter,
  options: TranslatorPageContentOptions = {}
): TranslatorPageContent {
  const tool = (typeof t.raw === 'function' ? t.raw('tool') : null) as
    | ToolCopy
    | null;
  const examples = (typeof t.raw === 'function'
    ? t.raw('examples')
    : null) as Record<string, unknown> | null;
  const whatIs = (typeof t.raw === 'function'
    ? t.raw('whatIs')
    : null) as Record<string, unknown> | null;
  const howto = (typeof t.raw === 'function' ? t.raw('howto') : null) as
    | Record<string, unknown>
    | null;
  const highlights = (typeof t.raw === 'function'
    ? t.raw('highlights')
    : null) as Record<string, unknown> | null;
  const funfacts = (typeof t.raw === 'function'
    ? t.raw('funfacts')
    : null) as Record<string, unknown> | null;
  const userInterest = (typeof t.raw === 'function'
    ? t.raw('userInterest')
    : null) as Record<string, unknown> | null;

  const beforeAfterGallery: BeforeAfterGallery = {
    title: (examples?.title as string) ?? '',
    description: (examples?.description as string) ?? '',
    images: ensureArray(
      examples?.items as BeforeAfterGalleryItem[] | undefined
    ).map((item) => ({
      alt: item.alt,
      name: item.name,
      src: item.src,
      audio: item.audio,
      emotion: item.emotion,
    })),
  };

  const howToSection = buildSection(
    howto,
    { name: 'howto' },
    options.howToIcons
  );

  // Preserve images for how-to steps (icon mapping handled separately)
  if (howto?.image && typeof howto.image === 'object') {
    howToSection.image = {
      src: (howto.image as Record<string, unknown>).src as string,
      alt:
        ((howto.image as Record<string, unknown>).alt as string) ||
        howToSection.title ||
        '',
    };
  }

  return {
    pageData: {
      tool: {
        ...(tool ?? {}),
      },
    },
    examples: beforeAfterGallery,
    whatIs: {
      title: (whatIs?.title as string) ?? '',
      description: (whatIs?.description as string) ?? '',
      features: ensureArray(whatIs?.features as string[] | undefined),
      image: normalizeImage(
        whatIs?.image,
        whatIs?.imageAlt,
        (whatIs?.title as string | undefined) ?? undefined
      ),
      cta: {
        text: t('ctaButton') as string | undefined,
      },
    },
    howTo: {
      ...howToSection,
      items: ensureArray(howto?.steps as Array<Record<string, unknown>>).map(
        (step, index) => ({
          title:
            (step.title as string | undefined) ||
            (step.name as string | undefined) ||
            '',
          description: step.description as string | undefined,
          icon:
            (step.icon as string | undefined) ||
            options.howToIcons?.[index] ||
            undefined,
        })
      ),
      image:
        normalizeImage(
          howto?.image,
          howto?.imageAlt,
          (howto?.title as string | undefined) ?? undefined
        ) ?? howToSection.image,
    },
    highlights: buildSection(
      highlights,
      { name: 'highlights' },
      options.highlightIcons
    ),
    funFacts: buildSection(funfacts, { name: 'funfacts' }),
    userInterest: buildSection(userInterest, { name: 'userInterest' }),
  };
}

export type { TranslatorPageContent };
