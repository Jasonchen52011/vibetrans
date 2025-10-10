import path from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

async function captureScreenshot() {
  const url = 'http://localhost:3000/esperanto-translator';
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs/esperanto-translator-how-to.webp'
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
    await page.waitForTimeout(2000);

    // 截取第一屏幕（视口大小）
    console.log('截取屏幕截图...');
    await page.screenshot({
      path: tempPngPath,
      fullPage: false, // 只截取第一屏
    });

    console.log('转换为 WebP 格式并优化大小...');

    // 使用 sharp 转换为 WebP 并优化大小到约 90KB
    let quality = 90; // 初始质量
    let fileSize = 0;
    let attempts = 0;
    const targetSize = 90 * 1024; // 90KB
    const tolerance = 5 * 1024; // 5KB 的容差范围

    // 二分法查找最佳质量参数
    let minQuality = 75;
    let maxQuality = 100;

    while (attempts < 10) {
      await sharp(tempPngPath).webp({ quality }).toFile(outputPath);

      const stats = await fs.stat(outputPath);
      fileSize = stats.size;

      console.log(
        `尝试 ${attempts + 1}: 质量=${quality}, 文件大小=${(fileSize / 1024).toFixed(2)}KB`
      );

      // 检查是否在目标范围内 (85KB - 95KB)
      if (
        fileSize >= targetSize - tolerance &&
        fileSize <= targetSize + tolerance
      ) {
        console.log('✓ 文件大小符合要求！');
        break;
      }

      // 调整质量参数
      if (fileSize > targetSize + tolerance) {
        maxQuality = quality;
        quality = Math.floor((minQuality + quality) / 2);
      } else {
        minQuality = quality;
        quality = Math.floor((quality + maxQuality) / 2);
      }

      attempts++;

      // 避免陷入死循环
      if (minQuality >= maxQuality - 1) {
        break;
      }
    }

    // 清理临时文件
    await fs.unlink(tempPngPath);

    console.log('\n=================================');
    console.log('截图完成！');
    console.log(`文件路径: ${outputPath}`);
    console.log(`文件大小: ${(fileSize / 1024).toFixed(2)}KB`);
    console.log(`最终质量: ${quality}`);
    console.log('=================================\n');
  } catch (error) {
    console.error('发生错误:', error);
    // 清理临时文件
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

captureScreenshot().catch(console.error);
