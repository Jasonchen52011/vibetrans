#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 项目根目录
const PROJECT_ROOT = __dirname;
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public/images');
const SOURCE_DIRS = ['src', 'content', 'messages', 'scripts'];

// 图片文件扩展名
const IMAGE_EXTENSIONS = [
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
];

// 需要排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

// 收集所有图片文件
function getAllImageFiles() {
  const imageFiles = [];

  function walkDir(dir, relativePath = '') {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // 跳过排除的目录
          if (EXCLUDE_DIRS.includes(file)) {
            continue;
          }
          walkDir(fullPath, path.join(relativePath, file));
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (IMAGE_EXTENSIONS.includes(ext)) {
            const relativeFilePath = path.join(relativePath, file);
            const fileStats = fs.statSync(fullPath);
            imageFiles.push({
              fullPath,
              relativePath: relativeFilePath,
              webpPath: relativeFilePath.replace(/^public\//, '/'),
              size: fileStats.size,
              modifiedTime: fileStats.mtime,
              name: file,
            });
          }
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read directory ${dir}: ${error.message}`
      );
    }
  }

  walkDir(PUBLIC_IMAGES_DIR);
  return imageFiles;
}

// 收集所有源码文件
function getAllSourceFiles() {
  const sourceFiles = [];

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // 跳过排除的目录
          if (EXCLUDE_DIRS.includes(file)) {
            continue;
          }
          walkDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (
            ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx'].includes(ext)
          ) {
            sourceFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read directory ${dir}: ${error.message}`
      );
    }
  }

  for (const sourceDir of SOURCE_DIRS) {
    const fullPath = path.join(PROJECT_ROOT, sourceDir);
    if (fs.existsSync(fullPath)) {
      walkDir(fullPath);
    }
  }

  return sourceFiles;
}

