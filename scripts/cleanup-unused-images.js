#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要删除的图片列表
const imagesToDelete = [
  'albanian-to-english-fact-1.webp',
  'albanian-to-english-fact-2.webp',
  'albanian-to-english-how-to.webp',
  'albanian-to-english-interest-1.webp',
  'albanian-to-english-interest-2.webp',
  'albanian-to-english-interest-3.webp',
  'albanian-to-english-interest-4.webp',
  'alien-text-creative-projects.webp',
  'alien-text-generator-how-to.webp',
  'alien-text-social-media.webp',
  'verbose-generator-example-1.webp',
  'verbose-generator-example-2.webp',
  'verbose-generator-example-3.webp',
  'verbose-generator-example-4.webp',
  'verbose-generator-example-5.webp',
  'verbose-generator-example-6.webp',
  'verbose-generator-fact-1.webp',
  'verbose-generator-fact-2.webp',
  'verbose-generator-how-to.webp',
  'verbose-generator-interest-1.webp',
  'verbose-generator-interest-2.webp',
  'verbose-generator-interest-3.webp',
  'verbose-generator-interest-4.webp',
  'what-is-albanian-to-english.webp',
  'what-is-alien-text-generator.webp',
  'what-is-verbose-generator.webp'
];

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function main() {
  const imagesDir = '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs';
  let totalSize = 0;
  let deletedCount = 0;
  let errorCount = 0;

  console.log('🧹 开始清理未使用的图片...\n');

  imagesToDelete.forEach((image, index) => {
    const filePath = path.join(imagesDir, image);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`✅ (${index + 1}/${imagesToDelete.length}) 删除: ${image} (${formatSize(stats.size)})`);
      } catch (error) {
        errorCount++;
        console.log(`❌ (${index + 1}/${imagesToDelete.length}) 删除失败: ${image} - ${error.message}`);
      }
    } else {
      console.log(`⚠️ (${index + 1}/${imagesToDelete.length}) 文件不存在: ${image}`);
    }
  });

  console.log(`\n📊 清理完成统计:`);
  console.log(`- 成功删除: ${deletedCount} 个文件`);
  console.log(`- 删除失败: ${errorCount} 个文件`);
  console.log(`- 释放空间: ${formatSize(totalSize)}`);

  if (errorCount > 0) {
    console.log(`\n⚠️ 有 ${errorCount} 个文件删除失败，请检查权限或文件是否被占用`);
  } else {
    console.log(`\n🎉 清理完成！`);
  }
}

// 如果直接运行此脚本，则执行删除操作
if (require.main === module) {
  main();
}

module.exports = { imagesToDelete };