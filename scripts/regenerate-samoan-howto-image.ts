import { generateIllustration } from '@/lib/article-illustrator/image-generator';
import { convertURLToWebP } from '@/lib/article-illustrator/webp-converter';

async function regenerateSamoanHowToImage() {
  console.log('开始重新生成萨摩亚语翻译器 How-To 部分配图...');

  const howToContent = `Get started with these simple steps to use Samoan to English Translator Plus:
1. Enter Your Text: Copy and paste your Samoan text into the input box. You can also upload files directly for bulk translation.
2. Select Translate: Click the translate button and select Samoan to English language pair.
3. Review Your Translation: Check the translated text for accuracy and cultural context.
4. Save or Share: Save your translated content or share it with others.`;

  const imagePrompt = `Create a professional tutorial illustration showing how to use a Samoan to English translation app. The image should feature:
- A step-by-step visual guide with 4 clear steps
- Modern smartphone or tablet screen showing the translation app interface
- Samoan text being converted to English
- Clean, minimalist design with numbered steps (1, 2, 3, 4)
- Arrows or visual flow indicators showing the process
- Professional tech illustration style
- Soft, friendly colors (blues, greens)
- No text in numbers or UI elements, just visual storytelling
- High quality, web-optimized format`;

  try {
    console.log('开始生成图片...');
    console.log('图片描述:', imagePrompt);

    const imageResult = await generateIllustration({
      prompt: imagePrompt,
      filename: 'samoan-translator-howto-guide'
    });

    if (imageResult.url) {
      console.log('✅ 图片生成成功!');
      console.log('图片URL:', imageResult.url);
      console.log('使用的模型:', imageResult.modelUsed);

      // 转换为 WebP 格式
      console.log('转换为 WebP 格式...');
      const webpResult = await convertURLToWebP(imageResult.url, {
        filename: 'samoan-translator-howto-guide'
      });

      if (webpResult.success) {
        const imagePath = `/images/docs/${webpResult.filename}`;
        console.log('✅ WebP 转换成功!');
        console.log('图片路径:', imagePath);
        console.log('文件大小:', webpResult.size, 'KB');

        // 更新 JSON 配置文件中的图片路径 (howto 图片通常在 whatIs.image 字段)
        const fs = await import('fs/promises');
        const path = await import('path');

        const jsonPath = path.join(process.cwd(), 'messages/pages/samoan-to-english-translator/en.json');
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);

        // 更新 howto 相关的图片路径 - 这通常在页面的 howto 部分被引用
        // 我们需要更新 whatIs.image 因为 how-to 通常使用相同的图片
        if (data.SamoanToEnglishTranslatorPage.whatIs) {
          data.SamoanToEnglishTranslatorPage.whatIs.image = imagePath;
          console.log('更新 whatIs.image 路径为:', imagePath);
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
regenerateSamoanHowToImage().then(() => {
  console.log('How-To 部分配图重新生成完成!');
  process.exit(0);
}).catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});