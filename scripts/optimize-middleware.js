#!/usr/bin/env node

/**
 * 中间件和工具优化脚本
 * 专门处理可能导致3MB限制的中间件和工具问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始优化中间件和工具...\n');

// 1. 检查中间件大小
console.log('1️⃣ 检查中间件文件...');
const middlewareFiles = ['middleware.ts', 'src/middleware.ts'];

let middlewareSize = 0;
const middlewareIssues = [];

for (const file of middlewareFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeKB = stats.size / 1024;
    middlewareSize += sizeKB;

    console.log(`   📁 ${file}: ${sizeKB.toFixed(2)}KB`);

    // 检查中间件内容
    const content = fs.readFileSync(file, 'utf8');

    // 检查是否有大型的导入
    const importMatches = content.match(/import.*from.*/g);
    if (importMatches && importMatches.length > 10) {
      middlewareIssues.push(`${file} 导入过多 (${importMatches.length} 个)`);
    }

    // 检查是否有复杂的逻辑
    const lines = content
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('//'));
    if (lines.length > 50) {
      middlewareIssues.push(`${file} 代码行数过多 (${lines.length} 行)`);
    }

    // 检查是否有大型常量或配置
    const largeStrings = content.match(/`[^`]{100,}`/g) || [];
    if (largeStrings.length > 0) {
      middlewareIssues.push(
        `${file} 包含大型字符串常量 (${largeStrings.length} 个)`
      );
    }
  }
}

if (middlewareIssues.length > 0) {
  console.log('   ⚠️  发现中间件问题:');
  middlewareIssues.forEach((issue) => console.log(`     - ${issue}`));
} else {
  console.log('   ✅ 中间件文件正常');
}

// 2. 检查工具文件大小
console.log('\n2️⃣ 检查工具和库文件...');
const toolDirs = ['src/lib', 'src/utils', 'src/helpers', 'src/tools'];

const largeToolFiles = [];
let totalToolSize = 0;

for (const dir of toolDirs) {
  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir, { recursive: true })
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      totalToolSize += sizeKB;

      if (sizeKB > 50) {
        // 大于50KB的工具文件
        largeToolFiles.push({ file: path.join(dir, file), size: sizeKB });
      }
    }
  }
}

if (largeToolFiles.length > 0) {
  console.log('   ⚠️  发现大型工具文件:');
  largeToolFiles.forEach(({ file, size }) => {
    console.log(`     - ${file}: ${size.toFixed(2)}KB`);
  });
} else {
  console.log('   ✅ 工具文件大小正常');
}

// 3. 检查配置文件
console.log('\n3️⃣ 检查配置文件...');
const configFiles = [
  'next.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  'package.json',
  'wrangler.toml',
];

const configIssues = [];

for (const file of configFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeKB = stats.size / 1024;
    console.log(`   📁 ${file}: ${sizeKB.toFixed(2)}KB`);

    if (sizeKB > 20) {
      configIssues.push(`${file} 配置文件过大 (${sizeKB.toFixed(2)}KB)`);
    }
  }
}

// 4. 创建优化的webpack配置
console.log('\n4️⃣ 创建优化的构建配置...');
const optimizedWebpackConfig = `
// 针对Cloudflare Pages 3MB限制的优化webpack配置
const webpack = require('webpack');

