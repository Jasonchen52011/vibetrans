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
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY; // 添加 NEXT_PUBLIC 支持
    if (!apiKey) {
      throw new Error(
        'Missing Gemini API key. Please set GEMINI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY environment variable.'
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

STYLE REQUIREMENTS:
1. Visual Language: Pure symbolic illustration - communicate through icons, shapes, colors, and characters only
2. Aesthetic: Minimalist geometric flat design (几何扁平风) - clean, modern, ultra-simple
3. Color Palette: Sky blue (#87CEEB) dominant, with soft pastels (light yellow, pink, mint green)
4. Composition: 4:3 horizontal, centered, spacious negative space
5. Elements: Visual metaphors only - use objects, icons, character gestures, color coding, arrows, abstract shapes
6. Theme: "${title}" - express this concept purely through imagery and symbols
7. Mood: Cheerful, friendly, welcoming, soft, approachable
8. Simplicity: Maximum visual clarity - every element must be instantly recognizable

Output format:
First line: FILENAME: [2-3 word filename describing the VISUAL elements, e.g., "phone-conversation" or "travel-icons"]
Second line onward: [Image generation prompt in one paragraph, 40-60 words, focus on WHAT TO SHOW, not what to avoid]

Example:
FILENAME: music-wave-flow
Minimalist geometric flat illustration, sky blue gradient background, simple sound wave shapes flowing horizontally, small cartoon character with headphones, pastel yellow and pink accent circles, clean modern design, 4:3 aspect ratio, ultra-simple symbolic style

Now generate:`;
}

/**
 * Extract a suggested filename from Gemini response
 */
function extractFilename(geminiResponse: string): string {
  // Look for FILENAME: prefix in response
  const filenameMatch = geminiResponse.match(/^FILENAME:\s*([a-z0-9-]+)/im);

  if (filenameMatch) {
    const filename = filenameMatch[1].trim().toLowerCase();
    // Ensure max 3 words (2 hyphens)
    const words = filename.split('-').slice(0, 3);
    return words.join('-');
  }

  // Fallback: generate from first few words
  const words = geminiResponse
    .toLowerCase()
    .match(/\b[a-z]{3,}\b/g);

  if (words && words.length > 0) {
    return words.slice(0, 3).join('-');
  }

  return 'illustration';
}

/**
 * Extract prompt from Gemini response (remove FILENAME line)
 */
function extractPrompt(geminiResponse: string): string {
  // Remove FILENAME: line if present
  return geminiResponse.replace(/^FILENAME:.*\n?/im, '').trim();
}

/**
 * Generate single prompt with Gemini
 */
async function generateSinglePrompt(
  sectionType: SectionType,
  title: string,
  content: string
): Promise<{ prompt: string; filename: string }> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const promptTemplate = generatePromptTemplate(sectionType, title, content);

  const result = await model.generateContent(promptTemplate);
  const response = result.response;
  const geminiResponse = response.text().trim();

  const filename = extractFilename(geminiResponse);
  let prompt = extractPrompt(geminiResponse);

  // 🔧 简化prompt - 移除可能触发文字的具体词汇
  const textTriggerWords = ['text', 'letter', 'word', 'sign', 'label', 'book', 'document', 'paper', 'menu'];
  textTriggerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}s?\\b`, 'gi');
    prompt = prompt.replace(regex, 'symbol');
  });

  // 🔧 添加极简风格强化（正向描述）
  prompt = `${prompt}, pure visual communication, minimalist symbolic design`;

  console.log(`[Gemini] Generated for "${title}":`, {
    filename,
    prompt: prompt.substring(0, 100) + '...',
  });

  return { prompt, filename };
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
    const whatIsResult = await generateSinglePrompt(
      'whatIs',
      sections.whatIs.title,
      sections.whatIs.content
    );
    prompts.push({
      section: 'whatIs',
      title: sections.whatIs.title,
      prompt: whatIsResult.prompt,
      suggestedFilename: whatIsResult.filename,
    });

    // 2. Fun Facts sections (2 张)
    if (sections.funFacts && sections.funFacts.length > 0) {
      console.log('\n🎨 Generating prompts for Fun Facts sections...');
      for (let i = 0; i < sections.funFacts.length; i++) {
        const funFact = sections.funFacts[i];
        const result = await generateSinglePrompt(
          'funFacts',
          funFact.title,
          funFact.content
        );
        prompts.push({
          section: 'funFacts',
          index: i,
          title: funFact.title,
          prompt: result.prompt,
          suggestedFilename: result.filename,
        });
      }
    }

    // 3. User Interests sections (4 张)
    if (sections.userInterests && sections.userInterests.length > 0) {
      console.log('\n🎨 Generating prompts for User Interests sections...');
      for (let i = 0; i < sections.userInterests.length; i++) {
        const interest = sections.userInterests[i];
        const result = await generateSinglePrompt(
          'userInterests',
          interest.title,
          interest.content
        );
        prompts.push({
          section: 'userInterests',
          index: i,
          title: interest.title,
          prompt: result.prompt,
          suggestedFilename: result.filename,
        });
      }
    }

    const funFactsCount = sections.funFacts?.length || 0;
    const userInterestsCount = sections.userInterests?.length || 0;

    console.log(
      `\n✅ Successfully generated ${prompts.length} prompts (1 What Is${funFactsCount > 0 ? ` + ${funFactsCount} Fun Facts` : ''}${userInterestsCount > 0 ? ` + ${userInterestsCount} User Interests` : ''})`
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
): Promise<{ prompt: string; filename: string }> {
  return generateSinglePrompt('whatIs', title, content);
}
