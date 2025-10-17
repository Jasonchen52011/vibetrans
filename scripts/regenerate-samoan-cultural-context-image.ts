import { generateIllustration } from '@/lib/article-illustrator/image-generator';
import { convertURLToWebP } from '@/lib/article-illustrator/webp-converter';

async function regenerateSamoanCulturalContextImage() {
  console.log('开始重新生成萨摩亚语翻译器 Cultural Context Matters 配图...');

  const imagePrompt = `Create a beautiful illustration showing cultural exchange between Samoan and Western cultures. The image should feature:
- A bridge connecting two cultural islands
- One side with Samoan cultural elements (tropical setting, traditional patterns, ocean waves)
- Other side with Western/English cultural elements
- People communicating and connecting across the bridge
- Warm, inviting colors that represent cultural harmony
- Professional, modern style suitable for a translation app
- No text in the image, just visual storytelling
- High quality, web-optimized format`;

  try {
    console.log('开始生成图片...');
    console.log('图片描述:', imagePrompt);

    const imageResult = await generateIllustration({
      prompt: imagePrompt,
      filename: 'samoan-cultural-context-matters'
    });

    if (imageResult.url) {
      console.log('✅ 图片生成成功!');
      console.log('图片URL:', imageResult.url);
      console.log('使用的模型:', imageResult.modelUsed);

      // 转换为 WebP 格式
      console.log('转换为 WebP 格式...');
      const webpResult = await convertURLToWebP(imageResult.url, {
        filename: 'samoan-cultural-context-matters'
      });

      if (webpResult.success) {
        const imagePath = `/images/docs/${webpResult.filename}`;
        console.log('✅ WebP 转换成功!');
        console.log('图片路径:', imagePath);
        console.log('文件大小:', webpResult.size, 'KB');

        // 更新 JSON 配置文件中的图片路径
        const fs = await import('fs/promises');
        const path = await import('path');

        const jsonPath = path.join(process.cwd(), 'messages/pages/samoan-to-english-translator/en.json');
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);

        // 更新 userInterest.items.0.image
        if (data.SamoanToEnglishTranslatorPage.userInterest.items['0']) {
          data.SamoanToEnglishTranslatorPage.userInterest.items['0'].image = imagePath;
          console.log('更新 JSON 配置文件中的图片路径为:', imagePath);
        }

        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
        console.log('✅ JSON 配置文件已更新');

      } else {
        console.error('❌ WebP 转换失败:', webpResult.error);
      }

    } else {
      console.error('❌ 图片生成失败: 未获取到图片URL');
    }

  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error);
  }
}

// 执行重新生成
regenerateSamoanCulturalContextImage().then(() => {
  console.log('Cultural Context Matters 图片重新生成完成!');
  process.exit(0);
}).catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});