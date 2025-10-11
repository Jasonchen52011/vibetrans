import path from 'path';
import { chromium } from 'playwright';
import sharp from 'sharp';

async function captureHowToScreenshot() {
  const url = 'http://localhost:3000/en/ivr-translator';
  const tempPath = path.join(
    process.cwd(),
    'public/images/docs/ivr-translator-how-to-temp.png'
  );
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs/ivr-translator-how-to.webp'
  );

  console.log('\n📸 Starting IVR Translator How To section screenshot...\n');
  console.log('🌐 启动浏览器...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log(`🔄 访问页面: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('⏳ 等待页面完全加载（3秒）...');
    await page.waitForTimeout(3000);

    console.log('🔍 查找 How To 部分...');
    const howtoSection = await page.locator('#howto').first();

    if (!(await howtoSection.count())) {
      throw new Error('How To section not found');
    }

    console.log('📸 截取 How To 部分截图...');
    await howtoSection.screenshot({
      path: tempPath,
    });

    console.log('🔄 转换为 WebP 格式...');
    await sharp(tempPath).webp({ quality: 85, effort: 6 }).toFile(outputPath);

    // 删除临时 PNG 文件
    const fs = await import('fs/promises');
    await fs.unlink(tempPath);

    const stats = await fs.stat(outputPath);
    const fileSize = stats.size;

    console.log('\n=================================');
    console.log('✅ 截图完成！');
    console.log(`📁 文件路径: ${outputPath}`);
    console.log(`📊 文件大小: ${(fileSize / 1024).toFixed(2)}KB`);
    console.log('=================================\n');
  } catch (error) {
    console.error('❌ 发生错误:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureHowToScreenshot().catch(console.error);
