import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithSeedream } from '../src/lib/kie-text-to-image';

interface ImageTask {
  section: string;
  title: string;
  prompt: string;
  filename: string;
}

const imageTasks: ImageTask[] = [
  {
    section: 'User Interest 1',
    title: 'How Accurate is Bad Translator?',
    prompt: `Geometric Flat Style cartoon illustration for "How Accurate is Bad Translator?". Sky blue (#87CEEB) primary color with soft gradient background. Center shows a large translator interface (rectangular frame in light gray) displaying funny mistranslations. Input: "Hello World" → Output: "Greetings from Planet Earth" in a speech bubble. A cartoon accuracy meter (circular gauge with pointer) points to "Accidentally Hilarious" instead of "Accurate". The meter has colored sections: red (Terrible), yellow (Funny), green (Accidentally Hilarious). Around the interface, floating examples of bad translations in speech bubbles: "Thank you" → "Gratitude received", "Good morning" → "Pleasant dawn period". A cartoon robot character (circular head, rectangular body) holds a magnifying glass over the translations with a confused expression (raised eyebrows, tilted head). Small question marks float around representing the "accuracy paradox". Decorative elements: laughing emojis (geometric circular faces with smiles), stars for "fun mistakes", and small arrows showing the translation process. Color palette: sky blue dominant, with bright orange (#FFA500) for humor, sunshine yellow (#FFD700) for mistakes, and soft green (#90EE90) for the "hilarious" zone. Playful, educational composition showing that inaccuracy equals entertainment. 4:3 aspect ratio, 800x600px.`,
    filename: 'bad-translator-accuracy-concept',
  },
  {
    section: 'User Interest 2',
    title: 'Perfect for Social Media Content',
    prompt: `Geometric Flat Style cartoon illustration for "Perfect for Social Media Content". Sky blue (#87CEEB) primary with soft gradient background. Center features a large smartphone (rounded rectangle in dark gray) displaying a social media feed with viral bad translation posts. Each post shows likes, shares, and comments skyrocketing. Post examples: "Original: I love cats → Bad Translation: Feline affection received" with 10K likes, "Original: Coffee time → Bad Translation: Bean juice hour" going viral. Cartoon social media users (circular heads with various expressions) react with laughing emojis and share buttons. Around the phone, floating engagement metrics: heart icons multiplying, share arrows expanding, comment bubbles flooding. A trending badge appears with "Viral Translation" in bright letters. Social media platform icons glow: Twitter bird, Facebook F, Instagram camera, TikTok musical notes - all showing high engagement numbers. Background includes: notification badges with high counts, trending hashtags like #BadTranslator, and viral spread arrows (geometric curves showing rapid expansion). Color palette: sky blue base, vibrant pink (#FF1493) for engagement, electric blue (#00BFFF) for virality, sunshine yellow (#FFD700) for trending content, and bright green (#32CD32) for success. High-energy, social media focused atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'bad-translator-social-media',
  },
  {
    section: 'User Interest 3',
    title: 'Great for Advertisers',
    prompt: `Geometric Flat Style cartoon illustration for "Great for Advertisers". Sky blue (#87CEEB) primary with soft gradient background. Center shows an advertising agency workspace with a creative team (cartoon characters with circular heads) brainstorming around a large presentation screen. The screen displays ad slogans transformed by Bad Translator: "Just Do It" → "Simply Perform Action", "Think Different" → "Cognitive Uniqueness Process", "I'm Lovin' It" → "Affection Reception Active". The team shows excitement (raised arms, smiling faces) at the quirky results. Around the workspace: advertising materials being transformed - billboards with bad translations, social media ad campaigns with humorous copy, product descriptions with playful mistranslations. Floating creative elements: lightbulb icons (geometric circles with rays) representing ideas, megaphones (cone shapes) for campaigns, and target symbols (concentric circles) for audience reach. A cartoon director character holds a clapperboard showing "Bad Translation Ad - Take 1". Background includes: brand logo examples with funny translations, engagement charts showing positive reactions, and focus group characters laughing at the ads. Color palette: sky blue dominant, corporate blue (#0047AB) for professionalism, creative orange (#FF6B35) for innovation, success green (#228B22) for results, and attention-grabbing red (#DC143C) for impact. Professional yet playful advertising atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'bad-translator-advertising',
  },
];

async function generateAllImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Bad Translator Images (Volcano 4.0)');
  console.log('='.repeat(70));
  console.log(`\n📝 Total images to generate: ${imageTasks.length}`);
  console.log('⚠️  Using Seedream 4.0 (Volcano 4.0) for higher quality');
  console.log('⚠️  Estimated time: 3-5 minutes (higher quality takes longer)\n');

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
      // Step 1: Generate with Seedream 4.0 (Volcano 4.0)
      console.log(`🎨 Generating with Seedream 4.0 (Volcano 4.0)...`);
      const imageResult = await generateImageWithSeedream(task.prompt, {
        imageSize: 'landscape_4_3',
        imageResolution: '2K',
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
