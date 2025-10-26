'use client';

import { useTranslations } from 'next-intl';

export interface ToolTranslation {
  title: string;
  description: string;
}

export function useToolTranslation(toolKey: string): ToolTranslation {
  // For now, we'll use a fallback approach
  // In the future, this could be optimized with dynamic imports
  const fallbackTranslations = {
    dogTranslator: {
      title: 'Dog Translator',
      description: 'Translate your words into dog language with AI',
    },
    genZTranslator: {
      title: 'Gen Z Translator',
      description: 'Translate between standard English and Gen Z slang',
    },
    // Add more tools as needed
  };

  return fallbackTranslations[toolKey as keyof typeof fallbackTranslations] || {
    title: toolKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    description: 'AI-powered translation tool',
  };
}