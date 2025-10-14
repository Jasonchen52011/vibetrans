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
    title: 'What is Baby Translator Pro',
    prompt: `Geometric Flat Style cartoon illustration for "What is Baby Translator Pro". Sky blue (#87CEEB) primary color with soft gradient background. Center shows a large smartphone (rounded rectangle in light gray) displaying a baby cry waveform (flowing geometric wave pattern in soft pink and purple). A cartoon baby (circular head with simple facial features, tiny body) is shown crying with geometric sound waves (curved lines in sky blue) emanating from its mouth. Next to the baby, a cartoon parent (circular head, rectangular body) looks at the phone with understanding expression (curved smile, sparkly eyes represented as small stars). AI analysis is represented by floating geometric icons: brain icon (pink rounded shape), sound frequency bars (vertical rectangles in different heights, cyan color), translation symbols (geometric speech bubbles transforming from question marks to hearts). Decorative elements include: musical notes (simple geometric shapes), baby bottle (cylinder shape in soft yellow), pacifier (circular with geometric handle in mint green). Color palette: sky blue dominant, soft pink (#FFB6C1), lavender (#E6E6FA), mint green (#98FF98), sunshine yellow (#FFFD54). Warm, nurturing, technology-meets-parenting atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'what-is-baby-translator',
  },
  {
    section: 'Fun Fact 1',
    title: 'The Simpsons Baby Translator',
    prompt: `Geometric Flat Style cartoon illustration for "The Simpsons Baby Translator 1992". Sky blue (#87CEEB) primary with soft gradient. Center displays a vintage 1990s TV set (rounded rectangle with antenna in beige) showing a simplified Simpsons-style baby with a geometric translation device. The device is depicted as a retro-futuristic gadget (rectangular box with circular buttons and a small screen showing simple baby face icons). Around the TV, floating 1990s elements: VHS tape (rectangular shape with two circular reels in black), remote control (slim rectangle with geometric buttons), retro TV guide magazine (rectangular stack in yellow). Timeline arrow shows progression from 1992 to 2025, with baby translator evolving from mechanical device to smartphone app (represented as transformation sequence with geometric shapes). Nostalgic elements: cassette tape shapes, geometric star bursts in corners, retro color blocks. Background has subtle pop culture references: simplified cartoon family silhouettes, geometric couch shape, old-school antenna waves. Color palette: sky blue base, retro yellow (#FFD700), orange (#FF8C00), forest green (#228B22), hot pink (#FF69B4). Playful, nostalgic, pop-culture atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-fact-1',
  },
  {
    section: 'Fun Fact 2',
    title: 'Baby Cry Language Differences',
    prompt: `Geometric Flat Style cartoon illustration for "Baby Cry Language Differences". Sky blue (#87CEEB) primary with soft gradient. Center features a world map (simplified geometric continents in soft colors) with three cartoon babies positioned on different regions: German baby (circular head with simple features) in Europe, French baby in France, American baby in North America. Each baby has unique sound wave patterns floating above them showing their native language intonation: German baby has angular geometric waves (sharp peaks in red), French baby has flowing curved waves (smooth arcs in blue), American baby has mixed wave patterns (combination of shapes in purple). Around each baby, musical notation symbols in geometric form: treble clefs, notes, frequency bars. A grandmother figure (circular head with geometric glasses, bun hairstyle) listens with interest, holding a notepad showing comparison charts (simple bar graphs in geometric shapes). Decorative elements: language flags as simplified geometric banners, baby rattles (circular with handle in various colors), cultural symbols (Eiffel Tower, Statue of Liberty as minimalist geometric shapes). Color palette: sky blue dominant, German red (#DD0000), French blue (#0055A4), American navy (#002868), warm beige (#F5DEB3). Educational, multicultural, linguistic atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-fact-2',
  },
  {
    section: 'User Interest 1',
    title: 'Scientific Principles of Baby Cry Analysis',
    prompt: `Geometric Flat Style cartoon illustration for "Scientific Principles of Baby Cry Analysis". Sky blue (#87CEEB) primary with soft gradient. Center shows a large digital dashboard (rectangular frame in dark gray) displaying scientific data visualization: sound frequency spectrum (geometric bars in rainbow gradient), AI neural network (interconnected circles and lines forming brain pattern in cyan), waveform analysis (flowing curves with geometric nodes in purple). A cartoon scientist (circular head with geometric goggles, white lab coat as rectangular shape) points at the data with excitement. Floating scientific elements: microscope icon (simplified geometric shape in silver), DNA helix (two intertwined spiral geometric paths in green and blue), mathematical formulas (geometric pi, sigma symbols floating in gold), molecular structures (circular atoms connected by lines). Baby cry is represented as colorful sound wave entering analysis chamber (transparent geometric prism). Accuracy meter shows high percentage (geometric progress circle 90% filled in bright green). Research paper icons (rectangular documents with corner fold) float in background. Color palette: sky blue base, scientific cyan (#00CED1), lab coat white (#F8F8FF), neural purple (#9370DB), accuracy green (#00FF00), formula gold (#FFD700). Technical, educational, trustworthy atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-interest-1',
  },
  {
    section: 'User Interest 2',
    title: 'Privacy and Data Security',
    prompt: `Geometric Flat Style cartoon illustration for "Privacy and Data Security". Sky blue (#87CEEB) primary with soft gradient. Center features a large digital shield (geometric pentagon shape) glowing with protective aura (concentric geometric circles in cyan and white). Inside the shield, a baby's sound wave (flowing geometric pattern in soft pink) is shown encrypted as locked geometric symbols (padlock shapes, key icons in gold). Around the shield, security badges float: GDPR compliance badge (geometric circle with check mark in green), COPPA certification (rectangular seal in blue), SSL encryption icon (geometric lock with radiating lines in gold). A cartoon parent (circular head, rectangular body) holds smartphone confidently, with privacy indicators showing: end-to-end encryption (geometric arrows with locks in purple), local processing (geometric chip icon in silver), no cloud upload (cloud with X mark in red crossed out). Firewall is represented as geometric brick pattern (interlocking rectangles in gray) protecting data. Background shows: secure connection paths (geometric lines with locks), privacy policy document (rectangular paper with seal), trust badges (circular medals with stars). Color palette: sky blue dominant, security green (#00A86B), trust blue (#003366), encryption gold (#FFD700), alert red (#FF0000) for "what NOT to do". Safe, secure, privacy-first atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-interest-2',
  },
  {
    section: 'User Interest 3',
    title: 'Smart Home Integration',
    prompt: `Geometric Flat Style cartoon illustration for "Smart Home Integration". Sky blue (#87CEEB) primary with soft gradient. Center shows a modern smart home setup: Alexa device (cylindrical shape with glowing ring in cyan), Google Home (geometric nest-like shape in white and coral), baby monitor camera (circular lens with stand in silver). All devices are connected by flowing geometric lines (smooth curves with data nodes in purple) forming a network. A cartoon baby cries in a crib (simplified rectangular frame with bars), and the cry is instantly detected and analyzed, sending alerts to all devices. Parent receives notification on smartwatch (rounded rectangle on geometric wrist in pink) and smartphone (rectangular device showing baby translator app interface). Smart home responds: gentle nightlight turns on (geometric lamp with soft glow in yellow), white noise machine activates (circular speaker with sound waves in mint green), temperature adjusts automatically (geometric thermostat showing comfort zone in green). Integration icons float around: WiFi symbol (geometric radiating circles), cloud sync (geometric cloud with arrows), IoT hub (interconnected device nodes). Color palette: sky blue base, smart cyan (#00FFFF), device white (#FFFFFF), notification pink (#FF1493), comfort green (#90EE90), connection purple (#8A2BE2). Modern, connected, automated smart-home atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-interest-3',
  },
  {
    section: 'User Interest 4',
    title: 'Cultural and Linguistic Insights',
    prompt: `Geometric Flat Style cartoon illustration for "Cultural and Linguistic Insights". Sky blue (#87CEEB) primary with soft gradient. Center features a diverse array of babies from different cultural backgrounds arranged in a circle: Asian baby (circular head with simple almond-shaped eyes), African baby (circular head with geometric hair texture), Hispanic baby (circular head with warm skin tone), Middle Eastern baby (circular head with geometric features). Each baby has unique cultural elements: geometric patterns representing traditional textiles, simplified cultural symbols (pagoda, pyramid, sun shapes). Sound waves from each baby show subtle differences in geometric patterns (angular vs curved, high frequency vs low frequency). A multilingual parent figure (circular head with geometric globe icon above) uses translation device that displays multiple languages simultaneously (geometric text bubbles in different scripts: Chinese characters, Arabic script, Spanish accents - all simplified geometric representations). Cultural diversity is celebrated with: international flags as geometric banners, world map with geometric continents, cultural food icons (geometric shapes representing different cuisines). Background includes: translation symbol (geometric bidirectional arrows), unity circle (babies holding hands as connected geometric figures), diversity rainbow gradient. Color palette: sky blue dominant, multicultural rainbow spectrum, warm earth tones (#D2691E, #8B4513), cultural gold (#DAA520), unity purple (#9966CC). Inclusive, global, culturally-aware atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'baby-translator-interest-4',
  },
];

async function generateAllImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Baby Translator Images');
  console.log('='.repeat(70));
  console.log(`\n📝 Total images to generate: ${imageTasks.length}`);
  console.log(
    '⚠️  Estimated time: 2-3 minutes per image, ~14-21 minutes total\n'
  );

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
    console.log(`📝 Prompt: ${task.prompt.substring(0, 100)}...`);

    try {
      // Step 1: Generate with KIE API (Volcano Engine)
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

    // Small delay between requests to avoid rate limiting
    if (i < imageTasks.length - 1) {
      console.log('⏳ Waiting 2 seconds before next request...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${results.success}/${imageTasks.length}`);
  console.log(`❌ Failed: ${results.failed}/${imageTasks.length}\n`);

  if (results.success > 0) {
    console.log('📁 Generated files in public/images/docs/:');
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
