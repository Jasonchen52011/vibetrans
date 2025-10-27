#!/usr/bin/env node

/**
 * 构建前清理脚本 - 清理生成内容以减小部署包大小
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理构建内容...');

const projectRoot = process.cwd();
const totalCleaned = { size: 0, files: 0 };

// 清理函数
function cleanDirectory(dirPath, pattern = '*') {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 目录不存在: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      // 匹配模式
      const matchesPattern = pattern === '*' || file.includes(pattern);

      if (matchesPattern) {
        if (stat.isDirectory()) {
          // 递归删除目录
          cleanDirectoryRecursive(filePath);
        } else {
          // 删除文件
          const fileSize = stat.size;
          fs.unlinkSync(filePath);
          console.log(`🗑️  删除文件: ${filePath} (${formatSize(fileSize)})`);
          totalCleaned.size += fileSize;
          totalCleaned.files++;
        }
      }
    });
  } catch (error) {
    console.error(`❌ 清理目录失败 ${dirPath}:`, error.message);
  }
}

function cleanDirectoryRecursive(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        cleanDirectoryRecursive(filePath);
      } else {
        const fileSize = stat.size;
        fs.unlinkSync(filePath);
        console.log(`🗑️  删除文件: ${filePath} (${formatSize(fileSize)})`);
        totalCleaned.size += fileSize;
        totalCleaned.files++;
      }
    });

    // 删除空目录
    fs.rmdirSync(dirPath);
    console.log(`📁 删除目录: ${dirPath}`);
  } catch (error) {
    console.error(`❌ 递归清理失败 ${dirPath}:`, error.message);
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
}

// 清理任务列表
const cleanTasks = [
  {
    name: '清理工具生成目录',
    path: path.join(projectRoot, '.tool-generation'),
    type: 'directory',
  },
  {
    name: '清理中文翻译文件',
    path: path.join(projectRoot, 'messages/tools'),
    pattern: '-zh.json',
    type: 'files',
  },
  {
    name: '清理测试脚本',
    path: path.join(projectRoot, 'scripts'),
    pattern: 'test-',
    type: 'files',
  },
  {
    name: '清理修复脚本',
    path: path.join(projectRoot, 'scripts'),
    pattern: 'fix-',
    type: 'files',
  },
  {
    name: '清理移除脚本',
    path: path.join(projectRoot, 'scripts'),
    pattern: 'remove-',
    type: 'files',
  },
  {
    name: '清理最终脚本',
    path: path.join(projectRoot, 'scripts'),
    pattern: 'final-',
    type: 'files',
  },
  {
    name: '清理备份目录',
    path: path.join(projectRoot, 'backup'),
    type: 'directory',
  },
];

// 执行清理任务
console.log('📋 开始执行清理任务...\n');

cleanTasks.forEach((task) => {
  console.log(`\n🔧 ${task.name}`);

  if (task.type === 'directory' && fs.existsSync(task.path)) {
    cleanDirectoryRecursive(task.path);
  } else if (task.type === 'files') {
    cleanDirectory(task.path, task.pattern);
  }
});

// 总结
console.log('\n✅ 清理完成！');
console.log(`📊 总计删除文件: ${totalCleaned.files} 个`);
console.log(`💾 总计释放空间: ${formatSize(totalCleaned.size)}`);

if (totalCleaned.size > 0) {
  console.log('🚀 部署包已优化，可以开始构建了');
} else {
  console.log('ℹ️  没有找到需要清理的内容');
}
