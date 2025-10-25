#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取现有翻译器列表
function getExistingTranslators() {
  const translatorDirs = [
    'al-bhed-translator',
    'ancient-greek-translator',
    'aramaic-translator',
    'baby-translator',
    'bad-translator',
    'baybayin-translator',
    'cantonese-translator',
    'chinese-to-english-translator',
    'creole-to-english-translator',
    'cuneiform-translator',
    'dog-translator',
    'drow-translator',
    'english-to-amharic-translator',
    'english-to-chinese-translator',
    'english-to-persian-translator',
    'english-to-polish-translator',
    'english-to-swahili-translator',
    'esperanto-translator',
    'gaster-translator',
    'gen-alpha-translator',
    'gen-z-translator',
    'gibberish-translator',
    'greek-translator',
    'high-valyrian-translator',
    'ivr-translator',
    'japanese-to-english-translator',
    'mandalorian-translator',
    'manga-translator',
    'middle-english-translator',
    'minion-translator',
    'nahuatl-translator',
    'ogham-translator',
    'pig-latin-translator',
    'rune-translator',
    'runic-translator',
    'samoan-to-english-translator',
    'swahili-to-english-translator',
    'telugu-to-english-translator',
    'wingdings-translator',
    'yoda-translator'
  ];

  return new Set(translatorDirs);
}

// 获取所有图片文件
function getAllImages() {
  const imagesDir = '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs';
  const files = fs.readdirSync(imagesDir);
  return files.filter(file => file.endsWith('.webp'));
}

// 分析图片属于哪个翻译器
function analyzeImageTranslators(images, existingTranslators) {
  const translatorImages = {};
  const orphanedImages = [];
  const genericImages = [];

  images.forEach(image => {
    // 检查是否是不存在的工具/翻译器的图片
    if (image.startsWith('albanian-to-english') ||
        image.startsWith('verbose-generator') ||
        image.startsWith('alien-text') ||
        (image.startsWith('what-is-') && (
          image.includes('albanian-to-english') ||
          image.includes('verbose-generator') ||
          image.includes('alien-text-generator')
        ))) {
      orphanedImages.push(image);
      return;
    }

    // 检查是否是通用图片
    if (isGenericImage(image)) {
      genericImages.push(image);
      return;
    }

    // 尝试匹配翻译器
    let matchedTranslator = null;

    // 精确匹配
    for (const translator of existingTranslators) {
      const baseName = translator.replace('-translator', '');
      if (image.startsWith(baseName)) {
        matchedTranslator = translator;
        break;
      }
    }

    if (matchedTranslator && existingTranslators.has(matchedTranslator)) {
      if (!translatorImages[matchedTranslator]) {
        translatorImages[matchedTranslator] = [];
      }
      translatorImages[matchedTranslator].push(image);
    } else {
      // 检查是否属于不存在的翻译器
      const baseName = extractBaseName(image);
      if (baseName && !existingTranslators.has(baseName + '-translator')) {
        orphanedImages.push(image);
      } else {
        genericImages.push(image);
      }
    }
  });

  return { translatorImages, orphanedImages, genericImages };
}

// 判断是否为通用图片
function isGenericImage(image) {
  const genericPatterns = [
    /^--help/,
    /^accessibility/,
    /^ai-/,
    /^brand-/,
    /^bridge-/,
    /^business-/,
    /^coffee-/,
    /^comic-/,
    /^creative-/,
    /^culture-/,
    /^data-/,
    /^docs-/,
    /^family-/,
    /^fax/,
    /^final-fantasy/,
    /^font-/,
    /^food-/,
    /^friends-/,
    /^fun-/,
    /^global-/,
    /^grammar-/,
    /^ideas-/,
    /^idiom-/,
    /^jargon-/,
    /^kids-/,
    /^language-/,
    /^law-/,
    /^learn/,
    /^legal-/,
    /^lightbulb-/,
    /^menu-/,
    /^mobile-/,
    /^monk-/,
    /^multi-/,
    /^name-/,
    /^offline-/,
    /^owl-/,
    /^perfect-/,
    /^person-/,
    /^pet-/,
    /^phone-/,
    /^privacy-/,
    /^product-/,
    /^real-/,
    /^refuel-/,
    /^research-/,
    /^rizz/,
    /^script-/,
    /^secret-/,
    /^shield-/,
    /^simplify-/,
    /^skibidi/,
    /^slang-/,
    /^social-/,
    /^sound-/,
    /^speaker-/,
    /^speech-/,
    /^spelling-/,
    /^stay-/,
    /^sword-/,
    /^symbols/,
    /^tech-/,
    /^text-/,
    /^the-/,
    /^tone-/,
    /^transformer-/,
    /^translate-/,
    /^translation-/,
    /^trav-/,
    /^undefined/,
    /^understanding-/,
    /^unicode-/,
    /^valyrian/,
    /^verbose/,
    /^voice-/,
    /^why-/,
    /^word-/,
    /^world-/,
    /^yogh/,
    /^zalgo/
  ];

  return genericPatterns.some(pattern => pattern.test(image));
}

