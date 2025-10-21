#!/usr/bin/env node

/**
 * VibeTrans 代码耦合检查脚本
 *
 * 功能：
 * 1. JSON文件与页面的耦合检查
 * 2. 组件导入路径检查
 * 3. 翻译键引用检查
 * 4. 路由和文件结构匹配检查
 */

const fs = require('fs');
const path = require('path');

class CodeCouplingChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    // 项目路径配置
    this.paths = {
      messagesDir: path.join(this.projectRoot, 'messages'),
      pagesDir: path.join(this.projectRoot, 'src/app/[locale]/(marketing)/(pages)'),
      srcDir: path.join(this.projectRoot, 'src'),
      componentsDir: path.join(this.projectRoot, 'src/components')
    };

    console.log('🔍 VibeTrans 代码耦合检查开始...\n');
  }

  /**
   * 主检查函数
   */
  async run() {
    try {
      await this.checkJsonPageCoupling();
      await this.checkComponentImports();
      await this.checkTranslationKeys();
      await this.checkRouteStructure();

      this.generateReport();
    } catch (error) {
      console.error('❌ 检查过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 1. JSON文件与页面耦合检查
   */
  async checkJsonPageCoupling() {
    console.log('📋 检查 JSON 文件与页面耦合...');

    // 获取所有pages下的JSON文件夹
    const pagesJsonDir = path.join(this.paths.messagesDir, 'pages');
    if (!fs.existsSync(pagesJsonDir)) {
      this.addError(`pages翻译目录不存在: ${pagesJsonDir}`);
      return;
    }

    const jsonFolders = this.getDirectories(pagesJsonDir);

    for (const folder of jsonFolders) {
      const jsonPath = path.join(pagesJsonDir, folder);
      const enJsonPath = path.join(jsonPath, 'en.json');
      const zhJsonPath = path.join(jsonPath, 'zh.json');

      // 检查JSON文件是否存在
      if (!fs.existsSync(enJsonPath)) {
        this.addError(`缺失英文翻译文件: ${enJsonPath}`);
      }

      if (!fs.existsSync(zhJsonPath)) {
        this.addWarning(`缺失中文翻译文件: ${zhJsonPath}`);
      }

      // 检查对应的页面文件是否存在
      await this.checkPageForJson(folder);
    }

    // 反向检查：检查页面文件是否有对应的JSON
    await this.checkJsonForPages();

    console.log('✅ JSON文件与页面耦合检查完成\n');
  }

  /**
   * 检查JSON文件对应的页面
   */
  async checkPageForJson(jsonFolder) {
    const pageDir = path.join(this.paths.pagesDir, jsonFolder);
    const pageFilePath = path.join(pageDir, 'page.tsx');

    if (!fs.existsSync(pageFilePath)) {
      // 检查是否有其他可能的页面文件
      const pageFiles = fs.existsSync(pageDir) ?
        fs.readdirSync(pageDir).filter(f => f.includes('page') && f.endsWith('.tsx')) : [];

      if (pageFiles.length === 0) {
        this.addWarning(`JSON文件缺少对应页面: messages/pages/${jsonFolder} -> ${pageFilePath}`);
      } else {
        this.addSuggestion(`建议统一命名: 将 ${pageFiles[0]} 重命名为 page.tsx`);
      }
    }
  }

  /**
   * 反向检查页面是否有对应的JSON
   */
  async checkJsonForPages() {
    const pageFolders = this.getDirectories(this.paths.pagesDir);

    for (const pageFolder of pageFolders) {
      const jsonPath = path.join(this.paths.messagesDir, 'pages', pageFolder);
      const enJsonPath = path.join(jsonPath, 'en.json');

      if (!fs.existsSync(enJsonPath)) {
        this.addError(`页面文件缺少对应JSON翻译: src/app/[locale]/(marketing)/(pages)/${pageFolder} -> ${enJsonPath}`);
      }
    }
  }

  /**
   * 2. 组件导入路径检查
   */
  async checkComponentImports() {
    console.log('🔗 检查组件导入路径...');

    const tsxFiles = this.getAllFiles(this.paths.srcDir, ['.tsx', '.ts']);

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // 查找所有import语句
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // 检查相对路径导入
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          await this.checkRelativeImport(file, importPath);
        }

        // 检查绝对路径导入
        if (importPath.startsWith('@/')) {
          await this.checkAbsoluteImport(file, importPath);
        }
      }
    }

    console.log('✅ 组件导入路径检查完成\n');
  }

  /**
   * 检查相对路径导入
   */
  async checkRelativeImport(file, importPath) {
    const fileDir = path.dirname(file);
    const resolvedPath = path.resolve(fileDir, importPath);

    // 跳过图片、静态资源等文件
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico|css|scss|less)$/i.test(importPath)) {
      return;
    }

    // 尝试不同的文件扩展名
    const extensions = ['.tsx', '.ts', '.js', '.jsx', ''];

    let found = false;
    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext) ||
          fs.existsSync(resolvedPath + '/index.tsx') ||
          fs.existsSync(resolvedPath + '/index.ts')) {
        found = true;
        break;
      }
    }

    if (!found) {
      this.addError(`无效的导入路径: ${file} 导入 ${importPath}`);
    }
  }

  /**
   * 检查绝对路径导入
   */
  async checkAbsoluteImport(file, importPath) {
    // 将 @/ 转换为实际路径
    const actualPath = importPath.replace('@/', 'src/');
    const resolvedPath = path.join(this.projectRoot, actualPath);

    // 跳过图片、静态资源等文件
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico|css|scss|less)$/i.test(importPath)) {
      return;
    }

    // 尝试不同的文件扩展名
    const extensions = ['.tsx', '.ts', '.js', '.jsx', ''];

    let found = false;
    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext) ||
          fs.existsSync(resolvedPath + '/index.tsx') ||
          fs.existsSync(resolvedPath + '/index.ts')) {
        found = true;
        break;
      }
    }

    if (!found) {
      this.addError(`无效的绝对路径导入: ${file} 导入 ${importPath}`);
    }
  }

  /**
   * 3. 翻译键引用检查
   */
  async checkTranslationKeys() {
    console.log('🌐 检查翻译键引用...');

    const pageFolders = this.getDirectories(this.paths.pagesDir);

    for (const pageFolder of pageFolders) {
      await this.checkPageTranslationKeys(pageFolder);
    }

    console.log('✅ 翻译键引用检查完成\n');
  }

  /**
   * 检查单个页面的翻译键
   */
  async checkPageTranslationKeys(pageFolder) {
    const pageDir = path.join(this.paths.pagesDir, pageFolder);
    const pageFiles = fs.existsSync(pageDir) ?
      fs.readdirSync(pageDir).filter(f => f.endsWith('.tsx')) : [];

    if (pageFiles.length === 0) return;

    // 读取JSON翻译文件
    const jsonPath = path.join(this.paths.messagesDir, 'pages', pageFolder, 'en.json');
    if (!fs.existsSync(jsonPath)) return;

    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const allKeys = this.extractAllKeys(jsonContent);

    // 只检查主页面文件 (page.tsx)，忽略备份和模板文件
    const mainPageFile = 'page.tsx';
    if (!pageFiles.includes(mainPageFile)) return;

    const filePath = path.join(pageDir, mainPageFile);
    const content = fs.readFileSync(filePath, 'utf8');

    // 查找翻译键使用
    const keyUsageRegex = /\(t\s+as\s+any\)\(['"]([^'"]+)['"]\)/g;
    let match;

    const usedKeys = new Set();
    while ((match = keyUsageRegex.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }

    // 只检查关键的缺失键，忽略未使用的键以减少输出
    let missingKeysCount = 0;
    for (const usedKey of usedKeys) {
      if (!allKeys.has(usedKey)) {
        missingKeysCount++;
        if (missingKeysCount <= 10) { // 只显示前10个缺失的键
          this.addError(`缺失的翻译键: ${pageFolder}/${usedKey}`);
        }
      }
    }

    if (missingKeysCount > 10) {
      this.addError(`${pageFolder}: 还有 ${missingKeysCount - 10} 个缺失的翻译键未显示`);
    }
  }

  /**
   * 递归提取所有翻译键
   */
  extractAllKeys(obj, prefix = '') {
    const keys = new Set();

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const subKeys = this.extractAllKeys(value, fullKey);
        subKeys.forEach(k => keys.add(k));
      } else {
        keys.add(fullKey);
      }
    }

    return keys;
  }

  /**
   * 4. 路由和文件结构匹配检查
   */
  async checkRouteStructure() {
    console.log('🛣️  检查路由和文件结构匹配...');

    // 检查动态路由
    await this.checkDynamicRoutes();

    // 检查路由命名规范
    await this.checkRouteNaming();

    console.log('✅ 路由和文件结构匹配检查完成\n');
  }

  /**
   * 检查动态路由
   */
  async checkDynamicRoutes() {
    const appDir = path.join(this.projectRoot, 'src/app');
    const allDirs = this.getAllDirectories(appDir);

    for (const dir of allDirs) {
      if (dir.includes('[') && dir.includes(']')) {
        // 检查动态路由是否正确
        if (!dir.match(/^\[.*\]$/)) {
          this.addWarning(`动态路由命名不规范: ${dir}`);
        }
      }
    }
  }

  /**
   * 检查路由命名规范
   */
  async checkRouteNaming() {
    const pageFolders = this.getDirectories(this.paths.pagesDir);

    for (const folder of pageFolders) {
      // 检查是否使用kebab-case
      if (folder.includes('_') || /[A-Z]/.test(folder)) {
        this.addSuggestion(`路由文件夹建议使用kebab-case: ${folder}`);
      }
    }
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    console.log('📊 生成检查报告...\n');
    console.log('=' .repeat(60));
    console.log('🔍 VibeTrans 代码耦合检查报告');
    console.log('=' .repeat(60));

    console.log(`\n❌ 错误 (${this.errors.length}):`);
    if (this.errors.length === 0) {
      console.log('  ✅ 未发现错误');
    } else {
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n⚠️  警告 (${this.warnings.length}):`);
    if (this.warnings.length === 0) {
      console.log('  ✅ 未发现警告');
    } else {
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    console.log(`\n💡 建议 (${this.suggestions.length}):`);
    if (this.suggestions.length === 0) {
      console.log('  ✅ 无改进建议');
    } else {
      this.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log('\n' + '=' .repeat(60));

    // 生成修复建议
    if (this.errors.length > 0 || this.warnings.length > 0) {
      console.log('\n🔧 修复建议:');
      this.generateFixSuggestions();
    }

    // 总结
    const totalIssues = this.errors.length + this.warnings.length;
    console.log(`\n📈 总结: 发现 ${totalIssues} 个问题 (${this.errors.length} 错误, ${this.warnings.length} 警告)`);

    if (totalIssues === 0) {
      console.log('🎉 恭喜！未发现任何代码耦合问题。');
    } else {
      console.log('⚡ 请根据上述建议修复问题以提高代码质量。');
    }
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions() {
    console.log('\n1. JSON文件与页面耦合问题:');
    console.log('   - 确保每个页面都有对应的中英文翻译文件');
    console.log('   - 检查文件路径和命名是否正确');

    console.log('\n2. 组件导入路径问题:');
    console.log('   - 检查相对路径是否正确');
    console.log('   - 确认文件扩展名是否存在');
    console.log('   - 验证绝对路径 @/ 映射是否正确');

    console.log('\n3. 翻译键引用问题:');
    console.log('   - 移除未使用的翻译键');
    console.log('   - 添加缺失的翻译键到JSON文件');
    console.log('   - 保持翻译键命名的一致性');

    console.log('\n4. 路由结构问题:');
    console.log('   - 使用kebab-case命名路由文件夹');
    console.log('   - 确保动态路由格式正确');
    console.log('   - 保持URL路径与文件结构一致');
  }

  /**
   * 辅助函数：获取目录
   */
  getDirectories(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(file => {
      const filePath = path.join(dir, file);
      return fs.statSync(filePath).isDirectory();
    });
  }

  /**
   * 辅助函数：递归获取所有文件
   */
  getAllFiles(dir, extensions = []) {
    if (!fs.existsSync(dir)) return [];

    const files = [];

    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.length === 0 || extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }

  /**
   * 辅助函数：递归获取所有目录
   */
  getAllDirectories(dir) {
    if (!fs.existsSync(dir)) return [];

    const directories = [];

    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          directories.push(fullPath.replace(this.projectRoot + path.sep, ''));
          traverse(fullPath);
        }
      }
    };

    traverse(dir);
    return directories;
  }

  /**
   * 添加错误
   */
  addError(message) {
    this.errors.push(message);
  }

  /**
   * 添加警告
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * 添加建议
   */
  addSuggestion(message) {
    this.suggestions.push(message);
  }
}

// 运行检查器
if (require.main === module) {
  const checker = new CodeCouplingChecker();
  checker.run().catch(error => {
    console.error('运行失败:', error);
    process.exit(1);
  });
}

module.exports = CodeCouplingChecker;