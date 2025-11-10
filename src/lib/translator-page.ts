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
  before?: string;
  after?: string;
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
  unique: Section;
  testimonials: Section;
  faqs: Section;
  cta: {
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
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
  items:
    | Array<Record<string, unknown>>
    | Record<string, unknown>
    | null
    | undefined,
  icons: string[] = []
): Section['items'] {
  // Handle both array format and object format with item-1, item-2, etc. or numeric indices
  if (items && typeof items === 'object' && !Array.isArray(items)) {
    // Convert object format to array
    const itemArray = [];

    // First try item-1, item-2 format
    let index = 1;
    while (true) {
      const key = `item-${index}`;
      if (key in items) {
        itemArray.push((items as Record<string, unknown>)[key]);
        index++;
      } else {
        break;
      }
    }

    // If no items found with item-1 format, try numeric indices 0, 1, 2...
    if (itemArray.length === 0) {
      index = 0;
      while (true) {
        const key = index.toString();
        if (key in items) {
          itemArray.push((items as Record<string, unknown>)[key]);
          index++;
        } else {
          break;
        }
      }
    }

    items = itemArray;
  }

  return ensureArray(items as Array<Record<string, unknown>>).map(
    (item, index) => {
      const title =
        (item.title as string | undefined) ||
        (item.name as string | undefined) ||
        (item.question as string | undefined) ||
        '';
      return {
        title,
        description:
          (item.description as string | undefined) ||
          (item.content as string | undefined) ||
          (item.answer as string | undefined),
        icon: (item.icon as string | undefined) || icons[index] || undefined,
        image: normalizeImage(
          item.image,
          (item.imageAlt as string | undefined) ??
            (item.alt as string | undefined),
          title || undefined
        ),
        // Preserve original data for testimonials
        _originalData: item,
      };
    }
  );
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
    subtitle: (base?.subtitle as string | undefined) || defaults.subtitle,
    description:
      (base?.description as string | undefined) || defaults.description,
    image,
    items: mapSectionItems(
      base?.items as Array<Record<string, unknown>>,
      icons
    ),
  };
}

// Empty section for sections that don't have data
const emptySection: Section = {
  name: '',
  title: '',
  subtitle: '',
  description: '',
  items: [],
};

// Helper function to safely get raw translation without throwing errors
function safeRaw(
  t: TranslationGetter,
  key: string
): Record<string, unknown> | null {
  if (typeof t.raw !== 'function') {
    return null;
  }

  try {
    return t.raw(key) as Record<string, unknown>;
  } catch (error) {
    // Silently handle missing keys - these are optional sections
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'MISSING_MESSAGE'
    ) {
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

export function buildTranslatorPageContent(
  t: TranslationGetter,
  options: TranslatorPageContentOptions = {}
): TranslatorPageContent {
  const tool = safeRaw(t, 'tool') as ToolCopy | null;
  const examples = safeRaw(t, 'examples');
  const whatIs = safeRaw(t, 'whatIs');
  const howto = safeRaw(t, 'howto');
  const highlights = safeRaw(t, 'highlights');
  const funfacts = safeRaw(t, 'funfacts');
  const userInterest = safeRaw(t, 'userInterest');
  const unique = safeRaw(t, 'unique');
  const testimonials = safeRaw(t, 'testimonials');
  const faqs = safeRaw(t, 'faqs');
  const cta = safeRaw(t, 'cta');

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
      before: item.before,
      after: item.after,
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
      title: (howto?.title as string) || howToSection.title,
      description: (howto?.description as string) || howToSection.description,
      items:
        howto?.steps && typeof howto.steps === 'object'
          ? Object.values(howto.steps).map((step: any, index: number) => ({
              title: step.title || step.name || '',
              description: step.description,
              icon: options.howToIcons?.[index] || undefined,
            }))
          : [],
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
    funFacts: funfacts
      ? buildSection(funfacts, { name: 'funfacts' })
      : { ...emptySection, name: 'funfacts' },
    userInterest: buildSection(userInterest, { name: 'userInterest' }),
    unique: unique
      ? buildSection(unique, { name: 'unique' })
      : { ...emptySection, name: 'unique' },
    testimonials: buildSection(testimonials, { name: 'testimonials' }),
    faqs: buildSection(faqs, { name: 'faqs' }),
    cta: {
      title: (cta?.title as string) || '',
      description: (cta?.description as string) || '',
      primaryButton: (cta?.primaryButton as string) || '',
      secondaryButton: (cta?.secondaryButton as string) || '',
    },
  };
}

export type { TranslatorPageContent };
