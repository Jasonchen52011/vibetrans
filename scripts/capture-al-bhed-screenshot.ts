import path from 'path';
import { chromium } from 'playwright';

async function captureScreenshot() {
  const url = 'http://localhost:3002/al-bhed-translator';
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs/al-bhed-translator-how-to-original.png'
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

    // 等待页面内容加载完成（至少5秒）
    console.log('等待页面完全加载（5秒）...');
    await page.waitForTimeout(5000);

    // 截取第一屏幕（视口大小）
    console.log('截取屏幕截图...');
    await page.screenshot({
      path: outputPath,
      fullPage: false, // 只截取第一屏
    });

    const fs = await import('fs/promises');
    const stats = await fs.stat(outputPath);
    const fileSize = stats.size;

    console.log('\n=================================');
    console.log('截图完成！');
    console.log(`文件路径: ${outputPath}`);
    console.log(`文件大小: ${(fileSize / 1024).toFixed(2)}KB`);
    console.log('=================================\n');
  } catch (error) {
    console.error('发生错误:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshot().catch(console.error);
