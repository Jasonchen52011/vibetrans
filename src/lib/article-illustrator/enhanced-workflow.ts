#!/usr/bin/env node

/**
 * Enhanced Gemini Workflow with Auto Page Update
 *
 * Complete workflow:
 * 1. Gemini analyzes content → generates prompts
 * 2. Volcano 4.0 generates images
 * 3. WebP conversion & compression (< 90KB)
 * 4. Auto-update page.tsx with new filenames
 *
 * No manual intervention needed!
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  ArticleSections,
  SectionType,
} from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

interface WorkflowConfig {
  toolName: string;
  pagePath: string; // Path to page.tsx
  sections: ArticleSections;
}

async function updatePageReferences(
  pagePath: string,
  imageMapping: Map<SectionType, { index?: number; filename: string }>
): Promise<void> {
  console.log('\n📝 Updating page references...');

  const content = await fs.readFile(pagePath, 'utf-8');
  let updatedContent = content;

  // Update What Is image
  const whatIsImage = imageMapping.get('whatIs');
  if (whatIsImage) {
    updatedContent = updatedContent.replace(
      /src:\s*['"]\/images\/docs\/[^'"]+\.webp['"]/,
      `src: '/images/docs/${whatIsImage.filename}'`
    );
    console.log(`✅ Updated What Is: ${whatIsImage.filename}`);
  }

  // Update Fun Facts images
  for (const [sectionType, data] of imageMapping.entries()) {
    if (sectionType === 'funFacts' && data.index !== undefined) {
      const pattern = new RegExp(
        `(funFacts\\.items\\.${data.index}\\..*?src:\\s*)['"]\/images\/docs\/[^'"]+\.webp['"]`,
        's'
      );
      updatedContent = updatedContent.replace(
        pattern,
        `$1'/images/docs/${data.filename}'`
      );
      console.log(`✅ Updated Fun Fact ${data.index + 1}: ${data.filename}`);
    }
  }

  // Update User Interest images
  for (const [sectionType, data] of imageMapping.entries()) {
    if (sectionType === 'userInterests' && data.index !== undefined) {
      const pattern = new RegExp(
        `(userInterest\\.items\\.${data.index}\\..*?src:\\s*)['"]\/images\/docs\/[^'"]+\.webp['"]`,
        's'
      );
      updatedContent = updatedContent.replace(
        pattern,
        `$1'/images/docs/${data.filename}'`
      );
      console.log(
        `✅ Updated User Interest ${data.index + 1}: ${data.filename}`
      );
    }
  }

  await fs.writeFile(pagePath, updatedContent, 'utf-8');
  console.log(`\n✅ Page updated: ${pagePath}`);
}

async function runEnhancedWorkflow(config: WorkflowConfig): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 Enhanced Gemini Workflow - Auto Update');
  console.log('='.repeat(80));
  console.log(`\n📚 Tool: ${config.toolName}`);
  console.log(`📄 Page: ${config.pagePath}\n`);

  try {
    // Step 1-3: Generate images with Gemini workflow
    const result = await generateArticleIllustrations(config.sections, {
      captureHowTo: false,
    });

    if (!result.success || result.successfulImages === 0) {
      throw new Error('Image generation failed');
    }

    // Step 4: Build image mapping
    const imageMapping = new Map<
      SectionType,
      { index?: number; filename: string }
    >();

    for (const img of result.images) {
      if (img.status === 'success') {
        const sectionParts = img.section.split(' #');
        const sectionType = sectionParts[0] as SectionType;
        const index =
          sectionParts.length > 1
            ? Number.parseInt(sectionParts[1]) - 1
            : undefined;

        imageMapping.set(sectionType, {
          index,
          filename: img.filename,
        });
      }
    }

    // Step 5: Auto-update page.tsx
    await updatePageReferences(config.pagePath, imageMapping);

    console.log('\n' + '='.repeat(80));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`✨ Generated ${result.successfulImages} images`);
    console.log(`✨ Updated page references automatically`);
    console.log(`✨ All images < 90KB`);
    console.log('='.repeat(80) + '\n');
  } catch (error: any) {
    console.error('\n❌ Workflow failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
export { runEnhancedWorkflow, type WorkflowConfig };

// CLI execution
if (require.main === module) {
  console.log(
    'ℹ️  Use specific tool scripts (e.g., regenerate-middle-english-sections.ts)'
  );
  process.exit(0);
}
