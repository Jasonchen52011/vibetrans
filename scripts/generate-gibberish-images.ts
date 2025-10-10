/**
 * Generate Gibberish Translator Page Images with KIE API
 * Using custom geometric flat style prompts
 */

import { generateImageWithKie } from '../src/lib/kie-text-to-image';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

interface ImageTask {
  section: string;
  title: string;
  prompt: string;
  filename: string;
}

const imageTasks: ImageTask[] = [
  {
    section: 'What Is',
    title: 'What is Gibberish Translator',
    prompt: `Geometric Flat Style cartoon illustration for "What is Gibberish Translator". Sky blue (#87CEEB) primary color with soft gradient. Center shows abstract playful text transformation concept - normal letters morphing into silly gibberish symbols using geometric shapes (circles, triangles, rectangles). Speech bubbles with squiggly patterns represent nonsensical language. Clean minimalist design, 4:3 aspect ratio, horizontal layout, cheerful and playful atmosphere, pastel yellow, pink, and mint green accents, modern flat cartoon style, no actual text or logos visible.`,
    filename: 'what-is-gibberish-translator',
  },
  {
    section: 'Fun Fact #1',
    title: 'The Origin of the Word',
    prompt: `Geometric Flat Style cartoon illustration depicting "The Origin of the Word Gibberish". Sky blue (#87CEEB) background with soft clouds. Features ancient alchemist theme - simplified geometric character with triangular hat and circular flask, surrounded by floating mystical symbols and scrolls (all geometric shapes). Abstract cryptic writings represented by wavy lines and patterns. Pastel yellow, pink, mint green accents. 4:3 aspect ratio, horizontal layout, mysterious yet cheerful atmosphere, clean minimalist design, modern flat cartoon style, no text or logos.`,
    filename: 'gibberish-origin-word',
  },
  {
    section: 'Fun Fact #2',
    title: 'Gibberish Can Be Educational',
    prompt: `Geometric Flat Style cartoon illustration representing "Gibberish Can Be Educational". Sky blue (#87CEEB) primary with soft gradient. Shows classroom learning scene - simple geometric teacher character with chalkboard featuring abstract phonetic patterns (circles, waves, triangles). Geometric student characters appear engaged and creative. Floating lightbulbs and sparkles symbolize learning. Pastel accents (yellow, pink, mint green). 4:3 aspect ratio, horizontal layout, inspiring educational atmosphere, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'gibberish-educational',
  },
  {
    section: 'User Interest #1',
    title: 'Language Games and Secret Codes',
    prompt: `Geometric Flat Style cartoon illustration for "Language Games and Secret Codes". Sky blue (#87CEEB) with pastel gradient. Features playful scene with geometric child characters sharing secret messages - speech bubbles with abstract cipher symbols and playful patterns. Lock and key geometric shapes represent codes. Happy and mysterious atmosphere. Soft pink, yellow, mint green accents. 4:3 aspect ratio, horizontal layout, fun and engaging mood, clean minimalist design, modern flat cartoon style, no text or logos visible.`,
    filename: 'gibberish-secret-codes',
  },
  {
    section: 'User Interest #2',
    title: 'Educational Purposes',
    prompt: `Geometric Flat Style cartoon illustration for "Educational Purposes". Sky blue (#87CEEB) background with soft clouds. Interactive classroom scene with geometric teacher and student characters. Abstract phonetics symbols (circles, wavy lines, triangular sound waves) floating around. Books and educational tools as simple geometric shapes. Pastel yellow, pink, mint green accents. 4:3 aspect ratio, horizontal layout, engaging learning atmosphere, cheerful and inspiring, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'gibberish-education-purpose',
  },
  {
    section: 'User Interest #3',
    title: 'Content Creators and Entertainers',
    prompt: `Geometric Flat Style cartoon illustration for "Content Creators and Entertainers". Sky blue (#87CEEB) with soft gradient. Shows content creation scene - geometric character with camera, microphone, and smartphone (all simple geometric shapes). Social media icons (hearts, stars, play buttons) as abstract geometric elements. Comedy masks and quirky symbols represent entertainment. Pastel accents (pink, yellow, mint green). 4:3 aspect ratio, horizontal layout, creative and energetic atmosphere, clean minimalist design, modern flat cartoon style, no text or logos visible.`,
    filename: 'gibberish-content-creators',
  },
  {
    section: 'User Interest #4',
    title: 'Privacy and Fun Communication',
    prompt: `Geometric Flat Style cartoon illustration for "Privacy and Fun Communication". Sky blue (#87CEEB) primary with pastel gradient. Features geometric characters exchanging encrypted messages - abstract lock and shield shapes, playful coded speech bubbles with patterns. Secret handshake concept using simple geometric hands. Sparkles and mysterious atmosphere. Soft pink, yellow, mint green accents. 4:3 aspect ratio, horizontal layout, secure yet fun mood, cheerful and engaging, clean minimalist style, modern flat cartoon design, no actual text or logos.`,
    filename: 'gibberish-privacy-fun',
  },
];

async function generateAllImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Gibberish Translator Images');
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
