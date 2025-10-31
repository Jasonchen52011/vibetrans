#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

// 从命令行参数获取翻译器名称
const translatorName = process.argv[2];

if (!translatorName) {
  console.error('❌ 请提供翻译器名称作为参数');
  console.log(
    '用法: pnpm tsx scripts/capture-howto-screenshot.ts <translator-name>'
  );
  process.exit(1);
}

async function captureHowToScreenshot() {
  console.log(`📸 开始生成 ${translatorName} 首页截图...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1200, height: 800 });

    // 访问页面
    const url = `http://localhost:3001/${translatorName}`;
    console.log(`🌐 正在访问: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // 等待页面完全加载
    console.log('⏳ 等待页面完全加载...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 检查页面是否有内容
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasContent: document.body.innerText.length > 100,
        contentLength: document.body.innerText.length,
        bodyHeight: document.body.scrollHeight,
      };
    });

    console.log('📄 页面信息:', pageContent);

    if (!pageContent.hasContent) {
      console.log('⚠️  页面内容可能为空，尝试等待更长时间...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // 尝试截取页面首屏（不是完整页面）
    console.log('📸 开始截图首屏...');
    let screenshot = await page.screenshot({
      type: 'webp',
      quality: 90,
      fullPage: false,
    });

    if (!screenshot || screenshot.length === 0) {
      throw new Error('截图生成失败，返回空数据');
    }

    // 获取文件大小
    let currentSize = screenshot.length / 1024;
    console.log(`📊 初始文件大小: ${currentSize.toFixed(2)}KB`);

    // 如果文件大于90KB，尝试降低质量重新截图
    if (currentSize > 90) {
      console.log('🔄 文件大小超过90KB，尝试压缩...');

      // 从最低质量开始尝试，找到满足90KB要求的最高质量
      let bestScreenshot = screenshot;
      let bestQuality = 90;
      let found = false;

      for (let quality = 90; quality >= 10; quality -= 10) {
        const tempScreenshot = await page.screenshot({
          type: 'webp',
          quality: quality,
          fullPage: false,
        });

        const tempSize = tempScreenshot.length / 1024;
        console.log(`🎯 质量 ${quality}: ${tempSize.toFixed(2)}KB`);

        if (tempSize <= 90 && !found) {
          bestScreenshot = tempScreenshot;
          bestQuality = quality;
          found = true;
          console.log(`✅ 找到合适质量: ${quality}`);
        }
      }

      if (!found) {
        console.log('⚠️  无法压缩到90KB以下，使用最低质量');
        // 使用质量1
        bestScreenshot = await page.screenshot({
          type: 'webp',
          quality: 1,
          fullPage: false,
        });
        bestQuality = 1;
      }

      screenshot = bestScreenshot;
      currentSize = screenshot.length / 1024;
      console.log(
        `✅ 最终文件大小: ${currentSize.toFixed(2)}KB (质量: ${bestQuality})`
      );
    }

    // 保存截图
    const outputPath = path.join(
      process.cwd(),
      'public',
      'images',
      'docs',
      `${translatorName}-how-to.webp`
    );

    await fs.writeFile(outputPath, screenshot);

    console.log(`✅ 首页截图已保存: ${outputPath}`);
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
    console.log(`\n🎉 ${translatorName} 首页截图生成完成！`);
  } catch (error) {
    console.error(`\n❌ ${translatorName} 首页截图生成失败:`, error);
    process.exit(1);
  }
}

main();
