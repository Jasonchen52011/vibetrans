/**
 * 手动生成缺失的 Aramaic Translator 图片
 * 使用 Seedream 4.0 (通过 KIE API)
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Seedream 4.0 配置
const SEEDREAM_API_URL = 'https://api.siliconflow.cn/v1/image/generations';
const SEEDREAM_API_KEY = process.env.SILICONFLOW_API_KEY;
const SEEDREAM_MODEL = 'Pro/seedream/seedream-sd3';

interface ImageTask {
  name: string;
  section: string;
  filename: string;
  prompt: string;
}

// 基于之前 Gemini 生成的提示词
const missingImages: ImageTask[] = [
  {
    name: 'What is XXXX',
    section: 'whatIs',
    filename: 'scroll-translate-bridge',
    prompt:
      'Geometric flat illustration for "What is XXXX" (Aramaic translation tool). Dominated by sky blue, a simplified scroll (ancient symbol) unfolds into a bridge connecting two landmasses (past and present). Soft pastel icons of symbol, gears (algorithms), and speech bubbles float above, suggesting knowledge, technology, and communication. 4:3 ratio, minimalist, cheerful., pure visual communication, minimalist symbolic design',
  },
  {
    name: 'Fun Fact 2',
    section: 'funFacts',
    filename: 'scroll-chat-bubbles',
    prompt:
      'Geometric flat illustration of an ancient scroll unrolling horizontally, pastel yellow parchment texture, speech bubbles in mint green and light pink emerging from the scroll, a friendly stylized character icon with a graduation cap, sky blue background, 4:3 aspect ratio, spacious negative space, cheerful and welcoming mood., pure visual communication, minimalist symbolic design',
  },
  {
    name: 'Dialect-Specific Translations',
    section: 'userInterest-1',
    filename: 'dialect-party',
    prompt:
      'Geometric flat illustration: centered composition depicting a stylized ancient party scene. Speech bubbles in pastel pink, mint green, and light yellow emanate from simple character icons, each representing a different Aramaic dialect. Arrows subtly link bubbles, suggesting translation. Sky blue background, spacious negative space, cheerful and welcoming mood, 4:3 aspect ratio., pure visual communication, minimalist symbolic design',
  },
  {
    name: 'Certified Human Translators',
    section: 'userInterest-3',
    filename: 'translator-team',
    prompt:
      'Minimalist geometric flat illustration, dominant sky blue background, three stylized human figures each holding a speech bubble (light yellow, pink, mint green), connected by abstract arrow shapes suggesting communication flow, centered composition, 4:3 ratio, spacious negative space, conveying "Certified Human Translators" in a cheerful and approachable style., pure visual communication, minimalist symbolic design',
  },
  {
    name: 'Interactive Transliteration',
    section: 'userInterest-4',
    filename: 'transliteration-magic',
    prompt:
      'Geometric flat illustration of a hand playing a pastel-colored piano keyboard. Notes transform into stylized Aramaic symbol floating upward. Sky blue background with subtle light yellow and mint green abstract shapes suggesting energy or transformation. 4:3 aspect ratio, clean, centered composition, spacious, minimalist, cheerful mood., pure visual communication, minimalist symbolic design',
  },
];

async function generateWithSeedream(
  prompt: string,
  filename: string
): Promise<string | null> {
  try {
    console.log(`🎨 [Seedream] Generating: ${filename}...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch(SEEDREAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SEEDREAM_API_KEY}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_MODEL,
        prompt: prompt,
        image_size: '1024x768',
        batch_size: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Seedream API error (${response.status}):`, error);
      return null;
    }

    const data = await response.json();
    if (data.images && data.images.length > 0) {
      const imageUrl = data.images[0].url;
      console.log(`✅ Image generated: ${imageUrl}`);
      return imageUrl;
    }

    console.error('❌ No image URL in response');
    return null;
  } catch (error) {
    console.error(`❌ Failed to generate with Seedream:`, error);
    return null;
  }
}

async function downloadAndConvertToWebP(
  imageUrl: string,
  filename: string,
  outputDir: string
): Promise<boolean> {
  try {
    console.log(`📥 Downloading: ${filename}...`);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`❌ Failed to download: ${response.status}`);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 转换为 WebP，目标大小 90KB ±5KB
    const targetSize = 90 * 1024;
    const tolerance = 5 * 1024;
    let quality = 85;
    let attempt = 0;
    const maxAttempts = 10;

    console.log(`🔄 Converting to WebP: ${filename} (target: 90KB ±5KB)`);

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
        // 达到目标大小
        const outputPath = path.join(outputDir, `${filename}.webp`);
        fs.writeFileSync(outputPath, webpBuffer);
        console.log(
          `✅ [WebP] 转换完成: ${filename}.webp (${sizeKB}KB, 800x600)`
        );
        return true;
      }

      // 调整质量
      if (size < targetSize - tolerance) {
        quality = Math.min(100, quality + (100 - quality) / 2);
      } else if (size > targetSize + tolerance) {
        quality = Math.max(1, quality * 0.9);
      }

      if (attempt === maxAttempts) {
        // 达到最大尝试次数，使用当前结果
        const outputPath = path.join(outputDir, `${filename}.webp`);
        fs.writeFileSync(outputPath, webpBuffer);
        console.log(
          `⚠️  达到质量调整极限，使用当前参数: ${filename}.webp (${sizeKB}KB)`
        );
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Failed to convert ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🎨 手动生成缺失的 Aramaic Translator 图片');
  console.log('📦 使用 Seedream 4.0 (KIE API)');
  console.log(`📊 待生成: ${missingImages.length} 张图片\n`);

  const outputDir = path.join(process.cwd(), 'public/images/docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: Array<{ name: string; filename: string; success: boolean }> =
    [];

  for (let i = 0; i < missingImages.length; i++) {
    const task = missingImages[i];
    console.log(`\n[${i + 1}/${missingImages.length}] 生成: ${task.name}`);
    console.log(`文件名: ${task.filename}.webp`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const imageUrl = await generateWithSeedream(task.prompt, task.filename);

    if (imageUrl) {
      const success = await downloadAndConvertToWebP(
        imageUrl,
        task.filename,
        outputDir
      );

      results.push({
        name: task.name,
        filename: task.filename,
        success,
      });

      if (success) {
        console.log(
          `✅ [${i + 1}/${missingImages.length}] 成功: ${task.filename}.webp`
        );
      }
    } else {
      results.push({
        name: task.name,
        filename: task.filename,
        success: false,
      });
      console.log(`❌ [${i + 1}/${missingImages.length}] 失败: ${task.name}`);
    }

    // 添加延迟避免 API 限流
    if (i < missingImages.length - 1) {
      console.log('\n⏳ 等待 3 秒...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
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
      console.log(`   - ${r.filename}.webp (${r.name})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ 失败的图片:');
    failed.forEach((r) => {
      console.log(`   - ${r.name}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 更新 JSON 文件中的图片引用
  if (successful.length > 0) {
    console.log('📝 更新 en.json 中的图片引用...');
    const enJsonPath = path.join(
      process.cwd(),
      'messages/pages/aramaic-translator/en.json'
    );

    try {
      const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));

      successful.forEach((result) => {
        const task = missingImages.find((t) => t.filename === result.filename);
        if (!task) return;

        const imagePath = `/images/docs/${result.filename}.webp`;

        if (task.section === 'whatIs') {
          enJson.AramaicTranslatorPage.whatIs.image = imagePath;
          console.log(`✅ 更新 whatIs 图片: ${imagePath}`);
        } else if (task.section === 'funFacts') {
          const index = task.name === 'Fun Fact 2' ? 1 : 0;
          if (enJson.AramaicTranslatorPage.funFacts.items[index]) {
            enJson.AramaicTranslatorPage.funFacts.items[index].image =
              imagePath;
            console.log(`✅ 更新 funFacts[${index}] 图片: ${imagePath}`);
          }
        } else if (task.section.startsWith('userInterest')) {
          const index = Number.parseInt(task.section.split('-')[1]) - 1;
          if (enJson.AramaicTranslatorPage.userInterest.items[index]) {
            enJson.AramaicTranslatorPage.userInterest.items[index].image =
              imagePath;
            console.log(`✅ 更新 userInterest[${index}] 图片: ${imagePath}`);
          }
        }
      });

      fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2));
      console.log('✅ en.json 更新完成\n');

      // 同步到 zh.json
      const zhJsonPath = enJsonPath.replace('/en.json', '/zh.json');
      fs.writeFileSync(zhJsonPath, JSON.stringify(enJson, null, 2));
      console.log('✅ zh.json 同步完成\n');
    } catch (error) {
      console.error('❌ 更新 JSON 文件失败:', error);
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(console.error);
