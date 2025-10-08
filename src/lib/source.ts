/**
 * Simplified source file without fumadocs dependency
 * Provides type definitions for blog, changelog, and pages
 */

// Basic type definitions
export interface BlogType {
  slugs: string[];
  data: {
    title: string;
    description?: string;
    date: string;
    image?: string;
    author: string;
    categories: string[];
    premium?: boolean;
  };
}

export interface ChangelogType {
  slugs: string[];
  data: {
    title: string;
    description?: string;
    date: string;
    version?: string;
    body?: any;
  };
}

export interface PagesType {
  slugs: string[];
  data: {
    title: string;
    description?: string;
    date?: string;
    body?: any;
  };
}

export interface AuthorType {
  slugs: string[];
  data: {
    name: string;
    avatar?: string;
  };
}

export interface CategoryType {
  slugs: string[];
  data: {
    name: string;
  };
}

// Simplified source implementation
const createEmptySource = <T>() => ({
  getPage: (slugs: string[], locale?: string): T | undefined => undefined,
  getPages: (locale?: string): T[] => [],
});

export const authorSource = createEmptySource<AuthorType>();
export const categorySource = createEmptySource<CategoryType>();
export const blogSource = createEmptySource<BlogType>();
export const changelogSource = createEmptySource<ChangelogType>();
export const pagesSource = createEmptySource<PagesType>();

// For docs (not used anymore but exported for compatibility)
export const source = createEmptySource<any>();
