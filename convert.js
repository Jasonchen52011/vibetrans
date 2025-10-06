const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public/avatars');
const outputDir = inputDir;

async function compressAvatar(inputPath, outputPath, quality = 80) {
  try {
    await sharp(inputPath)
      .resize(48, 48, { fit: 'cover' })
      .webp({ quality })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✓ ${path.basename(outputPath)}: ${sizeKB} KB`);

    if (stats.size > 20 * 1024) {
      const newQuality = Math.max(quality - 10, 50);
      console.log(`  文件过大(${sizeKB}KB),降低质量至 ${newQuality}...`);
      fs.unlinkSync(outputPath);
      await compressAvatar(inputPath, outputPath, newQuality);
    }

    return { success: true, size: sizeKB };
  } catch (error) {
    console.error(`✗ 处理 ${inputPath} 失败:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('开始压缩 avatar 图片...\n');

  const avatarFiles = [
    'user1.png',
    'user2.png',
    'user3.png',
    'user4.png',
    'user5.png',
  ];

  for (const file of avatarFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace('.png', '.webp'));
    await compressAvatar(inputPath, outputPath);
  }

  console.log('\n压缩完成!');
}

main();
