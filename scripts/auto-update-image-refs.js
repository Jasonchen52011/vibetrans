#!/usr/bin/env node

/**
 * 🖼️ 自动更新图片引用到 en.json
 *
 * 作用：扫描 public/images/docs/ 目录中的图片，
 * 自动将图片路径写入对应的 messages/pages/{slug}/en.json 文件
 *
 * 使用方法：
 * node scripts/auto-update-image-refs.js "albanian-to-english"
 * 或
 * pnpm tsx scripts/auto-update-image-refs.js "albanian-to-english"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * 扫描图片目录，找出对应 slug 的所有图片
 */
async function scanImages(slug) {
  const imagesDir = path.join(ROOT_DIR, 'public', 'images', 'docs');

  try {
    const files = await fs.readdir(imagesDir);

    // 过滤出属于这个 slug 的图片
    const images = {
      whatIs: null,
      howTo: null,
      funFacts: [],
      userInterests: [],
    };

    for (const file of files) {
      if (!file.endsWith('.webp')) continue;

      // What Is 图片
      if (file === `what-is-${slug}.webp`) {
        images.whatIs = `/images/docs/${file}`;
      }

      // How To 图片
      if (file === `${slug}-how-to.webp`) {
        images.howTo = `/images/docs/${file}`;
      }

      // Fun Facts 图片 (fact-1, fact-2)
      const factMatch = file.match(new RegExp(`${slug}-fact-(\\d+)\\.webp`));
      if (factMatch) {
        const index = Number.parseInt(factMatch[1]) - 1;
        images.funFacts[index] = `/images/docs/${file}`;
      }

      // User Interest 图片 (interest-1, interest-2, interest-3, interest-4)
      const interestMatch = file.match(
        new RegExp(`${slug}-interest-(\\d+)\\.webp`)
      );
      if (interestMatch) {
        const index = Number.parseInt(interestMatch[1]) - 1;
        images.userInterests[index] = `/images/docs/${file}`;
      }
    }

    return images;
  } catch (error) {
    logError(`扫描图片目录失败: ${error.message}`);
    throw error;
  }
}

/**
 * 更新 en.json 中的图片引用
 */
