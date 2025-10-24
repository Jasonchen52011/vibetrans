import path from 'path';
import { generateIllustration } from '@/lib/article-illustrator/image-generator';
import { writeFile } from 'fs/promises';

const imageConfigs = [
  {
    filename: 'what-is-nahuatl-translator.webp',
    prompt:
      'Modern digital translation interface with ancient Aztec codices floating in the background. A sleek tablet or smartphone showing Nahuatl to English translation app, with glowing golden traditional Mexican patterns and symbols. Contemporary technology meeting pre-Columbian heritage. Warm earth tones with pops of vibrant turquoise and gold. Professional digital illustration style with clean modern UI elements mixed with traditional Aztec iconography.',
    width: 1200,
    height: 630,
  },
  {
    filename: 'nahuatl-translator-how-to.webp',
    prompt:
      'Step-by-step tutorial infographic for Nahuatl translation app. Clean, modern instructional design showing: 1) User typing Nahuatl text, 2) AI processing with neural network visualization, 3) English translation appearing with pronunciation guide. Use numbered circles, arrow flow, and minimalist icons. Soft blue and green color scheme with white background. Professional UX/UI tutorial illustration style.',
    width: 1200,
    height: 630,
  },
  {
    filename: 'nahuatl-translator-fact-1.webp',
    prompt:
      'Beautiful food photography collage showing chocolate, tomato, and avocado in their natural forms, with ghostly translucent Nahuatl words "xocolatl", "tomatl", "ahuacatl" floating above them. Warm, appetizing lighting with authentic Mexican market background atmosphere. Professional food photography style with overlay typography showing linguistic connections.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-fact-2.webp',
    prompt:
      'Educational linguistic diagram showing how Nahuatl words are built from multiple morphemes. Visual breakdown of a single Nahuatl verb like "nokikwa" (I eat it) separating into "no-" (I), "-ki-" (object), "-kwa-" (eat), "-a" (present). Use colorful blocks, connecting arrows, and clear typography. Academic yet engaging educational illustration style with clean modern design.',
    width: 600,
    height: 400,
  },
];

async function main() {
  console.log('🎨 开始生成独特的纳瓦特尔语翻译器图片...');

  for (const config of imageConfigs) {
    try {
      console.log(`📸 生成图片: ${config.filename}`);
      console.log(`📝 提示词: ${config.prompt.substring(0, 100)}...`);

      const result = await generateIllustration({
        prompt: config.prompt,
        filename: config.filename,
      });

      // Download the image from URL
      const response = await fetch(result.url);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      const outputPath = path.join(
        process.cwd(),
        'public/images/docs',
        config.filename
      );
      await writeFile(outputPath, imageBuffer);
      console.log(`✅ 已保存: ${config.filename}`);

      // 添加延迟避免API限制
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ 生成 ${config.filename} 失败:`, error);
    }
  }

  console.log('🎉 纳瓦特尔语翻译器独特图片生成完成！');

  // 验证文件大小
  console.log('\n📊 检查生成的图片文件大小:');
  for (const config of imageConfigs) {
    const filePath = path.join(
      process.cwd(),
      'public/images/docs',
      config.filename
    );
    try {
      const stats = await require('fs').promises.stat(filePath);
      console.log(`${config.filename}: ${stats.size} bytes`);
    } catch (error) {
      console.log(`${config.filename}: 文件不存在`);
    }
  }
}

main().catch(console.error);
