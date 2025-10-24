#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';

async function updateDrowImagePaths() {
  console.log('更新Drow翻译器图片路径...');

  const jsonPaths = [
    path.join(process.cwd(), 'messages/pages/drow-translator/en.json'),
    path.join(process.cwd(), 'messages/pages/drow-translator/zh.json'),
  ];

  // 图片文件映射
  const imageMapping = {
    'what-is-drow-translator': '/images/docs/drow-language-bridge.webp',
    'drow-translator-how-to': '/images/docs/drow-translator-how-to.webp',
    'drow-translator-fact-1': '/images/docs/drow-lingo-genesis.webp',
    'drow-translator-fact-2': '/images/docs/language-twister.webp',
  };

  for (const jsonPath of jsonPaths) {
    try {
      console.log(`处理文件: ${path.basename(jsonPath)}`);

      // 读取现有JSON文件
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);

      // 更新各个部分的图片路径
      if (jsonData.DrowTranslatorPage) {
        // 更新 whatIs 图片
        if (jsonData.DrowTranslatorPage.whatIs) {
          jsonData.DrowTranslatorPage.whatIs.image =
            imageMapping['what-is-drow-translator'];
        }

        // 更新 howto 图片
        if (jsonData.DrowTranslatorPage.howto) {
          jsonData.DrowTranslatorPage.howto.image =
            imageMapping['drow-translator-how-to'];
        }

        // 更新 funFacts 图片
        if (
          jsonData.DrowTranslatorPage.funFacts &&
          jsonData.DrowTranslatorPage.funFacts.items
        ) {
          if (jsonData.DrowTranslatorPage.funFacts.items[0]) {
            jsonData.DrowTranslatorPage.funFacts.items[0].image =
              imageMapping['drow-translator-fact-1'];
            jsonData.DrowTranslatorPage.funFacts.items[0].imageAlt =
              'Drow language origins and linguistic influences';
          }
          if (jsonData.DrowTranslatorPage.funFacts.items[1]) {
            jsonData.DrowTranslatorPage.funFacts.items[1].image =
              imageMapping['drow-translator-fact-2'];
            jsonData.DrowTranslatorPage.funFacts.items[1].imageAlt =
              'Drow language structure and grammar features';
          }
        }
      }

      // 保存更新后的JSON
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
      console.log(`✅ 已更新: ${path.basename(jsonPath)}`);
    } catch (error) {
      console.error(`❌ 更新失败 ${path.basename(jsonPath)}:`, error);
    }
  }

  console.log('🎉 Drow翻译器图片路径更新完成！');
}

// 运行更新函数
updateDrowImagePaths().catch(console.error);
