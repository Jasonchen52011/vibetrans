#!/usr/bin/env node

/**
 * 部署过程优化脚本
 * 处理临时文件和部署过程中可能导致的3MB限制问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始优化部署过程...\n');

// 1. 检查当前目录大小和临时文件
console.log('1️⃣ 检查项目目录大小...');
function getDirectorySize(dirPath, exclude = []) {
  let totalSize = 0;
  let files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const relativePath = path.relative(dirPath, itemPath);

      // 检查是否应该排除
      if (exclude.some(pattern => relativePath.includes(pattern))) {
        continue;
      }

      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        traverse(itemPath);
      } else {
        totalSize += stats.size;
        files.push({
          path: relativePath,
          size: stats.size,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
        });
      }
    }
  }

  traverse(dirPath);
  return { totalSize, files };
}

// 检查项目大小
const excludeDirs = ['node_modules', '.git', '.next', 'dist', '.vercel', '.turbo'];
const { totalSize, files } = getDirectorySize('.', excludeDirs);

console.log(`   项目总大小: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
console.log(`   文件总数: ${files.length}`);

// 找出最大的文件
const largeFiles = files
  .filter(f => f.size > 1024 * 1024) // 大于1MB
  .sort((a, b) => b.size - a.size)
  .slice(0, 10);

if (largeFiles.length > 0) {
  console.log('\n   ⚠️  发现大型文件:');
  largeFiles.forEach(file => {
    console.log(`     - ${file.path}: ${file.sizeMB}MB`);
  });
}

// 2. 清理临时文件和缓存
console.log('\n2️⃣ 清理临时文件和缓存...');
const tempDirs = [
  '.next',
  '.vercel',
  'dist',
  '.turbo',
  '.cache',
  '.output',
  'coverage',
  '.nyc_output',
  '.tmp',
  '.temp'
];

const tempFiles = [
  '*.tmp',
  '*.temp',
  '*.log',
  '*.lock',
  '.DS_Store',
  'Thumbs.db',
  '*.swp',
  '*.swo',
  '*~'
];

let cleanedSize = 0;

// 清理临时目录
for (const dir of tempDirs) {
  if (fs.existsSync(dir)) {
    const stats = fs.statSync(dir);
    if (stats.isDirectory()) {
      const size = getDirectorySize(dir).totalSize;
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        cleanedSize += size;
        console.log(`   🗑️  删除目录: ${dir} (${(size / (1024 * 1024)).toFixed(2)}MB)`);
      } catch (error) {
        console.log(`   ⚠️  无法删除目录: ${dir}`);
      }
    }
  }
}

// 清理临时文件
for (const pattern of tempFiles) {
  try {
    const { stdout } = execSync(`find . -name "${pattern}" -type f 2>/dev/null`, { encoding: 'utf8' });
    const tempFileList = stdout.trim().split('\n').filter(f => f);

    for (const file of tempFileList) {
      if (file && fs.existsSync(file)) {
        const stats = fs.statSync(file);
        fs.unlinkSync(file);
        cleanedSize += stats.size;
        console.log(`   🗑️  删除文件: ${file} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
      }
    }
  } catch (error) {
    // 忽略查找失败的错误
  }
}

console.log(`   ✅ 清理完成，释放 ${(cleanedSize / (1024 * 1024)).toFixed(2)}MB 空间`);

// 3. 检查和优化package.json
console.log('\n3️⃣ 检查和优化package.json...');
if (fs.existsSync('package.json')) {
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // 检查devDependencies
  const devDeps = packageData.devDependencies || {};
  const heavyDevDeps = Object.entries(devDeps).filter(([name, version]) => {
    return ['typescript', 'eslint', 'prettier', 'jest', '@types'].some(keyword => name.includes(keyword));
  });

  if (heavyDevDeps.length > 0) {
    console.log('   ⚠️  发现可移除的devDependencies:');
    heavyDevDeps.forEach(([name, version]) => {
      console.log(`     - ${name}@${version} (生产环境不需要)`);
    });
  }

  // 检查scripts
  const scripts = packageData.scripts || {};
  const devScripts = Object.keys(scripts).filter(script =>
    script.startsWith('dev:') || script.startsWith('test:') || script.startsWith('lint:')
  );

  if (devScripts.length > 5) {
    console.log(`   ⚠️  发现过多开发脚本 (${devScripts.length} 个)，建议精简`);
  }
}

// 4. 创建优化后的部署配置
console.log('\n4️⃣ 创建优化的部署配置...');
const optimizedPackageJson = {
  scripts: {
    "build:optimized": "node scripts/clean-before-build.js && node scripts/optimize-configs.js && next build",
    "build:cf": "node scripts/clean-before-build.js && next build && pnpm exec next-on-pages",
    "deploy:cf-safe": "pnpm build:cf && pnpm exec wrangler pages deploy .vercel/output/static --compatibility-date=2023-10-30",
    "clean:full": "rm -rf .next .vercel .turbo .cache .output dist coverage .nyc_output && find . -name '*.tmp' -delete && find . -name '*.log' -delete",
    "analyze": "ANALYZE=true pnpm build",
    "size-check": "du -sh .next .vercel dist 2>/dev/null || echo 'No build directories found'"
  }
};

// 5. 创建部署前的检查脚本
const preDeployCheck = `#!/bin/bash

# 部署前检查脚本
# 确保不会触发3MB限制

echo "🔍 执行部署前检查..."

# 1. 检查项目大小
echo "检查项目大小..."
PROJECT_SIZE=$(du -sh . | cut -f1)
echo "项目总大小: $PROJECT_SIZE"

# 2. 检查是否有大型文件
echo "检查大型文件..."
find . -type f -size +5M -not -path "./node_modules/*" -not -path "./.git/*" | head -10

# 3. 检查node_modules大小
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
    echo "node_modules大小: $NODE_MODULES_SIZE"
fi

# 4. 检查构建缓存
echo "检查构建缓存..."
[ -d ".next" ] && echo ".next存在: $(du -sh .next | cut -f1)"
[ -d ".vercel" ] && echo ".vercel存在: $(du -sh .vercel | cut -f1)"

# 5. 环境检查
echo "检查环境变量..."
if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    echo "⚠️  缺少 GOOGLE_GENERATIVE_AI_API_KEY"
else
    echo "✅ API密钥已设置"
fi

# 6. 内存使用检查
echo "检查系统资源..."
MEMORY_USAGE=$(free -m | grep "Mem:" | awk '{print $3"/"$2"MB"}')
echo "内存使用: $MEMORY_USAGE"

DISK_USAGE=$(df -h . | tail -1 | awk '{print $3"/"$2" ("$5")"}')
echo "磁盘使用: $DISK_USAGE"

echo "✅ 部署前检查完成"
`;

fs.writeFileSync(path.join(__dirname, 'pre-deploy-check.sh'), preDeployCheck);
fs.chmodSync(path.join(__dirname, 'pre-deploy-check.sh'), '755');

// 6. 创建智能部署脚本
const smartDeployScript = `#!/bin/bash

# 智能部署脚本
# 自动处理3MB限制问题的完整部署流程

set -e  # 遇到错误立即退出

echo "🚀 开始智能部署到Cloudflare Pages..."

# 颜色定义
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 步骤1: 环境检查
log_info "步骤1: 环境检查"
./scripts/pre-deploy-check.sh

# 步骤2: 彻底清理
log_info "步骤2: 清理缓存和临时文件"
pnpm clean:full

# 步骤3: 依赖检查
log_info "步骤3: 检查依赖"
if [ ! -d "node_modules" ]; then
    log_info "安装依赖..."
    pnpm install
else
    log_info "依赖已存在，检查完整性..."
    pnpm ls --depth=0 >/dev/null || (log_warn "依赖不完整，重新安装..." && rm -rf node_modules && pnpm install)
fi

# 步骤4: 优化配置
log_info "步骤4: 优化项目配置"
node scripts/optimize-configs.js
node scripts/optimize-middleware.js

# 步骤5: 预构建检查
log_info "步骤5: 预构建检查"
if command -v du >/dev/null 2>&1; then
    CURRENT_SIZE=$(du -sh . 2>/dev/null | cut -f1)
    log_info "当前项目大小: $CURRENT_SIZE"
fi

# 步骤6: 构建
log_info "步骤6: 执行优化构建"
if pnpm build:optimized; then
    log_info "构建成功！"
else
    log_error "构建失败！"
    exit 1
fi

# 步骤7: 后构建检查
log_info "步骤7: 检查构建结果"
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    log_info "构建输出大小: $BUILD_SIZE"

    # 检查是否有过大的文件
    LARGE_FILES=$(find .next -type f -size +2M | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        log_warn "发现 $LARGE_FILES 个大于2MB的文件"
        find .next -type f -size +2M -exec ls -lh {} \\; | head -5
    fi
fi

# 步骤8: Cloudflare构建
log_info "步骤8: Cloudflare Pages构建"
if pnpm build:cf; then
    log_info "Cloudflare构建成功！"
else
    log_error "Cloudflare构建失败！"
    exit 1
fi

# 步骤9: 最终检查
log_info "步骤9: 最终部署检查"
if [ -d ".vercel" ]; then
    DEPLOY_SIZE=$(du -sh .vercel 2>/dev/null | cut -f1)
    log_info "部署包大小: $DEPLOY_SIZE"

    # 检查最终bundle
    JS_BUNDLES=$(find .vercel -name "*.js" | wc -l)
    LARGE_BUNDLES=$(find .vercel -name "*.js" -size +1M | wc -l)

    log_info "JavaScript bundles: $JS_BUNDLES 个"
    if [ "$LARGE_BUNDLES" -gt 0 ]; then
        log_warn "大型bundles (>1MB): $LARGE_BUNDLES 个"
    fi
fi

# 步骤10: 部署
log_info "步骤10: 部署到Cloudflare Pages"
if pnpm deploy:cf-safe; then
    log_info "🎉 部署成功！"
else
    log_error "部署失败！"
    exit 1
fi

# 步骤11: 清理Cloudflare缓存（建议）
log_info "步骤11: 缓存清理建议"
echo "建议手动执行以下命令清理Cloudflare缓存："
echo "wrangler cache purge --url=https://your-domain.com/*"

log_info "🎉 智能部署完成！"
echo "请访问Cloudflare Dashboard确认部署状态"
`;

fs.writeFileSync(path.join(__dirname, 'smart-deploy.sh'), smartDeployScript);
fs.chmodSync(path.join(__dirname, 'smart-deploy.sh'), '755');

// 7. 创建环境优化脚本
const envOptimize = `#!/bin/bash

# 环境优化脚本
# 针对不同环境的部署优化

echo "🔧 环境优化配置..."

# 检测当前环境
if [ "$NODE_ENV" = "production" ]; then
    echo "检测到生产环境，应用生产优化..."

    # 设置生产环境变量
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1

    # 启用更激进的优化
    export NEXT_MINIMIZE=true
    export NEXT_OPTIMIZE_CSS=true

elif [ "$NODE_ENV" = "development" ]; then
    echo "检测到开发环境..."

    export NODE_ENV=development
    export NEXT_TELEMETRY_DISABLED=1

else
    echo "默认环境配置..."
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
fi

# 内存优化（如果可用）
if command -v node >/dev/null 2>&1; then
    echo "配置Node.js内存限制..."
    export NODE_OPTIONS="--max-old-space-size=4096"
fi

# Cloudflare特定优化
echo "应用Cloudflare Pages优化..."
export CLOUDFLARE_PAGES=1
export CF_PAGES=1

echo "✅ 环境优化完成"
`;

fs.writeFileSync(path.join(__dirname, 'env-optimize.sh'), envOptimize);
fs.chmodSync(path.join(__dirname, 'env-optimize.sh'), '755');

console.log('   ✅ 创建优化部署脚本: scripts/smart-deploy.sh');
console.log('   ✅ 创建部署前检查: scripts/pre-deploy-check.sh');
console.log('   ✅ 创建环境优化: scripts/env-optimize.sh');

// 8. 生成部署报告
const deploymentReport = {
  timestamp: new Date().toISOString(),
  project: {
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    fileCount: files.length,
    largeFiles: largeFiles.length
  },
  optimization: {
    cleanedSizeMB: (cleanedSize / (1024 * 1024)).toFixed(2),
    tempDirsRemoved: tempDirs.length,
    tempFilesRemoved: tempFiles.length
  },
  recommendations: [
    '使用 scripts/smart-deploy.sh 进行完整部署',
    '在部署前运行 scripts/pre-deploy-check.sh',
    '定期清理缓存和临时文件',
    '监控构建大小变化',
    '考虑使用CDN缓存静态资源'
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'deployment-report.json'),
  JSON.stringify(deploymentReport, null, 2)
);

console.log('\n🎉 部署过程优化完成！');
console.log('\n📊 优化摘要:');
console.log(`   项目大小: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
console.log(`   清理空间: ${(cleanedSize / (1024 * 1024)).toFixed(2)}MB`);
console.log(`   大型文件: ${largeFiles.length} 个`);

console.log('\n🚀 推荐的部署流程：');
console.log('1. 源文件优化: ./scripts/env-optimize.sh');
console.log('2. 预部署检查: ./scripts/pre-deploy-check.sh');
console.log('3. 智能部署: ./scripts/smart-deploy.sh');
console.log('4. 查看报告: cat scripts/deployment-report.json');