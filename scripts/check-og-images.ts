/**
 * Check OG Images for All Tool Pages
 * Finds pages missing og:image and suggests What Is section images
 */

import fs from 'fs';
import path from 'path';

interface PageCheck {
  page: string;
  hasImage: boolean;
  currentImage?: string;
  whatIsImage?: string;
  needsFix: boolean;
}

const toolPages = [
  'dog-translator',
  'gen-z-translator',
  'gen-alpha-translator',
  'dumb-it-down-ai',
  'bad-translator',
  'ancient-greek-translator',
  'al-bhed-translator',
  'alien-text-generator',
  'esperanto-translator',
  'gibberish-translator',
  'cuneiform-translator',
];

function checkPage(pageName: string): PageCheck {
  const pagePath = path.join(
    process.cwd(),
    `src/app/[locale]/(marketing)/(pages)/${pageName}/page.tsx`
  );

  const result: PageCheck = {
    page: pageName,
    hasImage: false,
    needsFix: false,
  };

  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Page not found: ${pageName}`);
    return result;
  }

  const content = fs.readFileSync(pagePath, 'utf-8');

  // Check for image in constructMetadata
  const imageMatch = content.match(/image:\s*['"]([^'"]+)['"]/);
  if (imageMatch) {
    result.hasImage = true;
    result.currentImage = imageMatch[1];
  }

  // Check for What Is section image
  const whatIsMatch = content.match(
    /whatIsSection[\s\S]*?image:\s*\{\s*src:\s*['"]([^'"]+)['"]/
  );
  if (whatIsMatch) {
    result.whatIsImage = whatIsMatch[1];
  }

  // Determine if needs fix
  if (!result.hasImage && result.whatIsImage) {
    result.needsFix = true;
  }

  return result;
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 OG Image Configuration Check for All Tool Pages');
  console.log('='.repeat(70) + '\n');

  const results: PageCheck[] = [];
  let totalPages = 0;
  let pagesWithImage = 0;
  let pagesNeedingFix = 0;

  for (const pageName of toolPages) {
    const result = checkPage(pageName);
    results.push(result);
    totalPages++;

    if (result.hasImage) {
      pagesWithImage++;
      console.log(`✅ ${pageName}`);
      console.log(`   Image: ${result.currentImage}`);
    } else {
      console.log(`❌ ${pageName}`);
      console.log(`   Missing og:image in metadata`);
      if (result.whatIsImage) {
        pagesNeedingFix++;
        console.log(
          `   Suggested: ${result.whatIsImage} (from What Is section)`
        );
      } else {
        console.log(`   ⚠️  No What Is image found either`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(70));
  console.log('📈 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Pages: ${totalPages}`);
  console.log(`✅ Pages with og:image: ${pagesWithImage}`);
  console.log(`❌ Pages missing og:image: ${totalPages - pagesWithImage}`);
  console.log(`🔧 Pages that can be auto-fixed: ${pagesNeedingFix}`);
  console.log('='.repeat(70) + '\n');

  // List pages needing fixes
  if (pagesNeedingFix > 0) {
    console.log('🔧 PAGES NEEDING FIXES:\n');
    results
      .filter((r) => r.needsFix)
      .forEach((r) => {
        console.log(`  ${r.page}:`);
        console.log(`    Add: image: '${r.whatIsImage}',`);
        console.log('');
      });
  }

  return pagesNeedingFix > 0 ? 1 : 0;
}

main();
