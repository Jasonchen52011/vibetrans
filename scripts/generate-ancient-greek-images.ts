/**
 * Generate Ancient Greek Translator Page Images with KIE API
 * Using custom geometric flat style prompts
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

interface ImageTask {
  section: string;
  title: string;
  prompt: string;
  filename: string;
}

const imageTasks: ImageTask[] = [
  {
    section: 'What Is',
    title: 'What is Ancient Greek Translator',
    prompt: `Geometric Flat Style cartoon illustration for "What is Ancient Greek Translator". Sky blue (#87CEEB) primary color with soft gradient. Center shows ancient Greek temple columns (simplified geometric rectangles) with floating Greek letters (alpha, beta, omega) as abstract circular and angular shapes transforming into modern Latin letters. Ancient scroll represented by simple curved rectangles. Translation concept shown through bidirectional arrows between Greek and English symbols. Pastel accents (yellow, pink, mint green). 4:3 aspect ratio, horizontal layout, academic yet friendly atmosphere, clean minimalist design, modern flat cartoon style, no actual text or logos visible.`,
    filename: 'what-is-ancient-greek-translator',
  },
  {
    section: 'Fun Fact #1',
    title: 'Ancient Greek Influenced Modern Languages',
    prompt: `Geometric Flat Style cartoon illustration depicting "Ancient Greek Influenced Modern Languages". Sky blue (#87CEEB) background with soft gradient. Shows ancient Greek column or pillar (geometric rectangles) on left side with stylized Greek letters as circular and triangular shapes flowing outward like branches to multiple modern language symbols (flags as simple geometric shapes, books as rectangles). Word roots concept represented by tree-like geometric structure spreading from Greek origin. Educational and inspiring atmosphere. Pastel yellow, pink, mint green accents. 4:3 aspect ratio, horizontal layout, enlightening mood, clean minimalist design, modern flat cartoon style, no text or logos.`,
    filename: 'ancient-greek-language-influence',
  },
  {
    section: 'Fun Fact #2',
    title: 'Ancient Greek Dialects',
    prompt: `Geometric Flat Style cartoon illustration for "Ancient Greek Dialects". Sky blue (#87CEEB) primary with pastel gradient. Features map of ancient Greece as simplified geometric landmass with different colored regions (soft pink, yellow, mint green, lavender) representing different dialects. Abstract scroll symbols and dialect markers as geometric circles and triangles placed in different areas. Ancient pottery or vase as simple curved geometric shape. Diversity and linguistic richness represented through colorful regional divisions. 4:3 aspect ratio, horizontal layout, educational and diverse atmosphere, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'ancient-greek-dialects',
  },
  {
    section: 'User Interest #1',
    title: 'Accurate Translations of Ancient Greek Texts',
    prompt: `Geometric Flat Style cartoon illustration for "Accurate Translations of Ancient Greek Texts". Sky blue (#87CEEB) background with soft gradient. Center shows ancient scroll (curved rectangles) with abstract Greek symbols (geometric shapes) on one side and modern translation symbols on the other. Magnifying glass (circle with handle) emphasizing accuracy. Checkmark or validation symbol as geometric shapes. Ancient manuscript aesthetic with modern AI precision. Pastel accents (yellow, pink, mint green). 4:3 aspect ratio, horizontal layout, precise and trustworthy atmosphere, clean minimalist design, modern flat cartoon style, no text or logos visible.`,
    filename: 'accurate-greek-translations',
  },
  {
    section: 'User Interest #2',
    title: 'AI-Powered Ancient Greek Translations',
    prompt: `Geometric Flat Style cartoon illustration for "AI-Powered Ancient Greek Translations". Sky blue (#87CEEB) primary with soft gradient. Features ancient Greek column (rectangular geometric shapes) merging with modern circuit board or AI brain (circles and connecting lines as geometric pattern). Neural network nodes as small circles connected by lines. Ancient meets modern technology concept. Scrolls and digital screens as simple geometric rectangles. Innovation and tradition blend. Soft pink, yellow, mint green accents. 4:3 aspect ratio, horizontal layout, futuristic yet classical atmosphere, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'ai-powered-greek-translation',
  },
  {
    section: 'User Interest #3',
    title: 'Cultural Insights in Ancient Greek Translations',
    prompt: `Geometric Flat Style cartoon illustration for "Cultural Insights in Ancient Greek Translations". Sky blue (#87CEEB) background with soft clouds. Shows ancient Greek temple or amphitheater (simplified geometric columns and arches) with cultural symbols floating around - laurel wreath (circular geometric pattern), lyre (curved geometric shape), pottery (vase as simple curves). Open book or scroll with abstract cultural annotations. Window into ancient culture concept. Pastel yellow, pink, mint green accents. 4:3 aspect ratio, horizontal layout, enriching cultural atmosphere, clean minimalist design, modern flat cartoon style, no text or logos.`,
    filename: 'greek-cultural-insights',
  },
  {
    section: 'User Interest #4',
    title: 'Learn Ancient Greek with VibeTrans',
    prompt: `Geometric Flat Style cartoon illustration for "Learn Ancient Greek". Sky blue (#87CEEB) primary with soft gradient. Features geometric student character (circular head, rectangular body) sitting with open book (rectangles) showing Greek letters as abstract shapes. Lightbulb above head (circle with rays) representing learning. Ancient Greek alphabet symbols (alpha, beta, omega) as colorful geometric shapes floating around. Teacher or mentor figure as simple geometric character. Educational tools like tablet, scrolls as rectangles. Encouraging learning atmosphere. Pastel accents (pink, yellow, mint green). 4:3 aspect ratio, horizontal layout, inspiring educational mood, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'learn-ancient-greek',
  },
];

async function generateAllImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Ancient Greek Translator Images');
  console.log('='.repeat(70));
  console.log(`\n📝 Total images to generate: ${imageTasks.length}`);
  console.log('⚠️  Estimated time: 2-3 minutes\n');

  const results = {
    success: 0,
    failed: 0,
    images: [] as Array<{ filename: string; size: number; status: string }>,
  };

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    console.log(
      `\n[${i + 1}/${imageTasks.length}] ${task.section}: ${task.title}`
    );
    console.log(`📝 Prompt: ${task.prompt.substring(0, 80)}...`);

    try {
      // Step 1: Generate with KIE API
      console.log(`🎨 Generating with KIE API...`);
      const imageResult = await generateImageWithKie(task.prompt, {
        imageSize: '4:3',
        outputFormat: 'png',
      });

      console.log(`✅ Image generated: ${imageResult.url}`);

      // Step 2: Convert to WebP
      console.log(`📦 Converting to WebP...`);
      const webpResult = await convertURLToWebP(imageResult.url, {
        filename: task.filename,
        targetSize: 90, // 90KB target
      });

      if (webpResult.success) {
        results.success++;
        results.images.push({
          filename: webpResult.filename,
          size: webpResult.size,
          status: 'success',
        });
        console.log(
          `✅ [${i + 1}/${imageTasks.length}] Success: ${webpResult.filename} (${webpResult.size}KB)`
        );
      } else {
        throw new Error(webpResult.error || 'WebP conversion failed');
      }
    } catch (error: any) {
      results.failed++;
      results.images.push({
        filename: `${task.filename}.webp`,
        size: 0,
        status: `failed: ${error.message}`,
      });
      console.error(
        `❌ [${i + 1}/${imageTasks.length}] Failed: ${error.message}`
      );
    }

    // Small delay between requests
    if (i < imageTasks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${results.success}/${imageTasks.length}`);
  console.log(`❌ Failed: ${results.failed}/${imageTasks.length}\n`);

  if (results.success > 0) {
    console.log('📁 Generated files:');
    results.images
      .filter((img) => img.status === 'success')
      .forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.filename} (${img.size}KB)`);
      });
  }

  if (results.failed > 0) {
    console.log('\n⚠️  Failed images:');
    results.images
      .filter((img) => img.status !== 'success')
      .forEach((img) => {
        console.log(`   ❌ ${img.filename}: ${img.status}`);
      });
  }

  console.log('\n' + '='.repeat(70) + '\n');

  return results.success === imageTasks.length ? 0 : 1;
}

// Execute
generateAllImages()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
