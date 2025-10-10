/**
 * Gemini Analyzer - Generate image prompts for article illustrations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ArticleSections,
  GeneratedPrompt,
  SectionContent,
  SectionType,
} from './types';

// Lazy initialization of GoogleGenerativeAI to allow environment variables to be loaded
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing Gemini API key. Please set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable.'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate image prompt for a specific section
 */
function generatePromptTemplate(
  sectionType: SectionType,
  title: string,
  content: string
): string {
  return `You are an expert at creating image generation prompts for geometric flat-style illustrations.

Generate a detailed image prompt based on the following section:

Section Type: ${sectionType}
Section Title: ${title}
Section Content: ${content}

STRICT REQUIREMENTS:
1. Style: Geometric Flat Style (几何扁平风), cartoon illustration, modern and clean
2. Color Palette: Sky blue (#87CEEB) as PRIMARY color, with soft pastel accents (light yellow, pink, mint green)
3. Composition: 4:3 aspect ratio, horizontal layout, centered composition
4. Elements: Absolutely NO text, NO logos, NO words, NO letters of any kind
5. Keywords: Must naturally incorporate the section title keywords: "${title}"
6. Mood: Cheerful, welcoming, soft, minimalist, friendly
7. Shapes: Use simple geometric shapes (circles, rectangles, triangles), clean lines
8. Background: Sky blue gradient or solid, with optional soft clouds or abstract shapes

Output ONLY the image generation prompt in English (one paragraph, 50-80 words), no explanations, no metadata.

Example format:
"Geometric flat illustration showing [concept from title], sky blue background with soft gradient, simplified [key elements] in pastel colors, clean minimalist design with circular and rectangular shapes, 4:3 aspect ratio, cheerful and welcoming atmosphere, modern flat style, no text or logos"

Now generate the prompt:`;
}

/**
 * Extract a suggested filename from the prompt
 */
function extractFilename(prompt: string, title: string): string {
  // 从标题提取关键词
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with'].includes(w));

  // 取前 2-3 个关键词
  const keywords = titleWords.slice(0, 3);

  if (keywords.length === 0) {
    // fallback: 从 prompt 提取
    const match = prompt.match(/showing\s+([a-z\s]+?),/i);
    if (match) {
      return match[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .substring(0, 30);
    }
    return 'illustration';
  }

  return keywords.join('-');
}

/**
 * Generate single prompt with Gemini
 */
async function generateSinglePrompt(
  sectionType: SectionType,
  title: string,
  content: string
): Promise<string> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const promptTemplate = generatePromptTemplate(sectionType, title, content);

  const result = await model.generateContent(promptTemplate);
  const response = result.response;
  const generatedPrompt = response.text().trim();

  console.log(`[Gemini] Generated prompt for "${title}":`, generatedPrompt);

  return generatedPrompt;
}

/**
 * Analyze all sections and generate prompts
 */
export async function analyzeArticleSections(
  sections: ArticleSections
): Promise<GeneratedPrompt[]> {
  const prompts: GeneratedPrompt[] = [];

  try {
    // 1. What is section (1 张)
    console.log('\n🎨 Generating prompt for What Is section...');
    const whatIsPrompt = await generateSinglePrompt(
      'whatIs',
      sections.whatIs.title,
      sections.whatIs.content
    );
    prompts.push({
      section: 'whatIs',
      title: sections.whatIs.title,
      prompt: whatIsPrompt,
      suggestedFilename: extractFilename(whatIsPrompt, sections.whatIs.title),
    });

    // 2. Fun Facts sections (2 张)
    console.log('\n🎨 Generating prompts for Fun Facts sections...');
    for (let i = 0; i < sections.funFacts.length; i++) {
      const funFact = sections.funFacts[i];
      const funFactPrompt = await generateSinglePrompt(
        'funFacts',
        funFact.title,
        funFact.content
      );
      prompts.push({
        section: 'funFacts',
        index: i,
        title: funFact.title,
        prompt: funFactPrompt,
        suggestedFilename: extractFilename(funFactPrompt, funFact.title),
      });
    }

    // 3. User Interests sections (4 张)
    console.log('\n🎨 Generating prompts for User Interests sections...');
    for (let i = 0; i < sections.userInterests.length; i++) {
      const interest = sections.userInterests[i];
      const interestPrompt = await generateSinglePrompt(
        'userInterests',
        interest.title,
        interest.content
      );
      prompts.push({
        section: 'userInterests',
        index: i,
        title: interest.title,
        prompt: interestPrompt,
        suggestedFilename: extractFilename(interestPrompt, interest.title),
      });
    }

    console.log(
      `\n✅ Successfully generated ${prompts.length} prompts (1 What Is + 2 Fun Facts + 4 User Interests)`
    );
    return prompts;
  } catch (error) {
    console.error('❌ Error generating prompts with Gemini:', error);
    throw error;
  }
}

/**
 * Test helper - Generate single prompt
 */
export async function testGeneratePrompt(
  title: string,
  content: string
): Promise<string> {
  return generateSinglePrompt('whatIs', title, content);
}
