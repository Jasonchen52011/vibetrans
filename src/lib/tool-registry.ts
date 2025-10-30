/**
 * Dynamic Tool Registry System
 * This system replaces the hardcoded navbar-config with a metadata-driven approach
 */

import type {
  CategoryMetadata,
  ToolCategory,
  ToolMetadata,
  ToolRegistry,
} from '@/types/tool-metadata';

/**
 * Central tool registry that manages all tools and categories
 */
class DynamicToolRegistry implements ToolRegistry {
  public tools = new Map<string, ToolMetadata>();
  public categories = new Map<ToolCategory, ToolMetadata[]>();
  public categoryMetadata = new Map<ToolCategory, CategoryMetadata>();

  /**
   * Register a new tool in the system
   */
  register(tool: ToolMetadata): void {
    if (this.tools.has(tool.id)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Tool ${tool.id} is already registered. Overwriting.`);
      }
    }

    this.tools.set(tool.id, tool);

    // Update category grouping
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, []);
    }

    const categoryTools = this.categories.get(tool.category)!;
    const existingIndex = categoryTools.findIndex((t) => t.id === tool.id);

    if (existingIndex >= 0) {
      categoryTools[existingIndex] = tool;
    } else {
      categoryTools.push(tool);
      // Sort by priority
      categoryTools.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    }
  }

  /**
   * Register or update category metadata
   */
  registerCategory(category: CategoryMetadata): void {
    this.categoryMetadata.set(category.id, category);
  }

  /**
   * Get a tool by ID
   */
  getTool(id: string): ToolMetadata | undefined {
    return this.tools.get(id);
  }

  /**
   * Get all tools in a category
   */
  getToolsByCategory(category: ToolCategory): ToolMetadata[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get all enabled tools in a category
   */
  getEnabledToolsByCategory(category: ToolCategory): ToolMetadata[] {
    return this.getToolsByCategory(category).filter(
      (tool) => tool.enabled !== false
    );
  }

  /**
   * Get all enabled categories sorted by priority
   */
  getEnabledCategories(): CategoryMetadata[] {
    return Array.from(this.categoryMetadata.values())
      .filter((category) => category.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all tools filtered by tags
   */
  getToolsByTag(tag: string): ToolMetadata[] {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.tags?.includes(tag) && tool.enabled !== false
    );
  }

  /**
   * Remove a tool from the registry
   */
  unregister(id: string): boolean {
    const tool = this.tools.get(id);
    if (!tool) return false;

    this.tools.delete(id);

    const categoryTools = this.categories.get(tool.category);
    if (categoryTools) {
      const index = categoryTools.findIndex((t) => t.id === id);
      if (index >= 0) {
        categoryTools.splice(index, 1);
      }
    }

    return true;
  }

  /**
   * Get statistics about the registry
   */
  getStats() {
    const totalTools = this.tools.size;
    const enabledTools = Array.from(this.tools.values()).filter(
      (t) => t.enabled !== false
    ).length;
    const categoryCount = this.categories.size;

    return {
      totalTools,
      enabledTools,
      categoryCount,
      categories: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, tools]) => [
          cat,
          {
            total: tools.length,
            enabled: tools.filter((t) => t.enabled !== false).length,
          },
        ])
      ),
    };
  }
}

// Global registry instance
export const toolRegistry = new DynamicToolRegistry();

/**
 * Decorator for automatic tool registration
 */
export function RegisterTool(metadata: ToolMetadata) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    toolRegistry.register(metadata);
    return constructor;
  };
}

/**
 * Helper function to register tools programmatically
 */
export function registerTools(tools: ToolMetadata[]): void {
  tools.forEach((tool) => toolRegistry.register(tool));
}

/**
 * Helper function to register categories programmatically
 */
export function registerCategories(categories: CategoryMetadata[]): void {
  categories.forEach((category) => toolRegistry.registerCategory(category));
}
