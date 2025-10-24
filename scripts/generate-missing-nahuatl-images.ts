import path from 'path';
import { generateImage } from '@/lib/article-illustrator/image-generator';
import { writeFile } from 'fs/promises';

const imageConfigs = [
  {
    filename: 'what-is-nahuatl-translator.webp',
    prompt:
      'Nahuatl language cultural heritage visualization. Show ancient Aztec codex with modern Nahuatl speakers, traditional Mexican indigenous patterns, and linguistic elements. Professional documentary style with warm earth tones and cultural symbolism.',
    width: 1200,
    height: 630,
  },
  {
    filename: 'nahuatl-translator-how-to.webp',
    prompt:
      'Step by step guide for Nahuatl translation. Show user interface with Nahuatl to English translation process, clean instructional design with numbered steps, and educational visual elements.',
    width: 1200,
    height: 630,
  },
  {
    filename: 'nahuatl-translator-fact-1.webp',
    prompt:
      'Historical Aztec codex and modern Nahuatl speakers. Show ancient manuscripts, traditional knowledge preservation, indigenous cultural elements, and academic research setting with professional documentary photography style.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-fact-2.webp',
    prompt:
      'Nahuatl language structure and word formation visualization. Show linguistic analysis, agglutinative language features, morpheme breakdown, and educational diagrams explaining Nahuatl grammar concepts.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-interest-1.webp',
    prompt:
      'Researchers working with Nahuatl texts and documentation. Show academic setting, linguistic analysis, historical documents, scholarly research environment with books and manuscripts.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-interest-2.webp',
    prompt:
      'Classroom setting with Nahuatl language education. Show teaching indigenous culture, students learning Nahuatl, educational materials, bilingual education in progress.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-interest-3.webp',
    prompt:
      'Cultural heritage preservation projects. Show community members documenting traditional Nahuatl stories, indigenous knowledge preservation, cultural activism, language revitalization efforts.',
    width: 600,
    height: 400,
  },
  {
    filename: 'nahuatl-translator-interest-4.webp',
    prompt:
      'Healthcare professional communicating with Nahuatl-speaking communities. Show medical outreach, cross-cultural healthcare communication, community health services, respectful cultural interaction.',
    width: 600,
    height: 400,
  },
];

async function main() {
  console.log('🎨 开始生成纳瓦特尔语翻译器缺失的图片...');

  for (const config of imageConfigs) {
    try {
      console.log(`📸 生成图片: ${config.filename}`);

      const imageBuffer = await generateImage({
        prompt: config.prompt,
        width: config.width,
        height: config.height,
        style: 'professional documentary photography with cultural elements',
      });

      const outputPath = path.join(
        process.cwd(),
        'public/images/docs',
        config.filename
      );
      await writeFile(outputPath, imageBuffer);
      console.log(`✅ 已保存: ${config.filename}`);

      // 添加延迟避免API限制
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ 生成 ${config.filename} 失败:`, error);
    }
  }

  console.log('🎉 纳瓦特尔语翻译器图片生成完成！');
}

main().catch(console.error);