async function updateEnJson(slug, images) {
  const enPath = path.join(ROOT_DIR, 'messages', 'pages', slug, 'en.json');

  try {
    // 读取现有的 en.json
    const content = await fs.readFile(enPath, 'utf-8');
    const jsonData = JSON.parse(content);

    // 获取页面命名空间
    const pageName =
      slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Page';

    if (!jsonData[pageName]) {
      logError(`未找到 ${pageName} 命名空间`);
      return { success: false, updated: 0 };
    }

    let updated = 0;

    // 1. 更新 whatIs 图片
    if (images.whatIs) {
      if (!jsonData[pageName].whatIs) {
        jsonData[pageName].whatIs = {};
      }
      jsonData[pageName].whatIs.image = images.whatIs;
      jsonData[pageName].whatIs.imageAlt =
        `What is ${slug} - Visual explanation`;
      updated++;
      logSuccess(`✓ 更新 whatIs 图片: ${images.whatIs}`);
    }

    // 2. 更新 howto 图片
    if (images.howTo) {
      if (!jsonData[pageName].howto) {
        jsonData[pageName].howto = {};
      }
      jsonData[pageName].howto.image = images.howTo;
      jsonData[pageName].howto.imageAlt =
        `How to use ${slug} - Step by step guide`;
      updated++;
      logSuccess(`✓ 更新 howto 图片: ${images.howTo}`);
    }

    // 3. 更新 funFacts 图片
    if (jsonData[pageName].funFacts && jsonData[pageName].funFacts.items) {
      images.funFacts.forEach((imagePath, index) => {
        if (imagePath && jsonData[pageName].funFacts.items[index]) {
          jsonData[pageName].funFacts.items[index].image = imagePath;
          jsonData[pageName].funFacts.items[index].imageAlt =
            jsonData[pageName].funFacts.items[index].title ||
            `Fun fact ${index + 1}`;
          updated++;
          logSuccess(`✓ 更新 funFacts[${index}] 图片: ${imagePath}`);
        }
      });
    }

    // 4. 更新 userInterest 图片
    if (
      jsonData[pageName].userInterest &&
      jsonData[pageName].userInterest.items
    ) {
      images.userInterests.forEach((imagePath, index) => {
        if (imagePath && jsonData[pageName].userInterest.items[index]) {
          jsonData[pageName].userInterest.items[index].image = imagePath;
          jsonData[pageName].userInterest.items[index].imageAlt =
            jsonData[pageName].userInterest.items[index].title ||
            `User interest ${index + 1}`;
          updated++;
          logSuccess(`✓ 更新 userInterest[${index}] 图片: ${imagePath}`);
        }
      });
    }

    // 5. 同时更新 userScenarios（如果存在，用于兼容旧页面）
    if (
      jsonData[pageName].userScenarios &&
      jsonData[pageName].userScenarios.items
    ) {
      images.funFacts.forEach((imagePath, index) => {
        if (imagePath && jsonData[pageName].userScenarios.items[index]) {
          jsonData[pageName].userScenarios.items[index].image = imagePath;
          jsonData[pageName].userScenarios.items[index].imageAlt =
            jsonData[pageName].userScenarios.items[index].title ||
            `User scenario ${index + 1}`;
          updated++;
          logSuccess(`✓ 更新 userScenarios[${index}] 图片: ${imagePath}`);
        }
      });
    }

    // 保存更新后的 en.json
    await fs.writeFile(enPath, JSON.stringify(jsonData, null, 2));

    return { success: true, updated };
  } catch (error) {
    logError(`更新 en.json 失败: ${error.message}`);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  const slug = process.argv[2];

  if (!slug) {
    logError('请提供 slug 参数');
    logInfo(
      '使用方法: node scripts/auto-update-image-refs.js "albanian-to-english"'
    );
    process.exit(1);
  }

  log('\n🖼️  自动更新图片引用', 'bright');
  logInfo(`Slug: ${slug}`);
  logInfo(`扫描目录: public/images/docs/`);
  logInfo(`目标文件: messages/pages/${slug}/en.json\n`);

  try {
    // 1. 扫描图片
    logInfo('扫描图片...');
    const images = await scanImages(slug);

    logInfo('\n找到的图片:');
    if (images.whatIs) logInfo(`  - What Is: ${images.whatIs}`);
    if (images.howTo) logInfo(`  - How To: ${images.howTo}`);
    images.funFacts.forEach((img, i) => {
      if (img) logInfo(`  - Fun Fact ${i + 1}: ${img}`);
    });
    images.userInterests.forEach((img, i) => {
      if (img) logInfo(`  - User Interest ${i + 1}: ${img}`);
    });

    // 统计找到的图片数量
    const totalImages =
      (images.whatIs ? 1 : 0) +
      (images.howTo ? 1 : 0) +
      images.funFacts.filter(Boolean).length +
      images.userInterests.filter(Boolean).length;

    if (totalImages === 0) {
      logWarning('\n未找到任何图片！');
      logInfo(`请确认图片文件名格式正确，例如：`);
      logInfo(`  - what-is-${slug}.webp`);
      logInfo(`  - ${slug}-how-to.webp`);
      logInfo(`  - ${slug}-fact-1.webp`);
      logInfo(`  - ${slug}-interest-1.webp`);
      process.exit(1);
    }

    logSuccess(`\n找到 ${totalImages} 张图片\n`);

    // 2. 更新 en.json
    logInfo('更新 en.json...\n');
    const result = await updateEnJson(slug, images);

    if (result.success) {
      log('\n' + '='.repeat(60), 'green');
      log('🎉 图片引用更新完成！', 'green');
      log('='.repeat(60), 'green');
      logSuccess(`\n成功更新 ${result.updated} 个图片引用`);
      logInfo(`文件路径: messages/pages/${slug}/en.json`);
      logInfo('\n建议: 运行 pnpm dev 查看效果');
    } else {
      logError('\n更新失败，请查看错误信息');
      process.exit(1);
    }
  } catch (error) {
    logError(`\n执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行主函数
main();
