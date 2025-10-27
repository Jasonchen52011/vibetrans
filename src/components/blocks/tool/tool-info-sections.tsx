'use client';

import Icon from '@/components/icon';

interface HighlightItem {
  icon?: string;
  title?: string;
  description?: string;
}

interface FunFactImage {
  src?: string;
  alt?: string;
}

interface FunFactItem {
  title?: string;
  description?: string;
  image?: FunFactImage;
}

interface HighlightsData {
  title?: string;
  description?: string;
  items?: HighlightItem[];
}

interface FunFactsData {
  title?: string;
  items?: FunFactItem[];
}

interface ToolInfoSectionsProps {
  highlights?: HighlightsData;
  funFacts?: FunFactsData;
  className?: string;
}

export function ToolInfoSections({
  highlights,
  funFacts,
  className,
}: ToolInfoSectionsProps) {
  const hasHighlights = Boolean(highlights?.items?.length);
  const hasFunFacts = Boolean(funFacts?.items?.length);
}
