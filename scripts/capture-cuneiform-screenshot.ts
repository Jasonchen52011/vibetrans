import path from 'path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs/promises';

const targetSize = 90 * 1024; // 90KB
const tolerance = 5 * 1024; // ±5KB

async function captureAndProcessScreenshot() {
  const url = 'http://localhost:3000/cuneiform-translator';
  const tempPath = path.join(
    process.cwd(),
    'public/images/docs/temp-cuneiform-screenshot.png'
  );
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs/cuneiform-translator-how-to.webp'
  );

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
    console.log('等待页面完全加载（5秒）...');
    await page.waitForTimeout(5000);

    // 截取第一屏幕
    console.log('截取屏幕截图...');
    await page.screenshot({
      path: tempPath,
      fullPage: false, // 只截取第一屏
    });

    console.log('浏览器截图完成，开始处理图片...');

    // Get image metadata
    const metadata = await sharp(tempPath).metadata();
    const width = metadata.width || 1920;
    const height = metadata.height || 1080;

    console.log(`原始截图尺寸: ${width}x${height}`);

    // Crop 150px from the right
    const croppedWidth = width - 150;

    // Calculate 4:3 ratio dimensions
    const targetHeight = Math.round((croppedWidth * 3) / 4);

    console.log(`裁剪后尺寸: ${croppedWidth}x${height}`);
    console.log(`目标尺寸 (4:3): ${croppedWidth}x${targetHeight}`);

    let quality = 75;
    let size = 0;
    let attempts = 0;
    const maxAttempts = 15;
    let lowQuality = 40;
    let highQuality = 90;

    // Binary search for optimal quality
    while (attempts < maxAttempts) {
      quality = Math.floor((lowQuality + highQuality) / 2);

      await sharp(tempPath)
        .extract({ left: 0, top: 0, width: croppedWidth, height: height })
        .resize(croppedWidth, targetHeight, {
          fit: 'cover',
          position: 'top',
        })
        .webp({ quality })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      size = stats.size;

      console.log(
        `尝试 #${attempts + 1}: quality=${quality}, size=${(size / 1024).toFixed(2)}KB`
      );

      if (size >= targetSize - tolerance && size <= targetSize + tolerance) {
        break;
      }

      if (size > targetSize) {
        highQuality = quality - 1;
      } else {
        lowQuality = quality + 1;
      }

      attempts++;

      if (lowQuality > highQuality) {
        break;
      }
    }

    // Delete temporary file
    await fs.unlink(tempPath);

    console.log('\n=================================');
    console.log('✓ 截图成功保存！');
    console.log(`文件路径: ${outputPath}`);
    console.log(`最终尺寸: ${croppedWidth}x${targetHeight}`);
    console.log(`文件大小: ${(size / 1024).toFixed(2)}KB`);
    console.log('=================================\n');

    return { success: true, path: outputPath, size };
  } catch (error) {
    console.error('截图失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('=== Cuneiform Translator 页面截图工具 ===\n');
  console.log('任务：截取第一屏幕，右侧裁剪150px，4:3比例，~90KB\n');

  const result = await captureAndProcessScreenshot();

  if (result.success) {
    console.log('\n✅ 任务完成！');
  } else {
    console.log(`\n❌ 任务失败: ${result.error}`);
    process.exit(1);
  }
}

main().catch(console.error);
