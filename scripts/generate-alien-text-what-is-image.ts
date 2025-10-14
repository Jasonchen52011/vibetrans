/**
 * Generate "What is Alien Text Generator?" illustration
 * Using Seedream 4.0 with Geometric Flat Style
 */

import fs from 'fs';
import path from 'path';
import { generateImageWithSeedream } from '../src/lib/kie-text-to-image';

async function generateWhatIsImage() {
  console.log('🎨 Generating "What is Alien Text Generator?" image...\n');

  const prompt = `Geometric Flat Style cartoon illustration, clean lines, soft pastel cold colors, dominant sky blue, a stylized futuristic tablet or holographic screen displaying abstract alien symbols and glowing geometric patterns, representing text transformation and extraterrestrial communication, modern minimalist design, floating geometric shapes around the device, abstract tech aesthetic, no text, no logo, 4:3 aspect ratio`;

  try {
    console.log('📝 Prompt:', prompt);
    console.log('\n⏳ Generating with Seedream 4.0...\n');

    const result = await generateImageWithSeedream(prompt, {
      imageSize: 'landscape_4_3',
      imageResolution: '2K',
      maxImages: 1,
    });

    console.log('\n✅ Image generated successfully!');
    console.log('🔗 URL:', result.url);

    // Save URL to file for reference
    const outputDir = path.join(process.cwd(), 'public/images/docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const urlFile = path.join(
      outputDir,
      'what-is-alien-text-generator-url.txt'
    );
    fs.writeFileSync(
      urlFile,
      `${result.url}\n\nPrompt:\n${prompt}\n\nGenerated: ${new Date().toISOString()}`
    );

    console.log('\n📄 URL saved to:', urlFile);
    console.log('\n💡 Next steps:');
    console.log('   1. Download the image from the URL above');
    console.log('   2. Convert to WebP format');
    console.log(
      '   3. Save as: public/images/docs/what-is-alien-text-generator.webp'
    );

    return result;
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateWhatIsImage()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error);
      process.exit(1);
    });
}

export { generateWhatIsImage };
