#!/usr/bin/env node

/**
 * VibeTrans 快速代码耦合检查脚本
 * 简化版本，专注于最重要的检查项目
 */

const fs = require('fs');
const path = require('path');

class QuickCouplingChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];

    console.log('🚀 VibeTrans 快速代码耦合检查...\n');
  }

  async run() {
    try {
      await this.checkCriticalIssues();
      this.generateQuickReport();
    } catch (error) {
      console.error('❌ 检查失败:', error.message);
      process.exit(1);
    }
  }

  async checkCriticalIssues() {
    // 1. 检查关键翻译文件缺失
    await this.checkCriticalTranslationFiles();

    // 2. 检查主要组件导入错误
    await this.checkComponentImports();

    // 3. 检查页面文件与JSON匹配
    await this.checkPageJsonMatch();
  }

  async checkCriticalTranslationFiles() {
    console.log('🔍 检查关键翻译文件...');

    const pagesDir = path.join(this.projectRoot, 'messages/pages');
    if (!fs.existsSync(pagesDir)) {
      this.errors.push('pages翻译目录不存在');
      return;
    }

    const folders = fs.readdirSync(pagesDir).filter(f => {
      const folderPath = path.join(pagesDir, f);
      return fs.statSync(folderPath).isDirectory();
    });

    for (const folder of folders) {
      const enJsonPath = path.join(pagesDir, folder, 'en.json');
      const zhJsonPath = path.join(pagesDir, folder, 'zh.json');

      if (!fs.existsSync(enJsonPath)) {
        this.errors.push(`缺失英文翻译: pages/${folder}/en.json`);
      }

      if (!fs.existsSync(zhJsonPath)) {
        this.warnings.push(`缺失中文翻译: pages/${folder}/zh.json`);
      }
    }

    console.log('✅ 翻译文件检查完成');
  }

  async checkComponentImports() {
    console.log('🔗 检查组件导入...');

    const srcDir = path.join(this.projectRoot, 'src');
    const tsxFiles = this.getTsxFiles(srcDir);

    let importErrors = 0;
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          if (!this.checkRelativeImport(file, importPath)) {
            importErrors++;
            if (importErrors <= 5) {
              this.errors.push(`导入错误: ${path.relative(this.projectRoot, file)} -> ${importPath}`);
            }
          }
        }
      }
    }

    if (importErrors > 5) {
      this.errors.push(`还有 ${importErrors - 5} 个导入错误未显示`);
    }

    console.log('✅ 组件导入检查完成');
  }

  async checkPageJsonMatch() {
    console.log('📄 检查页面与JSON匹配...');

    const pagesJsonDir = path.join(this.projectRoot, 'messages/pages');
    const pagesDir = path.join(this.projectRoot, 'src/app/[locale]/(marketing)/(pages)');

    if (!fs.existsSync(pagesJsonDir) || !fs.existsSync(pagesDir)) {
      this.errors.push('页面目录结构不完整');
      return;
    }

    const jsonFolders = fs.readdirSync(pagesJsonDir).filter(f => {
      const folderPath = path.join(pagesJsonDir, f);
      return fs.statSync(folderPath).isDirectory();
    });

    let mismatches = 0;
    for (const folder of jsonFolders) {
      const pagePath = path.join(pagesDir, folder, 'page.tsx');
      if (!fs.existsSync(pagePath)) {
        mismatches++;
        if (mismatches <= 3) {
          this.warnings.push(`JSON缺少页面: ${folder}`);
        }
      }
    }

    if (mismatches > 3) {
      this.warnings.push(`还有 ${mismatches - 3} 个页面不匹配未显示`);
    }

    console.log('✅ 页面匹配检查完成');
  }

  checkRelativeImport(file, importPath) {
    const fileDir = path.dirname(file);
    const resolvedPath = path.resolve(fileDir, importPath);

    // 跳过资源文件
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico|css|scss|less)$/i.test(importPath)) {
      return true;
    }

    const extensions = ['.tsx', '.ts', '.js', '.jsx', ''];

    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext) ||
          fs.existsSync(resolvedPath + '/index.tsx') ||
          fs.existsSync(resolvedPath + '/index.ts')) {
        return true;
      }
    }

    return false;
  }

  getTsxFiles(dir) {
    const files = [];

    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }

  generateQuickReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 快速检查报告');
    console.log('='.repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 未发现关键问题！');
      console.log('✅ 项目结构良好');
      return;
    }

    console.log(`\n❌ 错误 (${this.errors.length}):`);
    this.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });

    console.log(`\n⚠️  警告 (${this.warnings.length}):`);
    this.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });

    console.log('\n🔧 快速修复建议:');
    if (this.errors.some(e => e.includes('英文翻译'))) {
      console.log('  • 使用自动化工具生成缺失的翻译文件');
    }
    if (this.errors.some(e => e.includes('导入错误'))) {
      console.log('  • 检查组件路径和文件名');
    }
    if (this.warnings.some(w => w.includes('中文翻译'))) {
      console.log('  • 添加中文翻译文件');
    }

    const total = this.errors.length + this.warnings.length;
    console.log(`\n📊 总计: ${total} 个问题需要关注`);
  }
}

// 运行快速检查
if (require.main === module) {
  new QuickCouplingChecker().run();
}

module.exports = QuickCouplingChecker;