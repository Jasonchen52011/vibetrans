#!/usr/bin/env node

/**
 * Cloudflare Pages 3MB限制故障排除工具
 * 完整的诊断和修复解决方案
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Cloudflare Pages 3MB限制故障排除工具\n');

// 故障排除主类
class DeployTroubleshooter {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.warnings = [];
  }

  // 1. 系统环境检查
  async checkSystemEnvironment() {
    console.log('🖥️  检查系统环境...');

    try {
      // 检查Node.js版本
      const nodeVersion = process.version;
      console.log(`   Node.js版本: ${nodeVersion}`);

      if (parseInt(nodeVersion.slice(1).split('.')[0]) < 18) {
        this.issues.push('Node.js版本过低，建议升级到18+');
      }

      // 检查内存
      const memoryStats = process.memoryUsage();
      const memoryMB = memoryStats.heapUsed / (1024 * 1024);
      console.log(`   当前内存使用: ${memoryMB.toFixed(2)}MB`);

      if (memoryMB > 500) {
        this.warnings.push('内存使用较高，可能影响构建');
      }

      // 检查磁盘空间
      try {
        const diskStats = fs.statSync('.');
        console.log('   磁盘访问正常');
      } catch (error) {
        this.issues.push('磁盘访问异常');
      }

    } catch (error) {
      this.issues.push('系统环境检查失败: ' + error.message);
    }
  }

  // 2. 项目结构检查
  checkProjectStructure() {
    console.log('\n📁 检查项目结构...');

    const requiredFiles = [
      'package.json',
      'next.config.ts',
      'middleware.ts',
      'tsconfig.json'
    ];

    const requiredDirs = [
      'src',
      'src/app',
      'src/lib',
      'scripts'
    ];

    // 检查必需文件
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = stats.size / 1024;
        console.log(`   ✅ ${file} (${sizeKB.toFixed(2)}KB)`);
      } else {
        this.issues.push(`缺少必需文件: ${file}`);
      }
    }

    // 检查必需目录
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir)) {
        console.log(`   ✅ ${dir}/`);
      } else {
        this.issues.push(`缺少必需目录: ${dir}`);
      }
    }
  }

  // 3. 依赖分析
  analyzeDependencies() {
    console.log('\n📦 分析依赖...');

    if (!fs.existsSync('package.json')) {
      this.issues.push('package.json不存在');
      return;
    }

    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = packageData.dependencies || {};
    const devDeps = packageData.devDependencies || {};

    console.log(`   依赖包数量: ${Object.keys(deps).length}`);
    console.log(`   开发依赖: ${Object.keys(devDeps).length}`);

    // 检查大型依赖
    const largeDeps = [];
    for (const [name, version] of Object.entries(deps)) {
      if (name.includes('monaco') || name.includes('pdf') || name.includes('video')) {
        largeDeps.push({ name, version });
      }
    }

    if (largeDeps.length > 0) {
      this.warnings.push('发现可能的大型依赖:');
      largeDeps.forEach(dep => {
        this.warnings.push(`  - ${dep.name}@${dep.version}`);
      });
    }

    // 检查潜在冲突的依赖
    const conflictingDeps = [
      ['next', 'next-on-pages'],
      ['@cloudflare/next-on-pages', 'vercel']
    ];

    for (const [dep1, dep2] of conflictingDeps) {
      if (deps[dep1] && deps[dep2]) {
        this.warnings.push(`可能存在冲突依赖: ${dep1} 和 ${dep2}`);
      }
    }
  }

  // 4. 构建大小分析
  analyzeBuildSize() {
    console.log('\n📊 分析构建大小...');

    const buildDirs = ['.next', '.vercel', 'dist'];
    let totalBuildSize = 0;

    for (const dir of buildDirs) {
      if (fs.existsSync(dir)) {
        const size = this.getDirectorySize(dir);
        totalBuildSize += size;
        console.log(`   ${dir}: ${(size / (1024 * 1024)).toFixed(2)}MB`);
      }
    }

    if (totalBuildSize === 0) {
      console.log('   ℹ️  没有找到构建文件，需要先构建');
      return;
    }

    console.log(`   总构建大小: ${(totalBuildSize / (1024 * 1024)).toFixed(2)}MB`);

    // 检查是否有过大的文件
    if (fs.existsSync('.next')) {
      const largeFiles = this.findLargeFiles('.next', 2 * 1024 * 1024); // 2MB
      if (largeFiles.length > 0) {
        this.warnings.push('发现大型构建文件:');
        largeFiles.slice(0, 5).forEach(file => {
          this.warnings.push(`  - ${file.path}: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        });
      }
    }
  }

  // 5. Edge Runtime检查
  checkEdgeRuntime() {
    console.log('\n⚡ 检查Edge Runtime兼容性...');

    // 检查middleware
    const middlewareFiles = ['middleware.ts', 'src/middleware.ts'];
    for (const file of middlewareFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // 检查是否有Node.js特有的API
        const nodeAPIs = ['fs', 'path', 'crypto', 'buffer', 'process', 'require'];
        const foundAPIs = nodeAPIs.filter(api => content.includes(api));

        if (foundAPIs.length > 0) {
          this.warnings.push(`${file} 可能包含不兼容Edge Runtime的API: ${foundAPIs.join(', ')}`);
        }

        // 检查文件大小
        const sizeKB = content.length / 1024;
        console.log(`   ${file}: ${sizeKB.toFixed(2)}KB`);

        if (sizeKB > 50) {
          this.warnings.push(`${file} 较大，可能影响Worker大小`);
        }
      }
    }

    // 检查API路由
    if (fs.existsSync('src/app/api')) {
      const apiRoutes = this.findFiles('src/app/api', 'route.ts');
      console.log(`   API路由数量: ${apiRoutes.length}`);

      let totalAPISize = 0;
      for (const route of apiRoutes) {
        const content = fs.readFileSync(route, 'utf8');
        totalAPISize += content.length;
      }

      console.log(`   API路由总大小: ${(totalAPISize / 1024).toFixed(2)}KB`);

      if (totalAPISize > 1024 * 1024) { // 1MB
        this.warnings.push('API路由总大小较大，可能影响部署');
      }
    }
  }

  // 6. 配置文件分析
  analyzeConfigurations() {
    console.log('\n⚙️  分析配置文件...');

    const configs = [
      { file: 'next.config.ts', type: 'Next.js配置' },
      { file: 'tsconfig.json', type: 'TypeScript配置' },
      { file: 'tailwind.config.ts', type: 'Tailwind配置' },
      { file: 'wrangler.toml', type: 'Cloudflare配置' }
    ];

    for (const config of configs) {
      if (fs.existsSync(config.file)) {
        const stats = fs.statSync(config.file);
        const sizeKB = stats.size / 1024;
        console.log(`   ${config.type}: ${sizeKB.toFixed(2)}KB`);

        if (sizeKB > 20) {
          this.warnings.push(`${config.file} 配置文件较大`);
        }
      }
    }
  }

  // 7. 生成修复建议
  generateFixes() {
    console.log('\n🔧 生成修复建议...');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('   ✅ 没有发现明显问题');
      return;
    }

    // 基于问题类型生成修复建议
    if (this.issues.some(issue => issue.includes('Node.js'))) {
      this.fixes.push('升级Node.js到v18+版本');
    }

    if (this.issues.some(issue => issue.includes('package.json'))) {
      this.fixes.push('重新初始化项目: npm init -y');
    }

    if (this.warnings.some(warning => warning.includes('大型'))) {
      this.fixes.push('运行优化脚本: pnpm optimize');
      this.fixes.push('清理缓存: pnpm clean:full');
    }

    if (this.warnings.some(warning => warning.includes('Edge Runtime'))) {
      this.fixes.push('检查并修复Edge Runtime兼容性问题');
      this.fixes.push('简化middleware逻辑');
    }

    // 添加通用修复建议
    this.fixes.push('使用智能部署脚本: ./scripts/smart-deploy.sh');
    this.fixes.push('清理Cloudflare缓存: wrangler cache purge --url=https://your-domain.com/*');
  }

  // 8. 生成完整报告
  generateReport() {
    console.log('\n📋 生成故障排除报告...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        issues: this.issues.length,
        warnings: this.warnings.length,
        fixes: this.fixes.length
      },
      details: {
        issues: this.issues,
        warnings: this.warnings,
        fixes: this.fixes
      },
      recommendations: this.getRecommendations()
    };

    // 保存报告
    fs.writeFileSync(
      path.join(__dirname, 'troubleshoot-report.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  // 获取推荐操作
  getRecommendations() {
    const recommendations = [];

    if (this.issues.length > 0) {
      recommendations.push({
        priority: 'high',
        action: '修复关键问题',
        description: '必须先解决这些问题才能继续部署'
      });
    }

    if (this.warnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: '优化警告项',
        description: '建议优化这些项目以避免部署问题'
      });
    }

    recommendations.push({
      priority: 'low',
      action: '使用优化部署流程',
      description: '运行 ./scripts/smart-deploy.sh 进行安全部署'
    });

    return recommendations;
  }

  // 辅助方法
  getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  findFiles(dir, extension) {
    const files = [];

    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          traverse(itemPath);
        } else if (itemPath.endsWith(extension)) {
          files.push(itemPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  findLargeFiles(dir, minSize) {
    const files = [];

    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          traverse(itemPath);
        } else if (stats.size > minSize) {
          files.push({
            path: path.relative('.', itemPath),
            size: stats.size
          });
        }
      }
    }

    traverse(dir);
    return files.sort((a, b) => b.size - a.size);
  }

  // 运行完整的诊断流程
  async runFullDiagnosis() {
    console.log('🔍 开始完整诊断...\n');

    await this.checkSystemEnvironment();
    this.checkProjectStructure();
    this.analyzeDependencies();
    this.analyzeBuildSize();
    this.checkEdgeRuntime();
    this.analyzeConfigurations();
    this.generateFixes();

    const report = this.generateReport();

    // 显示结果摘要
    console.log('\n🎯 诊断结果摘要:');
    console.log(`   ❌ 问题: ${report.summary.issues} 个`);
    console.log(`   ⚠️  警告: ${report.summary.warnings} 个`);
    console.log(`   ✅ 修复建议: ${report.summary.fixes} 个`);

    if (this.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.slice(0, 5).forEach(warning => console.log(`   - ${warning}`));
      if (this.warnings.length > 5) {
        console.log(`   ... 还有 ${this.warnings.length - 5} 个警告`);
      }
    }

    if (this.fixes.length > 0) {
      console.log('\n🔧 修复建议:');
      this.fixes.forEach(fix => console.log(`   - ${fix}`));
    }

    console.log('\n📊 详细报告已保存到: scripts/troubleshoot-report.json');

    return report;
  }
}

// 主执行函数
async function main() {
  const troubleshooter = new DeployTroubleshooter();

  try {
    await troubleshooter.runFullDiagnosis();

    console.log('\n🚀 推荐的下一步操作:');
    console.log('1. 如果有问题，按照修复建议进行处理');
    console.log('2. 运行智能部署: ./scripts/smart-deploy.sh');
    console.log('3. 查看详细报告: cat scripts/troubleshoot-report.json');

  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = DeployTroubleshooter;