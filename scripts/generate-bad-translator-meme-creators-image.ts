import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

/**
 * 生成Bad Translator页面"For Meme Creators and Influencers"section的图片
 *
 * 图片内容：展示Bad Translator如何帮助meme创作者和网红创作病毒式传播的有趣内容
 * 场景：展示社交媒体平台、手机界面、梗图创作过程等元素
 */

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

const imageTask = {
  filename: 'bad-translator-meme-creators.webp',
  description: 'For Meme Creators and Influencers section - Bad Translator helps content creators generate viral funny phrases and trending content',
  prompt: `Create a vibrant and modern illustration showing a young content creator (meme creator/influencer) using Bad Translator tool on their laptop and smartphone. The scene should include:

1. A trendy young person sitting at a desk with a laptop showing the Bad Translator interface
2. Speech bubbles showing funny translation examples (like "Hello" → "Greetings from afar" → "Funny meme text")
3. Social media elements: Instagram, TikTok, Twitter icons visible
4. Viral meme format examples in the background
5. Bright, engaging colors with a modern digital aesthetic
6. The overall mood should be creative, fun, and professional

Style: Digital illustration, modern flat design, vibrant colors, clean lines, professional yet playful aesthetic. Perfect for a SaaS landing page targeting content creators and influencers. 4:3 aspect ratio.`,
};

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

async function main() {
  console.log('🎨 Starting Bad Translator Meme Creators image generation...');

  try {
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    console.log(`🖼️  Generating image: ${imageTask.filename}`);
    console.log(`📝 Description: ${imageTask.description}`);

    // 生成图片
    const result = await generateIllustration({
      prompt: imageTask.prompt,
      filename: imageTask.filename,
    });

    console.log(`🔗 Generated URL: ${result.url}`);
    if (result.revisedPrompt) {
      console.log(`📄 Revised prompt: ${result.revisedPrompt.substring(0, 100)}...`);
    }
    console.log(`🤖 Model used: ${result.modelUsed}`);

    // 下载并转换为WebP
    const outputPath = path.join(OUTPUT_DIR, imageTask.filename);
    await downloadAndConvertImage(result.url, outputPath);

    console.log(`✅ Image generated successfully: ${imageTask.filename}`);
    console.log(`📁 Saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error generating image:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { config as badTranslatorMemeCreatorsConfig };