/**
 * Tool metadata types for VibeTrans navbar system
 * This file defines the core architecture for the dynamic navbar generation system
 */

export interface ToolMetadata {
  /** Unique identifier for the tool */
  id: string;
  /** Tool category classification */
  category: ToolCategory;
  /** Tool display name (will be used for translation key generation) */
  title: string;
  /** Brief description for SEO and tooltips */
  description: string;
  /** Route path from Routes enum */
  route: keyof import('./routes').Routes;
  /** Icon component name from lucide-react */
  icon: string;
  /** Tool priority for ordering within category (lower = higher priority) */
  priority?: number;
  /** Whether tool is enabled/visible */
  enabled?: boolean;
  /** Tool tags for search and filtering */
  tags?: string[];
}

export type ToolCategory =
  | 'funTranslate' // Fun and entertainment tools
  | 'gameTranslator' // Game and fiction language tools
  | 'toolTranslator'
  | 'languageTranslator' // Language translation tools
  | 'aiTools'; // AI-powered tools

export interface CategoryMetadata {
  /** Category identifier */
  id: ToolCategory;
  /** Category display name */
  title: string;
  /** Category display priority in navbar (lower = higher priority) */
  priority: number;
  /** Icon for the category */
  icon: string;
  /** Whether category should be shown in navbar */
  enabled: boolean;
}

export interface NavbarConfig {
  /** Static navbar items (Home, About, etc.) */
  staticItems: StaticNavItem[];
  /** Dynamic tool categories */
  toolCategories: CategoryMetadata[];
}

export interface StaticNavItem {
  title: string;
  href: string;
  external?: boolean;
  enabled?: boolean;
}

/**
 * Translation key structure for type safety
 */
export interface TranslationKeys {
  navbar: {
    [category in ToolCategory]: {
      title: string;
      items: {
        [toolId: string]: {
          title: string;
          description: string;
        };
      };
    };
  };
}

/**
 * Tool registry interface for the dynamic system
 */
export interface ToolRegistry {
  /** All registered tools */
  tools: Map<string, ToolMetadata>;
  /** Tools grouped by category */
  categories: Map<ToolCategory, ToolMetadata[]>;
  /** Category metadata */
  categoryMetadata: Map<ToolCategory, CategoryMetadata>;
}
