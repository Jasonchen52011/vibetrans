import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

interface ImageTask {
  section: string;
  title: string;
  prompt: string;
  filename: string;
}

const imageTasks: ImageTask[] = [
  {
    section: 'What Is',
    title: 'What is IVR Translator',
    prompt: `Geometric Flat Style cartoon illustration for "What is IVR Translator - Multi-Language Voice-to-Text Tool". Sky blue (#87CEEB) primary color with soft gradient background. Center shows a large IVR system interface (geometric rounded rectangle in light gray) displaying real-time voice-to-text conversion. A business professional (circular head with simple features, rectangular body in business attire) wearing a headset speaks into microphone. Voice waves (flowing geometric curves in cyan) transform into text bubbles showing multiple languages (English, Spanish, French, Chinese text in colorful speech bubbles - blue, orange, green, purple). Around them float IVR elements: telephone handset icon (simplified geometric shape in navy blue), voice waveform patterns (geometric sine waves in bright colors), language flags (geometric flag icons representing global reach), text conversion arrows (geometric directional arrows showing voice→text transformation in green). Background includes customer service elements: satisfied customer faces (simple circular heads with smiling expressions), 5-star rating symbols (geometric stars in gold), global communication icons (geometric globe with connection lines). Visual representation of real-time conversion: voice input on left (geometric microphone with sound waves) → processing center (geometric AI brain symbol) → text output on right (geometric document with multiple language scripts). Color palette: sky blue dominant, voice cyan (#00FFFF), translation orange (#FF8C00), multi-language green (#32CD32), professional navy (#000080), success gold (#FFD700). Professional, multilingual, accessible, real-time atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'what-is-ivr-translator',
  },
  {
    section: 'How To',
    title: 'How to use IVR Translator',
    prompt: `Geometric Flat Style cartoon illustration for "How to Use IVR Translator - 4-Step Workflow". Sky blue (#87CEEB) primary with soft gradient. Visual workflow showing 4 sequential steps in geometric panels: STEP 1 (top left): Upload Audio icon - Audio file (geometric waveform document) being uploaded to cloud (rectangular sound wave with upward arrow into geometric cloud in green). Supported formats shown (geometric file type badges: MP3, WAV, etc.). STEP 2 (top right): Language selection - Globe with multiple language flags as geometric banners (Spanish, French, Chinese, English flags in simplified forms) around a central language selector dial (geometric circular selector). STEP 3 (bottom left): Start Conversion - Play button (large geometric triangle in green) with processing animation (geometric loading circle with voice-to-text transformation arrows in cyan). AI processor visualization (geometric brain with translation circuits). STEP 4 (bottom right): Download Results - Document with multiple language text (geometric paper with text lines in different scripts) being downloaded (geometric download arrow in blue). Integration icons showing IVR system connection (geometric system diagram). Central connecting element: Circular workflow arrows (geometric curved arrows in purple) linking all steps. Each panel has number badge (geometric circle with bold number 1-4 in white text on blue background). Background elements: audio upload cloud shapes, language diversity symbols (geometric translation icons), conversion progress indicators (geometric progress bars), download/integration symbols (geometric API connection lines). Color palette: sky blue base, upload green (#00CC66), language diversity rainbow (multiple flag colors), conversion cyan (#00CED1), download success blue (#0066FF). Clear, instructional, user-friendly, step-by-step workflow atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-how-to',
  },
  {
    section: 'Fun Fact 1',
    title: 'IVR Evolution',
    prompt: `Geometric Flat Style cartoon illustration for "IVR Evolution - From Touch-Tone to Voice AI". Sky blue (#87CEEB) primary with soft gradient. Left side shows "PAST" - Old-style telephone (geometric vintage rotary phone in retro beige) with touch-tone keypad (geometric grid of number buttons 0-9 in gray). Person pressing buttons (geometric finger touching number 5 button). Simple DTMF tones visualization (geometric square wave patterns in muted colors). Center shows "EVOLUTION ARROW" - Large forward-pointing arrow (geometric bold arrow in gradient from gray to bright blue) with timeline markers showing decades of progress. Right side shows "PRESENT" - Modern IVR system (geometric sleek interface in vibrant colors) with VibeTrans logo integration. Voice input visualization (geometric microphone with flowing sound waves in cyan transforming into text in real-time). Multi-language support shown as rainbow-colored text bubbles (English, Spanish, French, Chinese in geometric speech bubbles floating around modern interface). AI-powered features: voice recognition icon (geometric brain with audio circuits in purple), real-time translation (geometric transformation arrows in green), instant text conversion (geometric voice→text pipeline in orange). Background elements: retro tech nostalgia (geometric cassette tape, floppy disk in faded colors on left), modern tech advancement (geometric cloud computing, AI symbols in bright colors on right). Comparison labels: "Touch-Tone Only" vs "Multi-Language Voice AI" in geometric text badges. Color palette: retro beige/gray for past, vibrant sky blue/cyan/rainbow for present, evolution gradient blue (#87CEEB → #00FFFF), technology purple (#9370DB), innovation green (#00FF00), progress orange (#FF8C00). Educational, progressive, technology-evolution, nostalgic-to-futuristic atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-fact-1',
  },
  {
    section: 'Fun Fact 2',
    title: 'Voice Technology Heritage',
    prompt: `Geometric Flat Style cartoon illustration for "Voice Technology Heritage - Siri & IVR Advancement". Sky blue (#87CEEB) primary with soft gradient. Center features iconic Siri voice wave visualization (geometric flowing sine wave pattern in signature purple/blue gradient, iconic circular wave form). Above shows "GM Voices" label (geometric badge with vintage microphone icon in professional navy). Connection arrows (geometric curved lines in bright cyan) linking GM Voices → IVR Technology → VibeTrans advancement. Left side: Voice recording studio (geometric sound booth with microphone in silver, sound proofing panels in gray, recording equipment in professional black). Professional voice actor (circular head with geometric features, rectangular body) speaking into microphone. Sound waves emanating (geometric smooth curves in warm orange). Right side: VibeTrans enhancement visualization - Same voice technology PLUS multi-language support. Global communication shown as: central voice wave splitting into 6 language branches (geometric tree/hub structure) each labeled with different language (English, Spanish, French, German, Chinese, Japanese in geometric flag-colored badges). Each branch shows translated text output (geometric document icons with language scripts). "Taking it Further" banner (geometric ribbon in bright green) highlighting VibeTrans's advancement. Background elements: technology timeline (geometric progress bar showing evolution from single-voice to multi-language), global reach visualization (geometric world map with connection points in cyan), communication excellence symbols (geometric quality badges, certification seals in gold). Heritage respect: vintage GM Voices tribute (geometric honor badge in classic gold), innovation showcase: VibeTrans multi-language power (geometric innovation star in bright blue). Color palette: sky blue base, Siri purple/blue gradient (#9370DB → #00BFFF), heritage gold (#FFD700), innovation cyan (#00FFFF), multi-language rainbow (flag colors), advancement green (#00FF00), professional navy (#000080). Respectful, innovative, technological-advancement, global-communication atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-fact-2',
  },
  {
    section: 'User Interest 1',
    title: 'Global Communication',
    prompt: `Geometric Flat Style cartoon illustration for "Global Communication - Expanding Business Reach". Sky blue (#87CEEB) primary with soft gradient. Center features large 3D geometric globe (sphere with geometric grid lines in navy blue) with glowing connection points. Multiple regional markers on globe (geometric location pins in bright colors: Americas in red, Europe in blue, Asia in yellow, Africa in green, Oceania in purple). From each regional marker, animated communication lines radiate outward (geometric curved connection lines in bright cyan). Business expansion visualization: Central company HQ (geometric building in professional gray) at globe's center sending signals to all regions. Regional customer avatars (circular heads with diverse features representing different ethnicities) connected via IVR Translator. Speech bubbles from each region showing different languages (geometric text bubbles in rainbow colors: English, Spanish, French, Chinese, Arabic, Portuguese). VibeTrans logo integration showing multi-language support capacity (geometric badge with "100+ Languages" text in bright green). Communication flow visualization: headquarters voice input (geometric microphone in silver) → IVR Translator cloud processing (geometric cloud with translation gears in purple) → multi-regional output (geometric speakers in each region broadcasting local language). Background elements: global network mesh (geometric interconnected nodes forming worldwide web in light blue), international business symbols (geometric currency signs $€¥£ floating around), customer satisfaction metrics (geometric rising charts showing improved reach in success green). Regional diversity showcase: different time zones (geometric clock faces showing various times), cultural symbols (geometric simplified cultural icons per region). Color palette: sky blue dominant, connection cyan (#00FFFF), regional diversity rainbow (red/blue/yellow/green/purple), expansion green (#00FF00), professional navy (#000080), success gold (#FFD700). Global, inclusive, connected, business-growth atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-interest-1',
  },
  {
    section: 'User Interest 2',
    title: 'Efficiency Gains',
    prompt: `Geometric Flat Style cartoon illustration for "Efficiency Gains - Speed & Customer Satisfaction". Sky blue (#87CEEB) primary with soft gradient. Center shows dramatic BEFORE vs AFTER comparison split vertically. LEFT SIDE "BEFORE" (in dull gray tones): Slow manual process - Customer service rep (circular head looking stressed with geometric sweat drops, rectangular body hunched over) manually translating during call. Slow processing indicated by geometric snail icon crawling across bottom. Customer waiting (circular frustrated face) with long wait time clock (geometric analog clock showing extended time in red). Satisfaction meter at bottom showing low score (geometric gauge needle in red danger zone at 2/10). RIGHT SIDE "AFTER" (in vibrant colors): Fast automated IVR Translator - Same customer service rep (circular head now smiling confidently, rectangular body in upright posture) using VibeTrans interface. Real-time translation visualization (geometric voice waves instantly converting to text in rainbow colored stream). Speed indicated by geometric rocket icon zooming across (bright orange with motion lines). Happy customer (circular smiling face) with minimal wait time (geometric digital timer showing seconds in green). Satisfaction meter showing high score (geometric gauge needle in success green zone at 9/10). CENTER DIVIDER: Transformation arrow (large geometric arrow pointing from left to right in gradient gray→blue) with "With IVR Translator" label. Performance metrics floating around: "3x Faster Response" (geometric speed badge in bright cyan), "90% Satisfaction Rate" (geometric achievement star in gold), "Zero Language Barriers" (geometric checkmark in success green). Background elements: efficiency improvement chart (geometric rising line graph showing dramatic upward trend in success green), time saved visualization (geometric hourglass with sand flowing much faster on right side). Color palette: sky blue base, before dull gray (#808080), before frustration red (#FF4444), after vibrant blue (#00BFFF), after success green (#00FF00), speed orange (#FF8C00), satisfaction gold (#FFD700), efficiency cyan (#00FFFF). Transformative, performance-focused, customer-satisfaction, efficiency-optimization atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-interest-2',
  },
  {
    section: 'User Interest 3',
    title: 'Increased Accessibility',
    prompt: `Geometric Flat Style cartoon illustration for "Increased Accessibility - Inclusive Communication". Sky blue (#87CEEB) primary with soft gradient. Center features diverse group of customers (6-8 circular heads with varied skin tones, geometric simple facial features representing different ethnicities and backgrounds) all successfully using IVR Translator. Each customer has speech bubble in their native language (geometric text bubbles in rainbow colors showing: English, Spanish, Mandarin, Arabic, French, Hindi, Portuguese, Japanese scripts). All speech bubbles connect to central IVR Translator hub (geometric hexagon in bright purple with translation symbol). Accessibility features highlighted: hearing assistance icon (geometric ear with sound waves in cyan), visual text display (geometric screen showing captions in green), multilingual support (geometric globe with language flags in rainbow). Inclusion visualization: previously excluded customers (geometric figures in faded gray at edges) now connected and included (geometric connection lines lighting up in bright colors as they join the communication network). Universal access badge (geometric shield with checkmark and accessibility symbol in success green). "No One Left Behind" banner (geometric ribbon with inclusive message in bold friendly font, colors in diversity rainbow). Background elements: language barrier breaking down (geometric wall crumbling showing barriers being removed in dramatic effect), communication bridges forming (geometric bridge structures connecting different language groups in bright cyan), inclusive design symbols (geometric accessibility icons: wheelchair, hearing aid, multilingual, age-friendly in supportive blue). Customer testimonials floating around: satisfaction quotes in geometric speech clouds ("Finally understood!", "My language!", "So easy!" in various scripts and colors). Diversity metrics: "15+ Languages Supported" (geometric counter badge in gold), "100% Inclusive" (geometric achievement seal in green). Color palette: sky blue base, diversity rainbow (all inclusive colors), accessibility green (#00CC66), inclusion purple (#9370DB), connection cyan (#00FFFF), universal blue (#0066FF), support gold (#FFD700). Inclusive, welcoming, accessible, diversity-celebrating atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-interest-3',
  },
  {
    section: 'User Interest 4',
    title: 'Seamless Integration',
    prompt: `Geometric Flat Style cartoon illustration for "Seamless Integration - Easy System Connection". Sky blue (#87CEEB) primary with soft gradient. Center shows existing IVR system (geometric server rack/infrastructure in professional gray) with VibeTrans IVR Translator module smoothly integrating. Integration visualization: "EXISTING SYSTEM" on left (geometric established infrastructure with database, servers, phone system in organized arrangement) + "VIBETRANS MODULE" in center (geometric sleek plugin component in bright blue with connection ports glowing in cyan) = "ENHANCED SYSTEM" on right (geometric upgraded infrastructure with multilingual capabilities, shown as original system now radiating multi-colored language signals). Connection process shown as 3 simple steps: STEP 1 - API Connection (geometric plug/socket connecting with green success glow), STEP 2 - Configuration (geometric settings panel with simple toggle switches in orange), STEP 3 - Activation (geometric power button being pressed with bright activation glow in cyan). "Plug & Play" badge (geometric easy-setup seal in success green) emphasizing simplicity. Technical integration details: REST API visualization (geometric data flow arrows in purple showing bidirectional communication), authentication (geometric security lock connecting safely in gold), real-time sync (geometric circular sync arrows in bright blue showing continuous data exchange). Background elements: compatibility symbols (geometric puzzle pieces fitting perfectly together in satisfying click, rainbow colors), zero downtime indicator (geometric uptime meter showing 100% in green), developer-friendly code snippets (geometric code editor window with simple integration script in monospace font, syntax highlighted), system architecture diagram (geometric flowchart showing how VibeTrans fits into existing infrastructure seamlessly). Before-After comparison badge: "Setup Time: Hours → Minutes" (geometric clock transformation in bright orange). Support elements: documentation icon (geometric open book with clear instructions in blue), API dashboard (geometric analytics panel showing successful integration metrics in cyan). Color palette: sky blue base, existing system gray (#708090), VibeTrans module blue (#00BFFF), integration success green (#00FF00), configuration orange (#FF8C00), API purple (#9370DB), security gold (#FFD700), compatibility cyan (#00FFFF). Professional, developer-friendly, easy-integration, seamless-connection atmosphere. 4:3 aspect ratio, 800x600px.`,
    filename: 'ivr-translator-interest-4',
  },
];

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  console.log(`📥 Downloading image from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to WebP with optimization
  await sharp(buffer).webp({ quality: 85, effort: 6 }).toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function generateAllImages() {
  console.log('\n🎨 Starting image generation for ivr-translator...\n');
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(
      `🖼️  Image ${i + 1}/${imageTasks.length}: ${task.filename}.webp`
    );
    console.log(`📝 Description: ${task.title}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      const result = await generateIllustration({
        prompt: task.prompt,
        filename: `${task.filename}.webp`,
      });

      console.log(`\n🔗 Generated URL: ${result.url}`);
      if (result.revisedPrompt) {
        console.log(
          `📄 Revised prompt: ${result.revisedPrompt.substring(0, 100)}...`
        );
      }
      console.log(`🤖 Model used: ${result.modelUsed}`);

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, `${task.filename}.webp`);
      await downloadAndConvertImage(result.url, outputPath);

      successCount++;
      console.log(`\n✅ Successfully generated: ${task.filename}.webp`);
    } catch (error: any) {
      failCount++;
      console.error(
        `\n❌ Failed to generate ${task.filename}.webp:`,
        error.message
      );

      // Continue with next image instead of stopping
      console.log(`🔄 Continuing with next image...`);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 GENERATION SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Success: ${successCount}/${imageTasks.length}`);
  console.log(`❌ Failed: ${failCount}/${imageTasks.length}`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(80)}\n`);

  if (failCount > 0) {
    console.warn(`⚠️  Some images failed to generate. Please retry manually.`);
    process.exit(1);
  } else {
    console.log(`🎉 All images generated successfully!`);
  }
}

// Run the generator
generateAllImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
