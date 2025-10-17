import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import { chromium } from 'playwright';

const execAsync = promisify(exec);

async function captureScreenshot() {
  const url = 'http://localhost:3001/albanian-to-english';
  const tempPngPath = path.join(
    process.cwd(),
    'public/images/docs/albanian-to-english-how-to-temp.png'
  );
  const finalWebpPath = path.join(
    process.cwd(),
    'public/images/docs/albanian-to-english-how-to.webp'
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
      path: tempPngPath,
      fullPage: false, // 只截取第一屏
    });

    console.log('裁剪图片（左右各100px，下方100px）...');
    // 原图尺寸 1920x1080
    // 左边裁剪 100px: left = 100
    // 右边裁剪 100px: width = 1920 - 200 = 1720
    // 下边裁剪 100px: height = 1080 - 100 = 980
    await execAsync(
      `npx sharp-cli -i "${tempPngPath}" -o "${path.dirname(finalWebpPath)}/" -f webp -q 85 extract 0 100 1720 980`
    );

    // 删除临时 PNG 文件
    console.log('删除临时 PNG 文件...');
    await unlink(tempPngPath);

    const fs = await import('fs/promises');
    const stats = await fs.stat(finalWebpPath);
    const fileSize = stats.size;

    console.log('\n=================================');
    console.log('截图完成！');
    console.log(`文件路径: ${finalWebpPath}`);
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
