// @ts-nocheck - Translation keys type mismatch
import type {
  AdvancedToolConfig,
  SimpleToolConfig,
  ToolPageConfig,
} from './SimpleToolTemplate';

export function createSimpleToolPageData(
  t: any,
  namespace: string
): SimpleToolConfig {
  return {
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
  };
}

export function createAdvancedToolPageData(
  t: any,
  namespace: string
): AdvancedToolConfig {
  const baseData = createSimpleToolPageData(t, namespace);

  // Check for additional configurations
  const hasStyles = (t as any)('tool.styleLabel');
  const hasDialects = (t as any)('tool.dialectLabel');
  const hasLevels = (t as any)('tool.levelLabel');
  const hasIterations = (t as any)('tool.iterationsLabel');

  return {
    ...baseData,
    ...(hasStyles && {
      styleLabel: hasStyles,
      styles: {
        ...((t as any)('tool.styles.humor') && {
          humor: (t as any)('tool.styles.humor'),
        }),
        ...((t as any)('tool.styles.academic') && {
          academic: (t as any)('tool.styles.academic'),
        }),
        ...((t as any)('tool.styles.creative') && {
          creative: (t as any)('tool.styles.creative'),
        }),
        ...((t as any)('tool.styles.humorous') && {
          humorous: (t as any)('tool.styles.humorous'),
        }),
        ...((t as any)('tool.styles.technical') && {
          technical: (t as any)('tool.styles.technical'),
        }),
        ...((t as any)('tool.styles.business') && {
          business: (t as any)('tool.styles.business'),
        }),
        ...((t as any)('tool.styles.narrative') && {
          narrative: (t as any)('tool.styles.narrative'),
        }),
        ...((t as any)('tool.styles.absurd') && {
          absurd: (t as any)('tool.styles.absurd'),
        }),
        ...((t as any)('tool.styles.funny') && {
          funny: (t as any)('tool.styles.funny'),
        }),
        ...((t as any)('tool.styles.chaos') && {
          chaos: (t as any)('tool.styles.chaos'),
        }),
        ...((t as any)('tool.styles.random') && {
          random: (t as any)('tool.styles.random'),
        }),
        ...((t as any)('tool.styles.syllable') && {
          syllable: (t as any)('tool.styles.syllable'),
        }),
        ...((t as any)('tool.styles.reverse') && {
          reverse: (t as any)('tool.styles.reverse'),
        }),
        ...((t as any)('tool.styles.zalgo') &&
          typeof (t as any)('tool.styles.zalgo') === 'string' && {
            zalgo: (t as any)('tool.styles.zalgo'),
          }),
        ...((t as any)('tool.styles.symbols') &&
          typeof (t as any)('tool.styles.symbols') === 'string' && {
            symbols: (t as any)('tool.styles.symbols'),
          }),
        ...((t as any)('tool.styles.circle') &&
          typeof (t as any)('tool.styles.circle') === 'string' && {
            circle: (t as any)('tool.styles.circle'),
          }),
        ...((t as any)('tool.styles.square') &&
          typeof (t as any)('tool.styles.square') === 'string' && {
            square: (t as any)('tool.styles.square'),
          }),
        ...((t as any)('tool.styles.futuristic') &&
          typeof (t as any)('tool.styles.futuristic') === 'string' && {
            futuristic: (t as any)('tool.styles.futuristic'),
          }),
        ...((t as any)('tool.styles.cursive') &&
          typeof (t as any)('tool.styles.cursive') === 'string' && {
            cursive: (t as any)('tool.styles.cursive'),
          }),
      },
    }),
    ...(hasDialects && {
      dialectLabel: hasDialects,
      dialects: {
        ...((t as any)('tool.dialects.attic') && {
          attic: (t as any)('tool.dialects.attic'),
        }),
        ...((t as any)('tool.dialects.ionic') && {
          ionic: (t as any)('tool.dialects.ionic'),
        }),
        ...((t as any)('tool.dialects.doric') && {
          doric: (t as any)('tool.dialects.doric'),
        }),
        ...((t as any)('tool.dialects.aeolic') && {
          aeolic: (t as any)('tool.dialects.aeolic'),
        }),
        ...((t as any)('tool.dialects.koine') && {
          koine: (t as any)('tool.dialects.koine'),
        }),
      },
    }),
    ...(hasLevels && {
      levelLabel: hasLevels,
      levels: {
        ...((t as any)('tool.levels.a2') && {
          a2: (t as any)('tool.levels.a2'),
        }),
        ...((t as any)('tool.levels.b1') && {
          b1: (t as any)('tool.levels.b1'),
        }),
        ...((t as any)('tool.levels.b2') && {
          b2: (t as any)('tool.levels.b2'),
        }),
        ...((t as any)('tool.levels.c1') && {
          c1: (t as any)('tool.levels.c1'),
        }),
      },
    }),
    ...(hasIterations && {
      iterationsLabel: hasIterations,
    }),
    ...((t as any)('tool.downloadButton') && {
      downloadButton: (t as any)('tool.downloadButton'),
    }),
    ...((t as any)('tool.resetButton') && {
      resetButton: (t as any)('tool.resetButton'),
    }),
  };
}