// 检查图片引用
function findImageReferences(imageFiles, sourceFiles) {
  const references = {};

  // 初始化引用计数
  for (const imageFile of imageFiles) {
    references[imageFile.webpPath] = {
      count: 0,
      referencedBy: [],
      patterns: [],
    };
  }

  // 在源码文件中搜索图片引用
  for (const sourceFile of sourceFiles) {
    try {
      const content = fs.readFileSync(sourceFile, 'utf8');

      for (const imageFile of imageFiles) {
        const imageName = path.basename(
          imageFile.name,
          path.extname(imageFile.name)
        );
        const imageWebpName = path.basename(imageFile.name, '.webp');

        // 多种引用模式
        const patterns = [
          new RegExp(`['"]/images/${imageFile.relativePath.replace(/^public\\//, '')}['"]`, 'g'),
          new RegExp(`['"]${imageFile.webpPath}['"]`, 'g'),
          new RegExp(`['"]images/${imageFile.relativePath.replace(/^public\\//, '')}['"]`, 'g'),
          new RegExp(`image:\\s*['"]${imageFile.webpPath}['"]`, 'g'),
          new RegExp(`src:\\s*['"]${imageFile.webpPath}['"]`, 'g'),
          new RegExp(`image:\\s*.*${imageName}['"]`, 'g'),
          new RegExp(`src:\\s*.*${imageName}['"]`, 'g'),
          // 不带扩展名的引用
          new RegExp(`['"]/images/${imageWebpName}['"]`, 'g'),
          new RegExp(`['"]${imageWebpName}['"]`, 'g'),
          // JSON文件中的特殊模式
          new RegExp(`"${imageFile.webpPath}"`, 'g'),
          // 动态构建的路径
          new RegExp(`\\+\\s*['"]${imageName}['"]`, 'g'),
          new RegExp(`\\$\\{[^}]*${imageName}[^}]*\\}`, 'g')
        ];

        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            references[imageFile.webpPath].count += matches.length;
            references[imageFile.webpPath].referencedBy.push({
              file: sourceFile,
              matches: matches.length,
              pattern: pattern.source,
            });
            if (
              !references[imageFile.webpPath].patterns.includes(pattern.source)
            ) {
              references[imageFile.webpPath].patterns.push(pattern.source);
            }
          }
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read file ${sourceFile}: ${error.message}`
      );
    }
  }

  return references;
}

// 生成报告
function generateReport(imageFiles, references) {
  console.log('\n='.repeat(80));
  console.log('图片文件使用情况报告');
  console.log('='.repeat(80));

  const totalImages = imageFiles.length;
  const referencedImages = Object.values(references).filter(
    (ref) => ref.count > 0
  ).length;
  const unreferencedImages = totalImages - referencedImages;

  console.log(`\n📊 统计信息:`);
  console.log(`   总图片文件数: ${totalImages}`);
  console.log(`   被引用的图片: ${referencedImages}`);
  console.log(`   未被引用的图片: ${unreferencedImages}`);
  console.log(
    `   引用率: ${((referencedImages / totalImages) * 100).toFixed(1)}%`
  );

  // 计算总大小
  const totalSize = imageFiles.reduce((sum, img) => sum + img.size, 0);
  const referencedSize = imageFiles
    .filter((img) => references[img.webpPath].count > 0)
    .reduce((sum, img) => sum + img.size, 0);
  const unreferencedSize = totalSize - referencedSize;

  console.log(`\n📦 大小统计:`);
  console.log(`   总大小: ${formatBytes(totalSize)}`);
  console.log(`   被引用图片大小: ${formatBytes(referencedSize)}`);
  console.log(`   未引用图片大小: ${formatBytes(unreferencedSize)}`);

  if (unreferencedImages > 0) {
    console.log(
      `\n🗑️  可以安全删除的图片文件 (${unreferencedImages} 个, ${formatBytes(unreferencedSize)}):`
    );
    console.log('-'.repeat(80));

    const unreferencedList = imageFiles
      .filter((img) => references[img.webpPath].count === 0)
      .sort((a, b) => b.size - a.size);

    unreferencedList.forEach((img, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${img.webpPath}`);
      console.log(`     大小: ${formatBytes(img.size)}`);
      console.log(`     修改时间: ${img.modifiedTime.toLocaleString()}`);
      console.log('');
    });

    console.log('🔧 删除命令 (Linux/macOS):');
    console.log('cd ' + PROJECT_ROOT);
    unreferencedList.forEach((img) => {
      console.log(`rm "${img.fullPath}"`);
    });
  }

  console.log('\n📋 可能存在问题的引用 (引用次数过多的图片):');
  console.log('-'.repeat(80));

  const overReferenced = imageFiles
    .filter((img) => references[img.webpPath].count > 10)
    .sort(
      (a, b) => references[b.webpPath].count - references[a.webpPath].count
    );

  if (overReferenced.length > 0) {
    overReferenced.forEach((img) => {
      const ref = references[img.webpPath];
      console.log(`${img.webpPath} - 被引用 ${ref.count} 次`);
      if (ref.referencedBy.length > 0) {
        console.log(`  主要引用文件: ${ref.referencedBy[0].file}`);
      }
    });
  } else {
    console.log('没有发现过度引用的图片文件。');
  }

  console.log('\n✅ 报告完成');
}

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

// 主函数
function main() {
  console.log('🔍 正在扫描图片文件...');
  const imageFiles = getAllImageFiles();
  console.log(`   找到 ${imageFiles.length} 个图片文件`);

  console.log('🔍 正在扫描源码文件...');
  const sourceFiles = getAllSourceFiles();
  console.log(`   找到 ${sourceFiles.length} 个源码文件`);

  console.log('🔍 正在分析图片引用...');
  const references = findImageReferences(imageFiles, sourceFiles);

  console.log('📊 正在生成报告...');
  generateReport(imageFiles, references);
}

if (require.main === module) {
  main();
}

module.exports = { getAllImageFiles, getAllSourceFiles, findImageReferences };
