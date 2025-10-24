#!/usr/bin/env npx tsx

/**
 * 使用KIE.AI生成Rune Translator的新图片
 * 使用Seedream 4.0引擎生成高质量图片
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import * as kieModule from '../src/lib/kie-text-to-image';

// 配置
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'images', 'docs');

// 图片生成配置
const imageConfigs = [
  // Fun Facts 图片
  {
    prompt:
      'Viking runes carved into ancient stone tablet, glowing with mystical blue energy, forest background, fantasy art style, highly detailed, dramatic lighting, epic atmosphere',
    filename: 'rune-ancient-carving-mystical.webp',
    type: 'funFact',
  },
  {
    prompt:
      'Norse warrior reading runes by campfire, ancient scroll with Elder Futhark symbols, warm firelight, dramatic atmosphere, digital painting, cinematic, historical fantasy',
    filename: 'rune-warrior-campfire-reading.webp',
    type: 'funFact',
  },
  // User Interest 图片
  {
    prompt:
      'Modern cosplayer with glowing rune accessories, fantasy costume convention, colorful lights, enthusiastic fans, event photography, vibrant, contemporary fantasy',
    filename: 'rune-cosplay-convention-modern.webp',
    type: 'userInterest',
  },
  {
    prompt:
      'Tabletop gaming session with RPG dice and rune cards, friends playing Dungeons & Dragons, cozy room with fantasy decor, warm lighting, friendly atmosphere, social gaming',
    filename: 'rune-tabletop-gaming-friends.webp',
    type: 'userInterest',
  },
  {
    prompt:
      'Digital artists collaborating on rune designs, modern studio with computers, creative workspace, team brainstorming, professional environment, bright lighting, artistic collaboration',
    filename: 'rune-artists-collaboration-studio.webp',
    type: 'userInterest',
  },
  {
    prompt:
      'Live streamer setup with rune-themed channel branding, professional streaming equipment, RGB lighting, modern gaming setup, content creation, professional streaming environment',
    filename: 'rune-streamer-professional-setup.webp',
    type: 'userInterest',
  },
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

/**
 * 生成单张图片
 */
async function generateSingleImage(
  config: (typeof imageConfigs)[0],
  index: number
) {
  try {
    logInfo(`[${index + 1}/${imageConfigs.length}] 生成: ${config.filename}`);
    logInfo(`  Prompt: ${config.prompt.substring(0, 120)}...`);

    const result = await kieModule.generateImageWithSeedream(config.prompt, {
      imageSize: 'landscape_4_3', // 4:3 aspect ratio
      imageResolution: '2K', // High quality
    });

    // 下载图片到本地
    const response = await fetch(result.url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const outputPath = path.join(OUTPUT_DIR, config.filename);
    await fs.writeFile(outputPath, buffer);

    logSuccess(`  ✓ 已保存: ${config.filename}`);
    return { success: true, filename: config.filename };
  } catch (error) {
    logError(
      `  ✗ 生成失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
    return {
      success: false,
      filename: config.filename,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 主函数
 */
async function main() {
  log('🖼️  使用KIE.AI Seedream 4.0生成Rune Translator新图片', 'bright');
  log('='.repeat(60), 'cyan');

  try {
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    logInfo(`\n📁 输出目录: ${OUTPUT_DIR}`);
    logInfo(`📋 需要生成 ${imageConfigs.length} 张图片\n`);

    let successCount = 0;
    let failCount = 0;

    // 生成所有图片
    for (let i = 0; i < imageConfigs.length; i++) {
      const config = imageConfigs[i];
      const result = await generateSingleImage(config, i);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // 添加延迟避免API限制
      if (i < imageConfigs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 总结
    log('\n' + '='.repeat(60), 'green');
    log('🎉 图片生成完成！', 'green');
    log('='.repeat(60), 'green');

    logSuccess(`✅ 成功生成: ${successCount} 张`);
    if (failCount > 0) {
      logError(`❌ 生成失败: ${failCount} 张`);
    }

    logInfo(`\n📁 所有图片已保存到: ${OUTPUT_DIR}`);
    logInfo('🔄 JSON文件已更新，引用新的图片路径');
    logInfo('🌐 可以在 http://localhost:3001/rune-translator 查看效果');
  } catch (error) {
    logError(
      `\n❌ 执行失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
    console.error(error);
    process.exit(1);
  }
}

// 运行
main();
