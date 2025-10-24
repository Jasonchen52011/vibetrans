#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

console.log('🔍 正在扫描图片文件...');

// 获取所有图片文件
const imageFiles = execSync(
  `find "${PROJECT_ROOT}/public/images" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" -o -name "*.svg" -o -name "*.ico" \\)`,
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((filePath) => {
    const relativePath = filePath.replace(PROJECT_ROOT, '');
    const webpPath = relativePath.startsWith('/public/')
      ? relativePath.replace('/public/', '/')
      : relativePath;
    const stats = fs.statSync(filePath);

    return {
      fullPath: filePath,
      relativePath,
      webpPath,
      size: stats.size,
      modifiedTime: stats.mtime,
      name: path.basename(filePath),
    };
  });

console.log(`   找到 ${imageFiles.length} 个图片文件`);

console.log('🔍 正在分析图片引用...');

// 分析每个图片文件的引用情况
const results = imageFiles.map((imageFile) => {
  const imageName = path.basename(imageFile.name, path.extname(imageFile.name));
  const webpName = path.basename(imageFile.name, '.webp');

  // 多种搜索模式
  const searchPatterns = [
    // 完整路径搜索
    `"${imageFile.webpPath}"`,
    `'/images/${imageFile.webpPath.replace('/images/', '')}'`,
    `"/images/${imageFile.webpPath.replace('/images/', '')}"`,
    // 文件名搜索
    `"${imageFile.name}"`,
    `'${imageFile.name}'`,
    `"${imageName}"`,
    `'${imageName}'`,
    `"${webpName}"`,
    `'${webpName}'`,
  ];

  let totalMatches = 0;
  const referencedBy = [];

  for (const pattern of searchPatterns) {
    try {
      // 排除特定目录的搜索
      const command = `grep -r "${pattern}" "${PROJECT_ROOT}/src" "${PROJECT_ROOT}/content" "${PROJECT_ROOT}/messages" "${PROJECT_ROOT}/scripts" 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l`;
      const matches =
        Number.parseInt(execSync(command, { encoding: 'utf8' }).trim()) || 0;

      if (matches > 0) {
        totalMatches += matches;
        // 获取引用的具体文件
        const filesCommand = `grep -r "${pattern}" "${PROJECT_ROOT}/src" "${PROJECT_ROOT}/content" "${PROJECT_ROOT}/messages" "${PROJECT_ROOT}/scripts" 2>/dev/null | grep -v node_modules | grep -v ".git" | cut -d: -f1 | sort | uniq`;
        const files = execSync(filesCommand, { encoding: 'utf8' })
          .trim()
          .split('\n')
          .filter(Boolean);

        referencedBy.push(...files);
      }
    } catch (error) {
      // 搜索失败，忽略
    }
  }

  return {
    ...imageFile,
    references: totalMatches,
    referencedBy: [...new Set(referencedBy)], // 去重
  };
});

// 生成报告
console.log('\n' + '='.repeat(80));
console.log('图片文件使用情况报告');
console.log('='.repeat(80));

const totalImages = results.length;
const referencedImages = results.filter((img) => img.references > 0).length;
const unreferencedImages = totalImages - referencedImages;

console.log(`\n📊 统计信息:`);
console.log(`   总图片文件数: ${totalImages}`);
console.log(`   被引用的图片: ${referencedImages}`);
console.log(`   未被引用的图片: ${unreferencedImages}`);
console.log(
  `   引用率: ${((referencedImages / totalImages) * 100).toFixed(1)}%`
);

// 计算大小统计
const totalSize = results.reduce((sum, img) => sum + img.size, 0);
const referencedSize = results
  .filter((img) => img.references > 0)
  .reduce((sum, img) => sum + img.size, 0);
const unreferencedSize = totalSize - referencedSize;

console.log(`\n📦 大小统计:`);
console.log(`   总大小: ${formatBytes(totalSize)}`);
console.log(`   被引用图片大小: ${formatBytes(referencedSize)}`);
console.log(`   未引用图片大小: ${formatBytes(unreferencedSize)}`);

// 未引用的图片
const unreferenced = results
  .filter((img) => img.references === 0)
  .sort((a, b) => b.size - a.size);

if (unreferenced.length > 0) {
  console.log(
    `\n🗑️  可以安全删除的图片文件 (${unreferenced.length} 个, ${formatBytes(unreferencedSize)}):`
  );
  console.log('-'.repeat(80));

  unreferenced.forEach((img, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${img.webpPath}`);
    console.log(`     大小: ${formatBytes(img.size)}`);
    console.log(`     修改时间: ${img.modifiedTime.toLocaleString()}`);
    console.log('');
  });

  console.log('\n🔧 删除命令:');
  console.log('```bash');
  console.log('# 进入项目目录');
  console.log('cd ' + PROJECT_ROOT);
  console.log('');
  console.log('# 删除未引用的图片文件');
  unreferenced.forEach((img) => {
    console.log(`rm "${img.fullPath}"`);
  });
  console.log('```');
}

// 可能过度引用的图片
const overReferenced = results
  .filter((img) => img.references > 15)
  .sort((a, b) => b.references - a.references);

if (overReferenced.length > 0) {
  console.log('\n📋 可能存在问题的引用 (引用次数过多的图片):');
  console.log('-'.repeat(80));

  overReferenced.forEach((img) => {
    console.log(`${img.webpPath} - 被引用 ${img.references} 次`);
    if (img.referencedBy.length > 0) {
      console.log(`  主要引用文件: ${img.referencedBy.slice(0, 3).join(', ')}`);
      if (img.referencedBy.length > 3) {
        console.log(`  ... 等 ${img.referencedBy.length} 个文件`);
      }
    }
    console.log('');
  });
}

// 保存详细报告到文件
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    totalImages,
    referencedImages,
    unreferencedImages,
    totalSize,
    referencedSize,
    unreferencedSize,
  },
  unreferencedImages: unreferenced,
  overReferencedImages: overReferenced,
  allImages: results,
};

fs.writeFileSync(
  path.join(PROJECT_ROOT, 'image-usage-report.json'),
  JSON.stringify(reportData, null, 2)
);

console.log(`\n📄 详细报告已保存到: image-usage-report.json`);
console.log('\n✅ 报告完成');

// 格式化字节数
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  );
}