module.exports = {
  // 基础优化
  mode: 'production',
  devtool: false, // 禁用source maps以减少大小

  optimization: {
    // 启用更多优化
    usedExports: true,
    sideEffects: false,
    minimize: true,

    // 更激进的代码分割
    splitChunks: {
      chunks: 'all',
      maxSize: 50 * 1024, // 50KB最大chunk大小
      minSize: 5 * 1024,  // 5KB最小chunk大小

      cacheGroups: {
        // 分离vendor库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 30 * 1024, // 30KB vendor chunks
        },

        // 分离工具函数
        utils: {
          test: /[\\/]src[\\/]lib[\\/](?!config).*\.ts/,
          name: 'utils',
          chunks: 'all',
          maxSize: 20 * 1024, // 20KB utils chunks
        },

        // 分离配置
        config: {
          test: /[\\/]src[\\/]lib[\\/].*config.*\.ts/,
          name: 'config',
          chunks: 'all',
          maxSize: 15 * 1024, // 15KB config chunks
        },
      },
    },
  },

  // 减少bundle大小
  resolve: {
    alias: {
      // 减少重复导入
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: [
    // 定义环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),

    // 移除不需要的模块
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],

  // 优化输出
  output: {
    filename: (chunkData) => {
      // 更短的文件名
      return chunkData.chunk.name === 'main' ? '[name].js' : '[name].[contenthash:6].js';
    },
  },
};
`;

fs.writeFileSync(
  path.join(__dirname, 'webpack.optimize.js'),
  optimizedWebpackConfig
);
console.log('   ✅ 创建优化webpack配置: scripts/webpack.optimize.js');

// 5. 生成优化建议
console.log('\n5️⃣ 生成优化建议...');
const optimizationReport = {
  middleware: {
    totalSizeKB: middlewareSize,
    issues: middlewareIssues,
    recommendations:
      middlewareIssues.length > 0
        ? [
            '简化中间件逻辑',
            '减少不必要的导入',
            '移除大型常量',
            '使用更轻量级的条件判断',
          ]
        : ['中间件已优化'],
  },

  tools: {
    totalSizeKB: totalToolSize,
    largeFiles: largeToolFiles,
    recommendations:
      largeToolFiles.length > 0
        ? [
            '拆分大型工具文件',
            '使用动态导入',
            '移除未使用的函数',
            '压缩配置数据',
          ]
        : ['工具文件大小合理'],
  },

  config: {
    issues: configIssues,
    recommendations:
      configIssues.length > 0
        ? ['简化配置文件', '移除注释和空行', '使用外部配置']
        : ['配置文件正常'],
  },
};

fs.writeFileSync(
  path.join(__dirname, 'optimization-report.json'),
  JSON.stringify(optimizationReport, null, 2)
);

console.log('   ✅ 生成优化报告: scripts/optimization-report.json');

// 6. 创建自动修复脚本
const autoFixScript = `#!/bin/bash

# 自动修复中间件和工具问题的脚本

echo "🔧 自动修复中间件和工具问题..."

# 1. 压缩中间件文件
echo "压缩中间件文件..."
find . -name "middleware.ts" -exec sed -i '' '/\/\*\*/,/\*\//d' {} \\; 2>/dev/null || true
find . -name "middleware.ts" -exec sed -i '' '/^[[:space:]]*\/\/.*$/d' {} \\; 2>/dev/null || true
find . -name "middleware.ts" -exec sed -i '' '/^$/d' {} \\; 2>/dev/null || true

# 2. 压缩配置文件
echo "压缩配置文件..."
find . -name "*.config.*" -exec sed -i '' '/\/\*\*/,/\*\//d' {} \\; 2>/dev/null || true
find . -name "*.config.*" -exec sed -i '' '/^[[:space:]]*\/\/.*$/d' {} \\; 2>/dev/null || true

# 3. 优化package.json
echo "优化package.json..."
if [ -f package.json ]; then
  # 移除不必要的scripts
  jq 'del(.scripts["test:*"], .scripts["dev:*"])' package.json > package.json.tmp && mv package.json.tmp package.json 2>/dev/null || true
fi

echo "✅ 自动修复完成！"
`;

fs.writeFileSync(path.join(__dirname, 'auto-fix.sh'), autoFixScript);
fs.chmodSync(path.join(__dirname, 'auto-fix.sh'), '755');

console.log('   ✅ 创建自动修复脚本: scripts/auto-fix.sh');

console.log('\n🎉 中间件和工具优化完成！');
console.log('\n📊 优化摘要:');
console.log(`   中间件总大小: ${middlewareSize.toFixed(2)}KB`);
console.log(`   工具文件总大小: ${totalToolSize.toFixed(2)}KB`);
console.log(
  `   发现问题: ${middlewareIssues.length + largeToolFiles.length + configIssues.length} 个`
);

console.log('\n🚀 下一步操作：');
console.log('1. 运行自动修复: ./scripts/auto-fix.sh');
console.log('2. 查看优化报告: cat scripts/optimization-report.json');
console.log('3. 重新构建项目: pnpm build');
