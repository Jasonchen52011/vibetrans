import path from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

async function captureAlienTextScreenshot() {
  const url = 'http://localhost:3000/alien-text-generator';
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs/alien-text-generator-how-to.webp'
  );
  const tempPngPath = path.join(process.cwd(), 'temp-screenshot.png');

  console.log('启动浏览器...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log(`访问页面: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // 等待页面内容加载完成
    await page.waitForTimeout(3000);

    // 截取第一屏幕（视口大小）
    console.log('截取屏幕截图...');
    await page.screenshot({
      path: tempPngPath,
      fullPage: false, // 只截取第一屏
    });

    console.log('裁剪右侧 150px 并转换为 WebP 格式...');

    // Step 1: 裁剪右侧 150px
    const metadata = await sharp(tempPngPath).metadata();
    const newWidth = (metadata.width || 1920) - 150; // 右侧裁剪 150px
    const croppedBuffer = await sharp(tempPngPath)
      .extract({
        left: 0,
        top: 0,
        width: newWidth,
        height: metadata.height || 1080,
      })
      .toBuffer();

    // Step 2: 调整为 4:3 比例 (800x600)
    const resizedBuffer = await sharp(croppedBuffer)
      .resize(800, 600, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();

    // Step 3: 转换为 WebP 并优化到 90KB
    let quality = 90;
    let fileSize = 0;
    let attempts = 0;
    const targetSize = 90 * 1024; // 90KB
    const tolerance = 5 * 1024; // 5KB 容差

    let minQuality = 75;
    let maxQuality = 100;

    while (attempts < 10) {
      await sharp(resizedBuffer).webp({ quality }).toFile(outputPath);

      const stats = await fs.stat(outputPath);
      fileSize = stats.size;

      console.log(
        `尝试 ${attempts + 1}: quality=${quality}, size=${(fileSize / 1024).toFixed(2)}KB`
      );

      if (
        fileSize >= targetSize - tolerance &&
        fileSize <= targetSize + tolerance
      ) {
        console.log('✅ 文件大小符合要求！');
        break;
      }

      if (fileSize > targetSize + tolerance) {
        maxQuality = quality;
        quality = Math.floor((minQuality + quality) / 2);
      } else {
        minQuality = quality;
        quality = Math.floor((quality + maxQuality) / 2);
      }

      attempts++;

      if (minQuality >= maxQuality - 1) {
        break;
      }
    }

    // 清理临时文件
    await fs.unlink(tempPngPath);

    console.log('\n' + '='.repeat(50));
    console.log('✅ 截图完成！');
    console.log(`📁 文件路径: ${outputPath}`);
    console.log(`📦 文件大小: ${(fileSize / 1024).toFixed(2)}KB`);
    console.log(`🎨 图片尺寸: 800x600 (4:3)`);
    console.log(`⚙️  质量参数: ${quality}`);
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('❌ 发生错误:', error);
    try {
      await fs.unlink(tempPngPath);
    } catch (e) {
      // 忽略清理错误
    }
    throw error;
  } finally {
    await browser.close();
  }
}

captureAlienTextScreenshot().catch(console.error);
