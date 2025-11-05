import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 需要检查的波兰语翻译器图片
const polishImages = [
  'polish-translation-grammar.webp',
  'polish-translation-challenge.webp',
  'polish-grammar-insights.webp',
  'polish-contextual-examples.webp',
  'polish-professional-modes.webp',
  'polish-voice-translator.webp',
  'what-is-english-to-polish-translator.webp',
  'english-to-polish-translator-how-to.webp',
];

const imageDir = 'public/images/docs';

async function checkAndCropImages() {
  console.log('检查波兰语翻译器图片尺寸...');

  for (const imageName of polishImages) {
    const imagePath = path.join(imageDir, imageName);

    if (!fs.existsSync(imagePath)) {
      console.log(`图片不存在: ${imageName}`);
      continue;
    }

    try {
      const metadata = await sharp(imagePath).metadata();
      const width = metadata.width;
      const height = metadata.height;
      const aspectRatio = width / height;

      console.log(
        `${imageName}: ${width}x${height}, 比例: ${aspectRatio.toFixed(2)}`
      );

      // 检查是否是 1:1 比例（允许小误差）
      if (Math.abs(aspectRatio - 1) < 0.01) {
        console.log(`发现 1:1 图片: ${imageName}`);

        // 计算剪裁为 4:3 的尺寸
        const newHeight = Math.round((width * 3) / 4);

        console.log(`将剪裁为: ${width}x${newHeight} (4:3)`);

        // 创建备份
        const backupPath = imagePath.replace('.webp', '.backup.webp');
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(imagePath, backupPath);
          console.log(`已创建备份: ${backupPath}`);
        }

        // 剪裁图片 - 从顶部开始，保持宽度，调整高度为 4:3
        await sharp(imagePath)
          .extract({
            left: 0,
            top: 0,
            width: width,
            height: newHeight,
          })
          .toFile(imagePath.replace('.webp', '.temp.webp'));

        // 替换原文件
        fs.renameSync(imagePath.replace('.webp', '.temp.webp'), imagePath);

        console.log(`已剪裁: ${imageName}`);
      } else if (Math.abs(aspectRatio - 4 / 3) < 0.01) {
        console.log(`${imageName} 已经是 4:3 比例`);
      } else {
        console.log(`${imageName} 比例不是 1:1 或 4:3，跳过`);
      }
    } catch (error) {
      console.error(`处理 ${imageName} 时出错:`, error);
    }

    console.log('---');
  }

  console.log('图片检查和剪裁完成！');
}

checkAndCropImages().catch(console.error);
