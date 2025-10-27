#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

async function captureHowToScreenshot() {
  console.log('📸 开始生成英中翻译器 How-To 截图...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1200, height: 800 });

    // 访问页面
    const url = 'http://localhost:3001/english-to-chinese-translator';
    console.log(`🌐 正在访问: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 查找 How-To 部分
    const howToSection = await page.$(
      '[data-testid="how-to-section"], .how-to, #how-to'
    );

    if (howToSection) {
      console.log('✅ 找到 How-To 部分');

      // 截图 How-To 部分
      const screenshot = await howToSection.screenshot({
        type: 'webp',
        quality: 90,
        fullPage: false,
      });

      // 保存截图
      const outputPath = path.join(
        process.cwd(),
        'public',
        'images',
        'docs',
        'english-to-chinese-translator-how-to.webp'
      );

      await fs.writeFile(outputPath, screenshot);
      console.log(`✅ How-To 截图已保存: ${outputPath}`);

      // 获取文件大小
      const stats = await fs.stat(outputPath);
      console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)}KB`);
    } else {
      console.log('⚠️  未找到 How-To 部分，尝试截取整个页面...');

      // 截取整个页面
      const screenshot = await page.screenshot({
        type: 'webp',
        quality: 90,
        fullPage: true,
      });

      // 保存截图
      const outputPath = path.join(
        process.cwd(),
        'public',
        'images',
        'docs',
        'english-to-chinese-translator-how-to.webp'
      );

      await fs.writeFile(outputPath, screenshot);
      console.log(`✅ 页面截图已保存: ${outputPath}`);

      // 获取文件大小
      const stats = await fs.stat(outputPath);
      console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)}KB`);
    }
  } catch (error) {
    console.error(
      '❌ 截图失败:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    await captureHowToScreenshot();
    console.log('\n🎉 How-To 截图生成完成！');
  } catch (error) {
    console.error('\n❌ How-To 截图生成失败:', error);
    process.exit(1);
  }
}

main();
