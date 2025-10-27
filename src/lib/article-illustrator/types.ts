/**
 * Article Illustrator - Type Definitions
 */

export type SectionType = 'whatIs' | 'funFacts' | 'userInterests';

export interface SectionContent {
  title: string;
  content: string;
}

export interface ArticleSections {
  toolName: string;
  whatIs: SectionContent;
  funFacts: [SectionContent, SectionContent]; // 固定 2 个
  userInterests: [
    SectionContent,
    SectionContent,
    SectionContent,
    SectionContent,
  ]; // 固定 4 个
}

export interface GeneratedPrompt {
  section: SectionType;
  index?: number; // funFacts 和 userInterests 需要索引
  title: string;
  prompt: string;
  suggestedFilename: string;
}

export interface GeneratedImage {
  section: SectionType;
  index?: number;
  filename: string;
  path: string;
  size: number; // KB
  dimensions: string; // "800x600"
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface IllustrationResult {
  success: boolean;
  images: GeneratedImage[];
  howToScreenshot?: {
    filename: string;
    path: string;
    size: number;
  };
  error?: string;
}
