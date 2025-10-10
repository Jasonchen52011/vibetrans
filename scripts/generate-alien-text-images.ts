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
    title: 'What is Alien Text Generator',
    prompt: `Geometric Flat Style cartoon illustration for "What is Alien Text Generator". Sky blue (#87CEEB) primary color with soft gradient background. Center shows a large computer screen (simplified rectangular frame in light gray) displaying colorful alien text characters - abstract geometric symbols, circles with dots, squiggly alien letters in neon green, electric purple, and cyan. Around the screen, floating geometric shapes represent different alien text styles: zalgo text (chaotic overlapping circles in dark purple), Unicode symbols (clean geometric shapes in mint green), futuristic characters (angular triangles in bright pink). A cartoon person (circular head, simple body) sits at a desk typing, with thought bubbles showing question marks transforming into alien symbols. Decorative elements: small stars, planet shapes, UFO silhouettes in corners. Color palette: sky blue dominant, with accent pops of neon green (#00FF7F), electric purple (#9D4EDD), cyan (#00CED1), soft yellow (#FFE66D). Clean lines, minimalist geometric forms, friendly and approachable composition. 4:3 aspect ratio, 800x600px.`,
    filename: 'what-is-alien-text-generator',
  },
  {
    section: 'Fun Fact 1',
    title: 'Zalgo Text Origin',
    prompt: `Geometric Flat Style cartoon illustration for "Zalgo Text Origin". Sky blue (#87CEEB) primary with soft gradient. Center shows a vintage computer monitor (rectangular geometric shape in beige) from 2004 displaying zalgo text - chaotic, glitchy characters with overlapping diacritics represented as geometric spiral patterns in dark purple and blood red. A cartoon horror story book sits beside the monitor with a spooky face on the cover (simple geometric circles and triangles). Surrounding elements include: meme characters (simple geometric figures with surprised expressions), internet forum icons (square speech bubbles), viral spread arrows (curved geometric paths in bright red). Floating text fragments show corrupted letters transforming into creepy zalgo style. Background has subtle horror elements: geometric bats, simplified spider webs in corners, floating eyeballs (circles with pupils). Color palette: sky blue base, with dark purple (#6A0572), blood red (#DC143C), neon green accents (#39FF14). Playful yet slightly eerie composition. 4:3 aspect ratio, 800x600px.`,
    filename: 'zalgo-text-origin',
  },
  {
    section: 'Fun Fact 2',
    title: 'Unicode Magic',
    prompt: `Geometric Flat Style cartoon illustration for "Unicode Magic". Sky blue (#87CEEB) primary with soft gradient. Center displays a magical glowing orb (perfect circle with radial gradient from white to cyan) containing various Unicode character types. Geometric representations of different scripts orbit around: Greek letters (phi, omega) as angular shapes in royal blue, Cyrillic characters (Д, Я) as bold geometric forms in red, mathematical symbols (∑, ∫, √) as precise angular shapes in purple. A cartoon wizard character (triangular hat, circular head, rectangular robe) waves a wand creating sparks that transform plain letters into alien text. Transformation sequence shows: regular "A" → Greek "Α" → alien symbol, depicted as geometric morphing animation. Decorative elements: sparkles (small stars in gold), magic circles (concentric geometric rings in cyan), floating parentheses and brackets. Rainbow spectrum flowing through Unicode transformations. Color palette: sky blue dominant, royal blue (#4169E1), crimson (#DC143C), deep purple (#8B00FF), gold accents (#FFD700). Vibrant, magical, and educational composition. 4:3 aspect ratio, 800x600px.`,
    filename: 'unicode-magic',
  },
  {
    section: 'User Interest 1',
    title: 'Alien Text for Social Media',
    prompt: `Geometric Flat Style cartoon illustration for "Alien Text for Social Media". Sky blue (#87CEEB) primary with soft gradient. Center shows a large smartphone (rounded rectangle in dark gray) displaying a social media feed with alien text posts. Each post contains unique alien characters: zalgo text (chaotic geometric patterns), circle text (letters in circular frames), futuristic symbols (angular geometric shapes). Cartoon user (circular head, simple body) holds the phone with excited expression (wide circular eyes, curved smile). Around the phone, floating social media icons: hearts, likes, comments, share arrows - all in bright geometric shapes. Notification bubbles show increasing engagement numbers. Speech bubbles contain alien text transforming into normal text, showing translation. Background includes: thumbs up symbols (geometric triangular hands), star ratings (perfect five-pointed stars in gold), trending arrows (upward geometric paths). Color palette: sky blue base, bright pink (#FF1493), neon cyan (#00FFFF), electric purple (#BF00FF), sunshine yellow (#FFFD00). Energetic, engaging, social media vibe. 4:3 aspect ratio, 800x600px.`,
    filename: 'alien-text-social-media',
  },
  {
    section: 'User Interest 2',
    title: 'Alien Text for Creative Projects',
    prompt: `Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects". Sky blue (#87CEEB) primary with soft gradient. Center features an artist's workspace with an open laptop (rectangular frame in silver) showing a sci-fi project with alien text overlays. A cartoon creator (circular head, rectangular body wearing creative beret) types enthusiastically. Around the workspace: storyboard panels with alien text labels, character design sketches with futuristic name tags, UI mockups with alien interface text. Floating creative tools: pencil (cylinder shape), paintbrush (geometric bristles), digital pen (sleek rectangle). Alien text examples float in bubbles: story titles in zalgo style, character names in circle text, UI elements in square text. Background shows: planet shapes representing different creative genres, constellation lines connecting ideas, geometric stars for inspiration. Color palette: sky blue dominant, deep purple (#6A0DAD), emerald green (#50C878), coral pink (#FF6B6B), lemon yellow (#FFF44F). Creative, inspiring, project-focused atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'alien-text-creative-projects',
  },
  {
    section: 'User Interest 3',
    title: 'Text Styles for Games',
    prompt: `Geometric Flat Style cartoon illustration for "Text Styles for Games". Sky blue (#87CEEB) primary with soft gradient. Center shows a gaming setup with a monitor (large rectangle in black) displaying a game interface filled with alien text: player username in futuristic style, chat messages in zalgo, achievement notifications in circle text, HUD elements with square text. Cartoon gamer (circular head with geometric headphones, rectangular body) sits in gaming chair with controller (simplified geometric buttons). Around the screen: floating game elements - health bars with alien numerals, inventory items labeled in alien text, level-up notifications, quest markers with otherworldly characters. Small geometric enemies and characters from the game peek from corners. Gaming peripherals: keyboard (grid of squares), mouse (sleek oval), RGB lighting effects (colorful geometric rays). Background has: controller buttons (circles and crosses), game tokens, achievement trophies in geometric shapes. Color palette: sky blue base, neon green (#0FFF50), hot pink (#FF69B4), cyber purple (#9D00FF), electric blue (#7DF9FF). High-energy gaming atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'text-styles-for-games',
  },
  {
    section: 'User Interest 4',
    title: 'Fun and Meme Creation',
    prompt: `Geometric Flat Style cartoon illustration for "Fun and Meme Creation". Sky blue (#87CEEB) primary with soft gradient. Center displays a meme creation workspace with a tablet (rounded rectangle) showing a meme template being edited with alien text overlays. Cartoon meme creator (circular head with excited expression, rectangular body) adds alien text captions. Around the workspace: classic meme templates transformed with alien text - surprised face with zalgo text, galaxy brain with futuristic alien font, expanding brain with progressively more alien text. Floating meme elements: impact font transforming into alien symbols, white caption boxes with green alien text, reaction emojis (geometric circular faces with various expressions). Social media share buttons glow brightly. Background includes: viral spread arrows (geometric curves), trending hashtags in alien characters, laughter symbols (geometric "LOL" in alien style), share counters increasing. Humorous alien creatures (simple geometric shapes with googly eyes) react to memes. Color palette: sky blue dominant, lime green (#32CD32), hot magenta (#FF00FF), sunshine yellow (#FFEB3B), bright orange (#FF6600). Playful, humorous, meme-culture atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'fun-and-meme-creation',
  },
];

async function generateAllImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Alien Text Generator Images');
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
