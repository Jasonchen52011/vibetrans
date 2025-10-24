#!/usr/bin/env node

/**
 * Generate additional images for Telugu to English translator
 * Font Compatibility, Design Applications, Microsoft's Creation, Hidden Easter Eggs
 * Sequential processing only with Volcano 4.0 API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage } from '../src/lib/volcano-image';

// 内容定义
const ADDITIONAL_CONTENTS = [
  {
    key: 'fontCompatibility',
    title: 'Font Compatibility',
    description:
      'Our Telugu to English translator ensures proper font rendering and compatibility across different devices and platforms. The translation maintains text readability and preserves the original formatting while converting between Telugu and English scripts.',
  },
  {
    key: 'designApplications',
    title: 'Design Applications',
    description:
      'Perfect for designers working on bilingual projects, UI/UX design, typography work, and creative applications. The translator helps maintain design consistency while translating Telugu content to English for international audiences.',
  },
  {
    key: 'microsoftCreation',
    title: "Microsoft's Creation",
    description:
      'Microsoft has been instrumental in developing advanced translation technologies using AI and machine learning. Their translation services have revolutionized how we communicate across language barriers globally.',
  },
  {
    key: 'hiddenEasterEggs',
    title: 'Hidden Easter Eggs',
    description:
      'Discover fun hidden features and Easter eggs in our translator! Try special Telugu phrases, use keyboard shortcuts, and explore advanced features that make translation more enjoyable and efficient.',
  },
];

/**
 * Generate prompt for each content using Gemini
 */
async function generatePromptForContent(
  title: string,
  description: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate a detailed image generation prompt for a geometric flat-style illustration about "${title}".

Context: ${description}

Requirements:
- Minimalist geometric flat illustration style
- Sky blue (#87CEEB) as the primary background color
- Pastel colors: light yellow (#FFF44F), soft pink (#FF6B6B), mint green (#50C878)
- Clean, modern design with symbolic representations
- 4:3 aspect ratio, 800x600px
- Center composition with good use of negative space
- No text or letters in the image, only visual symbols

Provide only the image prompt without any additional text:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(`❌ Failed to generate prompt for ${title}:`, error);
    throw error;
  }
}

/**
 * Generate image using only Volcano 4.0
 */
async function generateImageWithVolcanoOnly(prompt: string, filename: string) {
  console.log(`🎨 [Volcano 4.0] Generating image for: ${filename}`);
  console.log(`📝 [Volcano 4.0] Prompt: ${prompt.substring(0, 100)}...`);

  try {
    const imageResult = await generateImage({
      prompt: prompt,
      mode: 'text',
    });

    console.log(`✅ Volcano 4.0 image generated: ${imageResult.data[0].url}`);

    // Convert to WebP
    console.log(`📦 Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageResult.data[0].url, {
      filename: filename,
      targetSize: 90,
    });

    if (webpResult.success) {
      console.log(
        `✅ [WebP] 转换完成: ${webpResult.filename} (${webpResult.size}KB)`
      );
      return webpResult.filename;
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error(`❌ [Volcano 4.0] Generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main function - sequential processing
 */
async function generateAdditionalImages() {
  console.log('\n' + '='.repeat(80));
  console.log(
    '🎨 Generating Additional Images for Telugu to English Translator'
  );
  console.log('='.repeat(80) + '\n');

  const generatedFiles: string[] = [];

  for (let i = 0; i < ADDITIONAL_CONTENTS.length; i++) {
    const content = ADDITIONAL_CONTENTS[i];
    const index = i + 1;

    console.log(
      `\n📋 [${index}/${ADDITIONAL_CONTENTS.length}] Processing: ${content.title}`
    );
    console.log(
      `   Description: ${content.description.substring(0, 100)}...\n`
    );

    try {
      // Step 1: Generate prompt with Gemini
      console.log(`🧠 Step 1: Generating prompt with Gemini...`);
      const prompt = await generatePromptForContent(
        content.title,
        content.description
      );
      console.log(`✅ Prompt generated (${prompt.length} chars)\n`);

      // Step 2: Generate image with Volcano 4.0
      console.log(`🎨 Step 2: Generating image with Volcano 4.0...`);
      const filename = `telugu-to-english-translator-${content.key}.webp`;
      const generatedFile = await generateImageWithVolcanoOnly(
        prompt,
        filename
      );
      generatedFiles.push(generatedFile);

      console.log(
        `✅ [${index}/${ADDITIONAL_CONTENTS.length}] Success: ${generatedFile}\n`
      );

      // Small delay between requests to avoid rate limiting
      if (index < ADDITIONAL_CONTENTS.length) {
        console.log(`⏳ Waiting 2 seconds before next request...\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to generate image for ${content.title}: ${error.message}\n`
      );
      // Continue with next image even if one fails
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(
    `✅ Successfully generated: ${generatedFiles.length}/${ADDITIONAL_CONTENTS.length} images`
  );

  if (generatedFiles.length > 0) {
    console.log('\n📁 Generated Files:');
    generatedFiles.forEach((file) => {
      console.log(`   ✓ ${file}`);
    });
    console.log(`\n💾 Location: public/images/docs/`);
  }

  console.log('='.repeat(80) + '\n');

  return generatedFiles;
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the generation
generateAdditionalImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
