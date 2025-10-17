/**
 * 使用多个 API 重新生成缺失的 Aramaic Translator 图片
 * 尝试顺序：Ideogram v3 -> Replicate (Flux) -> Cloudflare AI
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface ImageTask {
  name: string;
  section: string;
  filename: string;
  prompt: string;
}

// 缺失的5张图片及其 Gemini 生成的提示词
const missingImages: ImageTask[] = [
  {
    name: 'What is XXXX',
    section: 'whatIs',
    filename: 'aramaic-translation-bridge',
    prompt:
      'Geometric flat illustration for "What is XXXX" (Aramaic translation tool). Dominated by sky blue, a simplified scroll (ancient symbol) unfolds into a bridge connecting two landmasses (past and present). Soft pastel icons of symbol, gears (algorithms), and speech bubbles float above, suggesting knowledge, technology, and communication. 4:3 ratio, minimalist, cheerful.',
  },
  {
    name: 'Fun Fact 2',
    section: 'funFacts-1',
    filename: 'ancient-chat-bubbles',
    prompt:
      'Geometric flat illustration of an ancient scroll unrolling horizontally, pastel yellow parchment texture, speech bubbles in mint green and light pink emerging from the scroll, a friendly stylized character icon with a graduation cap, sky blue background, 4:3 aspect ratio, spacious negative space, cheerful and welcoming mood.',
  },
  {
    name: 'Dialect-Specific Translations',
    section: 'userInterest-0',
    filename: 'aramaic-party',
    prompt:
      'Geometric flat illustration: centered composition depicting a stylized ancient party scene. Speech bubbles in pastel pink, mint green, and light yellow emanate from simple character icons, each representing a different Aramaic dialect. Arrows subtly link bubbles, suggesting translation. Sky blue background, spacious negative space, cheerful and welcoming mood, 4:3 aspect ratio.',
  },
  {
    name: 'Certified Human Translators',
    section: 'userInterest-2',
    filename: 'translator-superstars',
    prompt:
      'Minimalist geometric flat illustration, dominant sky blue background, three stylized human figures each holding a speech bubble (light yellow, pink, mint green), connected by abstract arrow shapes suggesting communication flow, centered composition, 4:3 ratio, spacious negative space, conveying "Certified Human Translators" in a cheerful and approachable style.',
  },
  {
    name: 'Interactive Transliteration',
    section: 'userInterest-3',
    filename: 'language-magic-tool',
    prompt:
      'Geometric flat illustration of a hand playing a pastel-colored piano keyboard. Notes transform into stylized Aramaic symbol floating upward. Sky blue background with subtle light yellow and mint green abstract shapes suggesting energy or transformation. 4:3 aspect ratio, clean, centered composition, spacious, minimalist, cheerful mood.',
  },
];

// API 配置
const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;
const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Ideogram v3
async function generateWithIdeogram(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 [Ideogram v3] 生成中...');

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt,
          aspect_ratio: 'ASPECT_4_3',
          model: 'V_2',
          magic_prompt_option: 'AUTO',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Ideogram error (${response.status}):`, error);
      return null;
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].url) {
      console.log('✅ Ideogram 生成成功');
      return data.data[0].url;
    }

    return null;
  } catch (error) {
    console.error('❌ Ideogram 失败:', error);
    return null;
  }
}

// 2. Replicate (Flux Schnell)
async function generateWithReplicate(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 [Replicate Flux] 生成中...');

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt: prompt,
          aspect_ratio: '4:3',
          num_outputs: 1,
          output_format: 'png',
        },
      }),
    });

    if (!response.ok) {
      console.error(`❌ Replicate error (${response.status})`);
      return null;
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // 轮询结果
    for (let i = 0; i < 60; i++) {
      await sleep(2000);

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_KEY}`,
          },
        }
      );

      const status = await statusResponse.json();

      if (status.status === 'succeeded' && status.output && status.output[0]) {
        console.log('✅ Replicate 生成成功');
        return status.output[0];
      }

      if (status.status === 'failed') {
        console.error('❌ Replicate 生成失败');
        return null;
      }

      if (i % 10 === 0) {
        console.log(`⏳ Replicate 生成中... (${i * 2}s)`);
      }
    }

    console.error('❌ Replicate 超时');
    return null;
  } catch (error) {
    console.error('❌ Replicate 失败:', error);
    return null;
  }
}

// 3. Cloudflare AI (Stable Diffusion)
async function generateWithCloudflare(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 [Cloudflare AI] 生成中...');

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      }
    );

    if (!response.ok) {
      console.error(`❌ Cloudflare error (${response.status})`);
      return null;
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Cloudflare 直接返回图片二进制，我们需要临时保存
    const tempPath = `/tmp/cloudflare-temp-${Date.now()}.png`;
    fs.writeFileSync(tempPath, buffer);
    console.log('✅ Cloudflare 生成成功');

    return tempPath; // 返回临时文件路径而不是 URL
  } catch (error) {
    console.error('❌ Cloudflare 失败:', error);
    return null;
  }
}

async function downloadAndConvertToWebP(
  imageSource: string,
  filename: string,
  outputDir: string
): Promise<boolean> {
  try {
    let buffer: Buffer;

    // 判断是 URL 还是本地文件路径
    if (imageSource.startsWith('http')) {
      console.log(`📥 下载图片: ${filename}...`);
      const response = await fetch(imageSource);
      if (!response.ok) {
        console.error(`❌ 下载失败: ${response.status}`);
        return false;
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // 本地文件路径 (Cloudflare)
      console.log(`📁 读取本地图片: ${filename}...`);
      buffer = fs.readFileSync(imageSource);
      // 删除临时文件
      fs.unlinkSync(imageSource);
    }

    // 转换为 WebP，目标大小 90KB ±5KB
    const targetSize = 90 * 1024;
    const tolerance = 5 * 1024;
    let quality = 85;
    let attempt = 0;
    const maxAttempts = 10;

    console.log(`🔄 转换为 WebP: ${filename} (目标: 90KB ±5KB)`);

    while (attempt < maxAttempts) {
      attempt++;

      const webpBuffer = await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .webp({ quality })
        .toBuffer();

      const size = webpBuffer.length;
      const sizeKB = (size / 1024).toFixed(2);

      console.log(
        `   尝试 ${attempt}/${maxAttempts}: quality=${quality}, size=${sizeKB}KB`
      );

      if (Math.abs(size - targetSize) <= tolerance) {
        const outputPath = path.join(outputDir, `${filename}.webp`);
        fs.writeFileSync(outputPath, webpBuffer);
        console.log(`✅ 转换完成: ${filename}.webp (${sizeKB}KB, 800x600)`);
        return true;
      }

      if (size < targetSize - tolerance) {
        quality = Math.min(100, quality + (100 - quality) / 2);
      } else if (size > targetSize + tolerance) {
        quality = Math.max(1, quality * 0.9);
      }

      if (attempt === maxAttempts) {
        const outputPath = path.join(outputDir, `${filename}.webp`);
        fs.writeFileSync(outputPath, webpBuffer);
        console.log(`⚠️  达到极限: ${filename}.webp (${sizeKB}KB)`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ 转换失败 ${filename}:`, error);
    return false;
  }
}

async function generateImage(
  task: ImageTask,
  outputDir: string
): Promise<boolean> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📝 任务: ${task.name}`);
  console.log(`📁 文件名: ${task.filename}.webp`);
  console.log(`💬 提示词: ${task.prompt.substring(0, 100)}...`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 按顺序尝试不同的 API
  const generators = [
    { name: 'Ideogram v3', fn: generateWithIdeogram },
    { name: 'Replicate Flux', fn: generateWithReplicate },
    { name: 'Cloudflare AI', fn: generateWithCloudflare },
  ];

  for (const generator of generators) {
    console.log(`\n🔄 尝试使用 ${generator.name}...`);

    try {
      const imageSource = await generator.fn(task.prompt);

      if (imageSource) {
        const success = await downloadAndConvertToWebP(
          imageSource,
          task.filename,
          outputDir
        );

        if (success) {
          console.log(`\n✅ [${generator.name}] ${task.name} 生成成功！`);
          return true;
        }
      }
    } catch (error) {
      console.error(`❌ [${generator.name}] 出错:`, error);
    }

    console.log(`⏭️  ${generator.name} 失败，尝试下一个...`);
    await sleep(1000);
  }

  console.log(`\n❌ 所有 API 都失败了: ${task.name}`);
  return false;
}

async function main() {
  console.log('\n🎨 Aramaic Translator 缺失图片生成');
  console.log('📦 使用多 API 策略 (Ideogram -> Replicate -> Cloudflare)');
  console.log(`📊 待生成: ${missingImages.length} 张图片\n`);

  const outputDir = path.join(process.cwd(), 'public/images/docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: Array<{ name: string; filename: string; success: boolean }> =
    [];

  for (let i = 0; i < missingImages.length; i++) {
    const task = missingImages[i];
    console.log(`\n\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
    console.log(
      `┃ [${i + 1}/${missingImages.length}] ${task.name.padEnd(38)}┃`
    );
    console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);

    const success = await generateImage(task, outputDir);
    results.push({
      name: task.name,
      filename: task.filename,
      success,
    });

    // 每次生成后等待一段时间
    if (i < missingImages.length - 1) {
      console.log('\n⏳ 等待 5 秒后继续...\n');
      await sleep(5000);
    }
  }

  // 总结
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 生成结果总结');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ 成功: ${successful.length}/${missingImages.length}`);
  console.log(`❌ 失败: ${failed.length}/${missingImages.length}\n`);

  if (successful.length > 0) {
    console.log('✅ 成功生成的图片:');
    successful.forEach((r) => {
      console.log(`   ✓ ${r.filename}.webp - ${r.name}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ 失败的图片:');
    failed.forEach((r) => {
      console.log(`   ✗ ${r.name}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(console.error);