// 提取基础名称
function extractBaseName(image) {
  const patterns = [
    /^(al-bhed-translator)/,
    /^(albanian-to-english)/,
    /^(ancient-greek-translator)/,
    /^(aramaic-translator)/,
    /^(baby-translator)/,
    /^(bad-translator)/,
    /^(baybayin-translator)/,
    /^(cantonese-translator)/,
    /^(chinese-to-english-translator)/,
    /^(creole-to-english-translator)/,
    /^(cuneiform-translator)/,
    /^(dog-translator)/,
    /^(drow-translator)/,
    /^(english-to-chinese-translator)/,
    /^(english-to-persian-translator)/,
    /^(english-to-polish-translator)/,
    /^(esperanto-translator)/,
    /^(gaster-translator)/,
    /^(gen-alpha-translator)/,
    /^(gen-z-translator)/,
    /^(gibberish-translator)/,
    /^(high-valyrian-translator)/,
    /^(ivr-translator)/,
    /^(japanese-to-english-translator)/,
    /^(mandalorian-translator)/,
    /^(manga-translator)/,
    /^(middle-english-translator)/,
    /^(minion-translator)/,
    /^(nahuatl-translator)/,
    /^(ogham-translator)/,
    /^(pig-latin-translator)/,
    /^(rune-translator)/,
    /^(samoan-to-english-translator)/,
    /^(telugu-to-english-translator)/,
    /^(wingdings-translator)/,
    /^(yoda-translator)/,
    /^(greek-translator)/,
    /^(alien-text-generator)/,
    /^(verbose-generator)/
  ];

  for (const pattern of patterns) {
    const match = image.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// 计算文件大小
function getFileSize(files) {
  const imagesDir = '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs';
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  return totalSize;
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 主函数
function main() {
  console.log('🔍 分析图片使用情况...\n');

  const existingTranslators = getExistingTranslators();
  const allImages = getAllImages();

  console.log(`📊 统计信息:`);
  console.log(`- 现有翻译器数量: ${existingTranslators.size}`);
  console.log(`- 图片文件总数: ${allImages.length}`);

  const { translatorImages, orphanedImages, genericImages } = analyzeImageTranslators(allImages, existingTranslators);

  console.log(`\n📁 分类结果:`);
  console.log(`- 有对应翻译器的图片: ${Object.values(translatorImages).flat().length}`);
  console.log(`- 无对应翻译器的图片: ${orphanedImages.length}`);
  console.log(`- 通用图片: ${genericImages.length}`);

  console.log(`\n🗑️ 可以安全删除的图片 (${orphanedImages.length} 个):`);
  const orphanedSize = getFileSize(orphanedImages);
  console.log(`总大小: ${formatSize(orphanedSize)}`);

  if (orphanedImages.length > 0) {
    console.log('\n详细列表:');
    orphanedImages.forEach((image, index) => {
      console.log(`${index + 1}. ${image}`);
    });
  }

  console.log(`\n💡 建议:`);
  console.log(`1. 删除 ${orphanedImages.length} 个无对应翻译器的图片，可节省 ${formatSize(orphanedSize)} 空间`);
  console.log(`2. 保留 ${genericImages.length} 个通用图片，可能被其他页面复用`);
  console.log(`3. 保留 ${Object.values(translatorImages).flat().length} 个有对应翻译器的图片`);

  // 生成删除命令
  if (orphanedImages.length > 0) {
    console.log(`\n🔧 删除命令:`);
    console.log(`cd /Users/jason-chen/Downloads/project/vibetrans/public/images/docs`);
    orphanedImages.forEach(image => {
      console.log(`rm "${image}"`);
    });
  }
}

main();