import { captureHowToScreenshot } from '@/lib/article-illustrator/screenshot-helper';

async function regenerateSamoanHowToScreenshot() {
  console.log('开始重新生成萨摩亚语翻译器 How-To 截图...');

  try {
    // 等待几秒钟确保开发服务器完全启动
    console.log('等待开发服务器准备就绪...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const result = await captureHowToScreenshot({
      pageSlug: 'samoan-to-english-translator',
      baseUrl: 'http://localhost:3002',
      viewportWidth: 1920,
      viewportHeight: 1080,
      cropLeft: 150,
      cropRight: 150,
      cropBottom: 100,
      targetSizeKB: 90,
    });

    if (result.filename && result.size > 0) {
      console.log('✅ How-To 截图生成成功!');
      console.log('文件名:', result.filename);
      console.log('文件大小:', result.size, 'KB');

      // 更新 JSON 配置文件
      const fs = await import('fs/promises');
      const path = await import('path');

      const jsonPath = path.join(
        process.cwd(),
        'messages/pages/samoan-to-english-translator/en.json'
      );
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(jsonContent);

      // 更新 whatIs.image 为截图路径
      if (data.SamoanToEnglishTranslatorPage.whatIs) {
        const imagePath = `/images/docs/${result.filename}`;
        data.SamoanToEnglishTranslatorPage.whatIs.image = imagePath;
        console.log('更新 whatIs.image 路径为:', imagePath);
      }

      await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
      console.log('✅ JSON 配置文件已更新');
    } else {
      console.error('❌ How-To 截图生成失败: 未获取到有效结果');
    }
  } catch (error: any) {
    console.error('❌ 生成过程中出现错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 执行重新生成
regenerateSamoanHowToScreenshot()
  .then(() => {
    console.log('How-To 截图重新生成完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('执行失败:', error);
    process.exit(1);
  });