export function createExamplesData(
  t: any,
  namespace: string,
  examples: Array<{ alt: string; name: string }>
) {
  return {
    title: (t as any)('examples.title'),
    description: (t as any)('examples.description'),
    images: examples,
  };
}

export function createSectionsDataWithImages(
  t: any,
  namespace: string,
  imageOverrides: {
    whatIs?: string;
    howTo?: string;
    userInterest?: string[];
    funFacts?: string[];
  } = {}
) {
  const baseData = {
    whatIsSection: {
      title: (t as any)('whatIs.title'),
      description: (t as any)('whatIs.description'),
      features: [],
      image: {
        src: imageOverrides.whatIs || '/images/docs/what-is-placeholder.webp',
        alt: `What is ${(namespace as string).replace('Page', '')}`,
      },
      cta: { text: (t as any)('ctaButton') },
    },
    howtoSection: {
      name: 'howto',
      title: (t as any)('howto.title'),
      description: (t as any)('howto.description'),
      image: {
        src: imageOverrides.howTo || '/images/docs/how-to-placeholder.webp',
        alt: `How to use ${(namespace as string).replace('Page', '')}`,
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
  };

  // Add user interest section if it exists
  if ((t as any)('userInterest.title')) {
    baseData.userInterestSection = {
      name: 'userinterest',
      title: (t as any)('userInterest.title'),
      items: [
        {
          title: (t as any)('userInterest.items.0.title'),
          description: (t as any)('userInterest.items.0.description'),
          image: {
            src:
              imageOverrides.userInterest?.[0] ||
              '/images/docs/user-interest-1.webp',
            alt: (t as any)('userInterest.items.0.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.1.title'),
          description: (t as any)('userInterest.items.1.description'),
          image: {
            src:
              imageOverrides.userInterest?.[1] ||
              '/images/docs/user-interest-2.webp',
            alt: (t as any)('userInterest.items.1.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.2.title'),
          description: (t as any)('userInterest.items.2.description'),
          image: {
            src:
              imageOverrides.userInterest?.[2] ||
              '/images/docs/user-interest-3.webp',
            alt: (t as any)('userInterest.items.2.title'),
          },
        },
        {
          title: (t as any)('userInterest.items.3.title'),
          description: (t as any)('userInterest.items.3.description'),
          image: {
            src:
              imageOverrides.userInterest?.[3] ||
              '/images/docs/user-interest-4.webp',
            alt: (t as any)('userInterest.items.3.title'),
          },
        },
      ],
    };
  }

  // Add fun facts section if it exists
  if ((t as any)('funfacts.title') || (t as any)('funFacts.title')) {
    baseData.funFactsSection = {
      name: 'funFacts',
      title: (t as any)('funfacts.title') || (t as any)('funFacts.title'),
      items: [
        {
          title:
            (t as any)('funfacts.items.0.title') ||
            (t as any)('funFacts.items.0.title'),
          description:
            (t as any)('funfacts.items.0.description') ||
            (t as any)('funFacts.items.0.description'),
          image: {
            src: imageOverrides.funFacts?.[0] || '/images/docs/fun-fact-1.webp',
            alt:
              (t as any)('funfacts.items.0.title') ||
              (t as any)('funFacts.items.0.title'),
          },
        },
        {
          title:
            (t as any)('funfacts.items.1.title') ||
            (t as any)('funFacts.items.1.title'),
          description:
            (t as any)('funfacts.items.1.description') ||
            (t as any)('funFacts.items.1.description'),
          image: {
            src: imageOverrides.funFacts?.[1] || '/images/docs/fun-fact-2.webp',
            alt:
              (t as any)('funfacts.items.1.title') ||
              (t as any)('funFacts.items.1.title'),
          },
        },
      ],
    };
  }

  return baseData;
}
