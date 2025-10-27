/**
 * Type-safe translation key generation and validation system
 * This eliminates hardcoded translation keys and provides compile-time safety
 */

import type {
  ToolCategory,
  ToolMetadata,
  TranslationKeys,
} from '@/types/tool-metadata';

/**
 * Generate translation keys for a tool based on its metadata
 * This ensures consistent translation key structure across the app
 */
export function generateToolTranslationKey(tool: ToolMetadata): {
  titleKey: string;
  descriptionKey: string;
  namespace: 'Marketing.navbar';
} {
  const { category, id } = tool;

  return {
    titleKey: `${category}.items.${id}.title`,
    descriptionKey: `${category}.items.${id}.description`,
    namespace: 'Marketing.navbar' as const,
  };
}

/**
 * Generate translation keys for a category
 */
export function generateCategoryTranslationKey(category: ToolCategory): {
  titleKey: string;
  namespace: 'Marketing.navbar';
} {
  return {
    titleKey: `${category}.title`,
    namespace: 'Marketing.navbar' as const,
  };
}

/**
 * Type-safe translation key validator
 * Ensures that all required translation keys exist
 */
export class TranslationKeyValidator {
  private missingKeys: string[] = [];
  private validKeys: Set<string> = new Set();

  constructor(private translations: any) {
    this.preprocessTranslations();
  }

  private preprocessTranslations(): void {
    const extractKeys = (obj: any, prefix = ''): void => {
      Object.keys(obj).forEach((key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractKeys(obj[key], fullKey);
        } else {
          this.validKeys.add(fullKey);
        }
      });
    };

    extractKeys(this.translations);
  }

  /**
   * Validate a tool's translation keys
   */
  validateTool(tool: ToolMetadata): boolean {
    const { titleKey, descriptionKey } = generateToolTranslationKey(tool);

    const titleValid = this.validKeys.has(`Marketing.navbar.${titleKey}`);
    const descriptionValid = this.validKeys.has(
      `Marketing.navbar.${descriptionKey}`
    );

    if (!titleValid) {
      this.missingKeys.push(`Marketing.navbar.${titleKey}`);
    }

    if (!descriptionValid) {
      this.missingKeys.push(`Marketing.navbar.${descriptionKey}`);
    }

    return titleValid && descriptionValid;
  }

  /**
   * Validate a category's translation keys
   */
  validateCategory(category: ToolCategory): boolean {
    const { titleKey } = generateCategoryTranslationKey(category);
    const isValid = this.validKeys.has(`Marketing.navbar.${titleKey}`);

    if (!isValid) {
      this.missingKeys.push(`Marketing.navbar.${titleKey}`);
    }

    return isValid;
  }

  /**
   * Get all missing translation keys
   */
  getMissingKeys(): string[] {
    return [...this.missingKeys];
  }

  /**
   * Clear missing keys (useful for re-validation)
   */
  clearMissingKeys(): void {
    this.missingKeys = [];
  }

  /**
   * Generate a report of all translation issues
   */
  generateReport(
    tools: ToolMetadata[],
    categories: ToolCategory[]
  ): {
    validTools: number;
    validCategories: number;
    missingKeys: string[];
    totalTools: number;
    totalCategories: number;
  } {
    this.clearMissingKeys();

    const validTools = tools.filter((tool) => this.validateTool(tool)).length;
    const validCategories = categories.filter((cat) =>
      this.validateCategory(cat)
    ).length;

    return {
      validTools,
      validCategories,
      missingKeys: this.getMissingKeys(),
      totalTools: tools.length,
      totalCategories: categories.length,
    };
  }
}

/**
 * Hook for using validated translations
 * This provides type safety and runtime validation
 */
export function useValidatedTranslations(
  tools: ToolMetadata[],
  categories: ToolCategory[]
) {
  // This would be implemented in the actual navbar hook
  // For now, it's a placeholder for the interface
  return {
    getToolTranslation: (tool: ToolMetadata) => {
      const { titleKey, descriptionKey } = generateToolTranslationKey(tool);
      return {
        title: titleKey,
        description: descriptionKey,
        titleKey,
        descriptionKey,
      };
    },
    getCategoryTranslation: (category: ToolCategory) => {
      const { titleKey } = generateCategoryTranslationKey(category);
      return {
        title: titleKey,
        titleKey,
      };
    },
    validateKeys: (translations: any) => {
      const validator = new TranslationKeyValidator(translations);
      return validator.generateReport(tools, categories);
    },
  };
}
