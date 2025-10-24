#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import { generateImage } from '../src/lib/volcano-image.ts';

// 需要生成的图片列表
const imagesToGenerate = [
  {
    filename: 'telugu-to-english-translator-example-1',
    title: 'Daily Conversation',
    prompt:
      'Telugu to English daily conversation translation. Two people chatting with speech bubbles showing Telugu and English text. Clean, friendly illustration with pastel colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-example-2',
    title: 'Business Communication',
    prompt:
      'Professional business translation scene. Office setting with documents showing Telugu text being translated to English. Corporate, clean design with blue and gray colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-example-3',
    title: 'Educational Content',
    prompt:
      'Educational translation setting. Classroom or library with books showing Telugu and English text. Academic, inspiring illustration with warm colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-example-4',
    title: 'Social Media',
    prompt:
      'Social media translation scene. Smartphone or computer screen showing Telugu social media posts being translated to English. Modern, digital illustration with vibrant colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-example-5',
    title: 'Legal Documents',
    prompt:
      'Legal document translation. Formal setting with legal papers showing Telugu text being translated to English. Professional, authoritative design with dark blue and gold colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-example-6',
    title: 'Medical Text',
    prompt:
      'Medical translation scene. Healthcare setting with medical reports showing Telugu text being translated to English. Clinical, professional design with blue and green colors. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-fact-1',
    title: 'Ancient Language Heritage',
    prompt:
      'Ancient Telugu heritage. Historical illustration showing ancient Telugu manuscripts and classical literature elements. Cultural, elegant design with warm earth tones. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-fact-2',
    title: 'Global Reach',
    prompt:
      'Global communication showing Telugu speakers worldwide connecting with English speakers. World map with communication lines between India and English-speaking countries. Modern, professional design. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-interest-1',
    title: 'Cultural Context Preservation',
    prompt:
      'Cultural preservation in translation. Hands holding cultural artifacts with Telugu script transforming into English while preserving cultural meaning. Respectful, warm design. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-interest-2',
    title: 'Technical & Professional Translation',
    prompt:
      'Technical translation workflow. Different professional fields (medicine, law, engineering) with Telugu technical documents being translated. Professional, modern design. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-interest-3',
    title: 'Educational Applications',
    prompt:
      'Educational translation applications. Students and teachers using translation tools for learning Telugu to English. Academic, inspiring illustration. 4:3 ratio.',
  },
  {
    filename: 'telugu-to-english-translator-interest-4',
    title: 'Business Integration',
    prompt:
      'Business integration through translation. Business meeting with Telugu and English speakers communicating effectively. Corporate, professional design. 4:3 ratio.',
  },
  {
    filename: 'what-is-telugu-to-english-translator',
    title: 'What is Telugu to English Translator',
    prompt:
      'AI-powered translation tool interface. Clean, modern design showing translation process from Telugu to English with technology elements. Professional, educational illustration. 4:3 ratio.',
  },
];

async function generateSingleImage(imageConfig) {
  console.log(`\n🎨 Generating image: ${imageConfig.filename}`);
  console.log(`📝 Prompt: ${imageConfig.title}`);

  try {
    const result = await generateImage(imageConfig.prompt, {
      aspectRatio: '4:3',
      style: 'professional, clean, modern',
      quality: 'high',
    });

    if (result.success && result.urls && result.urls.length > 0) {
      console.log(`✅ Image generated successfully: ${imageConfig.filename}`);
      return {
        success: true,
        filename: imageConfig.filename,
        url: result.urls[0],
      };
    } else {
      console.error(`❌ Failed to generate image: ${imageConfig.filename}`);
      return {
        success: false,
        filename: imageConfig.filename,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error) {
    console.error(
      `❌ Error generating image ${imageConfig.filename}:`,
      error.message
    );
    return {
      success: false,
      filename: imageConfig.filename,
      error: error.message,
    };
  }
}

async function main() {
  console.log(
    '🚀 Starting Telugu to English Translator individual image generation...\n'
  );

  const results = [];

  // 逐个生成图片，避免API限制
  for (let i = 0; i < imagesToGenerate.length; i++) {
    const imageConfig = imagesToGenerate[i];
    console.log(
      `\n[${i + 1}/${imagesToGenerate.length}] Processing: ${imageConfig.title}`
    );

    const result = await generateSingleImage(imageConfig);
    results.push(result);

    // 如果不是最后一张图片，等待一段时间避免API限制
    if (i < imagesToGenerate.length - 1) {
      console.log('⏳ Waiting 3 seconds before next image...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // 保存结果
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'telugu-to-english-translator',
    'individual-generation-results.json'
  );
  await fs.mkdir(path.dirname(resultPath), { recursive: true });
  await fs.writeFile(resultPath, JSON.stringify(results, null, 2));

  console.log('\n📊 GENERATION SUMMARY:');
  console.log(
    `✅ Successful: ${results.filter((r) => r.success).length}/${results.length}`
  );
  console.log(
    `❌ Failed: ${results.filter((r) => !r.success).length}/${results.length}`
  );

  const successful = results.filter((r) => r.success);
  if (successful.length > 0) {
    console.log('\n✅ Successfully generated images:');
    successful.forEach((r) => console.log(`   - ${r.filename}.webp`));
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed images:');
    failed.forEach((r) => console.log(`   - ${r.filename}: ${r.error}`));
  }
}

main().catch(console.error);
