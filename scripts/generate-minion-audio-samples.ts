/**
 * 生成小黄人声音示例音频文件
 *
 * 使用 Google Cloud TTS 或浏览器 TTS 生成示例音频
 */

import fs from 'fs';
import path from 'path';

// 小黄人经典语句示例
const MINION_SAMPLES = [
  {
    id: 'example-1',
    english: 'Hello! How are you?',
    minionese: 'Bello! Howa ru?',
    description: 'Greeting - Basic hello',
  },
  {
    id: 'example-2',
    english: 'Thank you very much!',
    minionese: 'Tank yu bery mach!',
    description: 'Gratitude expression',
  },
  {
    id: 'example-3',
    english: 'I love bananas!',
    minionese: 'Me lova banana!',
    description: 'Food preference',
  },
  {
    id: 'example-4',
    english: 'Goodbye, see you later!',
    minionese: 'Poopaye! Seeta latta!',
    description: 'Farewell phrase',
  },
  {
    id: 'example-5',
    english: 'What is your name?',
    minionese: 'Watta yu nama?',
    description: 'Question asking',
  },
  {
    id: 'example-6',
    english: 'I am very happy!',
    minionese: 'Me bery happy!',
    description: 'Emotion expression',
  },
];

async function generateAudioWithGoogleTTS(text: string, outputPath: string) {
  try {
    const response = await fetch('http://localhost:3001/api/google-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        tone: 'evil',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    console.log(`✅ Generated: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${path.basename(outputPath)}:`, error);
    return false;
  }
}

async function main() {
  console.log(
    '================================================================================'
  );
  console.log('🎤 Minion Audio Sample Generator');
  console.log(
    '================================================================================\n'
  );

  const outputDir = path.join(
    process.cwd(),
    'public',
    'audio',
    'minion-samples'
  );

  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  console.log('🎯 Generating audio samples...\n');

  let successCount = 0;
  let failCount = 0;

  for (const sample of MINION_SAMPLES) {
    console.log(`📝 ${sample.id}: "${sample.minionese}"`);
    console.log(`   Description: ${sample.description}`);

    const outputPath = path.join(outputDir, `${sample.id}.mp3`);
    const success = await generateAudioWithGoogleTTS(
      sample.minionese,
      outputPath
    );

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    console.log('');

    // 添加延迟，避免 API 限流
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(
    '================================================================================'
  );
  console.log('✅ GENERATION COMPLETE');
  console.log(
    '================================================================================'
  );
  console.log(`✅ Success: ${successCount} files`);
  console.log(`❌ Failed: ${failCount} files`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(
    '================================================================================\n'
  );

  // 生成示例列表 JSON
  const samplesJson = {
    samples: MINION_SAMPLES.map((sample) => ({
      ...sample,
      audioUrl: `/audio/minion-samples/${sample.id}.mp3`,
    })),
  };

  const jsonPath = path.join(outputDir, 'samples.json');
  fs.writeFileSync(jsonPath, JSON.stringify(samplesJson, null, 2));
  console.log(`📄 Sample list saved to: ${jsonPath}\n`);
}

main().catch(console.error);
