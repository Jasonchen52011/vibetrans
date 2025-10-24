#!/usr/bin/env tsx

/**
 * 脚本管理工具
 * 提供脚本的查找、执行、管理和清理功能
 */

import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, extname, join } from 'path';
import { globSync } from 'glob';

interface ScriptInfo {
  path: string;
  name: string;
  category: string;
  description?: string;
  lastModified: Date;
  size: number;
  dependencies?: string[];
  tags?: string[];
}

interface ScriptConfig {
  version: string;
  categories: string[];
  lastScan: string;
  totalScripts: number;
}

class ScriptManager {
  private projectRoot: string;
  private scriptsDir: string;
  private configPath: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.scriptsDir = join(this.projectRoot, 'scripts');
    this.configPath = join(this.scriptsDir, '.script-config.json');
  }

  private ensureConfigDir(): void {
    if (!existsSync(dirname(this.configPath))) {
      mkdirSync(dirname(this.configPath), { recursive: true });
    }
  }

  private loadConfig(): ScriptConfig {
    if (existsSync(this.configPath)) {
      try {
        return JSON.parse(readFileSync(this.configPath, 'utf8'));
      } catch (error) {
        console.log('⚠️ 配置文件损坏，使用默认配置');
      }
    }

    return {
      version: '1.0.0',
      categories: [
        'deploy',
        'test',
        'generate',
        'backup',
        'monitor',
        'fix',
        'optimize',
        'capture',
        'build',
        'utils',
      ],
      lastScan: new Date().toISOString(),
      totalScripts: 0,
    };
  }

  private saveConfig(config: ScriptConfig): void {
    this.ensureConfigDir();
    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  private scanScripts(): ScriptInfo[] {
    const config = this.loadConfig();
    const scripts: ScriptInfo[] = [];

    for (const category of config.categories) {
      const categoryDir = join(this.scriptsDir, category);

      if (!existsSync(categoryDir)) {
        continue;
      }

      const scriptFiles = globSync(`*.{ts,js,mjs}`, { cwd: categoryDir });

      for (const file of scriptFiles) {
        const fullPath = join(categoryDir, file);
        const stats = statSync(fullPath);

        const script: ScriptInfo = {
          path: fullPath,
          name: basename(file, extname(file)),
          category,
          lastModified: stats.mtime,
          size: stats.size,
        };

        // 尝试从文件中提取描述
        script.description = this.extractDescription(fullPath);

        // 分析依赖
        script.dependencies = this.analyzeDependencies(fullPath);

        scripts.push(script);
      }
    }

    // 扫描根目录的脚本
    const rootScripts = globSync(`*.{ts,js,mjs}`, { cwd: this.scriptsDir });

    for (const file of rootScripts) {
      if (file === 'script-manager.ts') continue; // 排除自身

      const fullPath = join(this.scriptsDir, file);
      const stats = statSync(fullPath);

      const script: ScriptInfo = {
        path: fullPath,
        name: basename(file, extname(file)),
        category: 'root',
        lastModified: stats.mtime,
        size: stats.size,
      };

      script.description = this.extractDescription(fullPath);
      script.dependencies = this.analyzeDependencies(fullPath);

      scripts.push(script);
    }

    // 更新配置
    config.lastScan = new Date().toISOString();
    config.totalScripts = scripts.length;
    this.saveConfig(config);

    return scripts;
  }

  private extractDescription(filePath: string): string | undefined {
    try {
      const content = readFileSync(filePath, 'utf8');

      // 查找文件顶部的注释
      const commentMatch = content.match(
        /^\/\*\*\s*\n(?:\s*\*[^*\n]*\n)*?\s*\*\s*(.*?)\s*\n/s
      );
      if (commentMatch) {
        return commentMatch[1].trim();
      }

      // 查找简单的描述注释
      const simpleMatch = content.match(/\/\*\*\s*(.*?)\s*\*\//);
      if (simpleMatch) {
        return simpleMatch[1].trim();
      }

      // TypeScript接口注释
      const interfaceMatch = content.match(
        /interface\s+\w+[^{]*\/\*\*\s*(.*?)\s*\*\//
      );
      if (interfaceMatch) {
        return interfaceMatch[1].trim();
      }
    } catch (error) {
      // 忽略读取错误
    }

    return undefined;
  }

  private analyzeDependencies(filePath: string): string[] {
    try {
      const content = readFileSync(filePath, 'utf8');
      const dependencies: string[] = [];

      // 分析导入语句
      const importMatches = content.matchAll(
        /import.*from\s+['"]([^'"]+)['"]/g
      );
      for (const match of importMatches) {
        const dep = match[1];

        // 过滤掉Node.js内置模块和相对路径
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          dependencies.push(dep);
        }
      }

      // 分析require语句
      const requireMatches = content.matchAll(
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
      );
      for (const match of requireMatches) {
        const dep = match[1];

        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          dependencies.push(dep);
        }
      }

      return [...new Set(dependencies)]; // 去重
    } catch (error) {
      return [];
    }
  }

  private findScript(nameOrPattern: string): ScriptInfo[] {
    const scripts = this.scanScripts();

    return scripts.filter(
      (script) =>
        script.name.toLowerCase().includes(nameOrPattern.toLowerCase()) ||
        script.path.toLowerCase().includes(nameOrPattern.toLowerCase()) ||
        (script.description &&
          script.description
            .toLowerCase()
            .includes(nameOrPattern.toLowerCase()))
    );
  }

  public listScripts(category?: string): void {
    const scripts = this.scanScripts();

    if (category) {
      const filtered = scripts.filter((s) => s.category === category);
      this.displayScripts(filtered, category);
    } else {
      // 按分类显示
      const config = this.loadConfig();

      for (const cat of config.categories) {
        const categoryScripts = scripts.filter((s) => s.category === cat);
        if (categoryScripts.length > 0) {
          this.displayScripts(categoryScripts, cat);
        }
      }

      // 显示根目录脚本
      const rootScripts = scripts.filter((s) => s.category === 'root');
      if (rootScripts.length > 0) {
        this.displayScripts(rootScripts, 'Root Scripts');
      }
    }
  }

  private displayScripts(scripts: ScriptInfo[], title: string): void {
    console.log(`\n📁 ${title} (${scripts.length} 个脚本)`);
    console.log('─'.repeat(50));

    for (const script of scripts) {
      const relativePath = script.path.replace(this.projectRoot + '/', '');
      const icon = this.getCategoryIcon(script.category);

      console.log(`${icon} ${script.name}`);

      if (script.description) {
        console.log(`   ${script.description}`);
      }

      console.log(`   📂 ${relativePath}`);
      console.log(
        `   📅 ${script.lastModified.toLocaleDateString('zh-CN')} | 📊 ${this.formatSize(script.size)}`
      );

      if (script.dependencies && script.dependencies.length > 0) {
        console.log(
          `   📦 依赖: ${script.dependencies.slice(0, 3).join(', ')}${script.dependencies.length > 3 ? '...' : ''}`
        );
      }

      console.log('');
    }
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      deploy: '🚀',
      test: '🧪',
      generate: '⚡',
      backup: '💾',
      monitor: '📊',
      fix: '🔧',
      optimize: '⚡',
      capture: '📸',
      build: '🏗️',
      utils: '🛠️',
      root: '📄',
    };

    return icons[category] || '📄';
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    );
  }

  public runScript(scriptName: string, args: string[] = []): Promise<void> {
    const scripts = this.findScript(scriptName);

    if (scripts.length === 0) {
      console.log(`❌ 找不到脚本: ${scriptName}`);
      process.exit(1);
    }

    if (scripts.length > 1) {
      console.log(`⚠️ 找到多个匹配的脚本:`);
      scripts.forEach((script, index) => {
        console.log(`   ${index + 1}. ${script.name} (${script.category})`);
      });

      // 选择第一个匹配的脚本
      console.log(`\n🔄 执行第一个匹配的脚本: ${scripts[0].name}`);
    }

    const selectedScript = scripts[0];
    console.log(
      `🚀 执行脚本: ${selectedScript.name} (${selectedScript.category})`
    );

    try {
      const command = `pnpm tsx ${selectedScript.path} ${args.join(' ')}`;
      execSync(command, { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error(`❌ 脚本执行失败: ${error.message}`);
      process.exit(1);
    }

    return Promise.resolve();
  }

  public searchScripts(pattern: string): void {
    const scripts = this.findScript(pattern);

    if (scripts.length === 0) {
      console.log(`🔍 没有找到包含 "${pattern}" 的脚本`);
      return;
    }

    console.log(`🔍 找到 ${scripts.length} 个包含 "${pattern}" 的脚本:\n`);

    for (const script of scripts) {
      const relativePath = script.path.replace(this.projectRoot + '/', '');
      const icon = this.getCategoryIcon(script.category);

      console.log(`${icon} ${script.name} (${script.category})`);
      if (script.description) {
        console.log(`   ${script.description}`);
      }
      console.log(`   📂 ${relativePath}\n`);
    }
  }

  public showScriptInfo(scriptName: string): void {
    const scripts = this.findScript(scriptName);

    if (scripts.length === 0) {
      console.log(`❌ 找不到脚本: ${scriptName}`);
      return;
    }

    if (scripts.length > 1) {
      console.log(`⚠️ 找到多个匹配的脚本:`);
      scripts.forEach((script, index) => {
        console.log(`   ${index + 1}. ${script.name} (${script.category})`);
      });
      console.log('\n显示第一个匹配脚本的信息:');
    }

    const script = scripts[0];
    const relativePath = script.path.replace(this.projectRoot + '/', '');

    console.log(`\n📄 脚本信息`);
    console.log('='.repeat(30));
    console.log(`名称: ${script.name}`);
    console.log(`分类: ${script.category}`);
    console.log(`路径: ${relativePath}`);
    console.log(`大小: ${this.formatSize(script.size)}`);
    console.log(`修改时间: ${script.lastModified.toLocaleString('zh-CN')}`);

    if (script.description) {
      console.log(`描述: ${script.description}`);
    }

    if (script.dependencies && script.dependencies.length > 0) {
      console.log(`依赖: ${script.dependencies.join(', ')}`);
    }

    console.log(`执行命令: pnpm tsx ${script.path}`);
  }

  public cleanOldScripts(): void {
    console.log('🧹 清理过期脚本和临时文件...');

    const config = this.loadConfig();
    let cleanedCount = 0;

    // 清理临时文件
    const tempPatterns = [
      '**/*.log',
      '**/*.tmp',
      '**/.DS_Store',
      '**/node_modules/.cache/**',
    ];

    for (const pattern of tempPatterns) {
      try {
        const files = globSync(pattern, { cwd: this.scriptsDir });
        for (const file of files) {
          const filePath = join(this.scriptsDir, file);
          if (existsSync(filePath)) {
            execSync(`rm -rf "${filePath}"`, { stdio: 'pipe' });
            cleanedCount++;
          }
        }
      } catch (error) {
        // 忽略删除错误
      }
    }

    console.log(`✅ 清理完成，删除了 ${cleanedCount} 个临时文件`);
  }

  public generateStats(): void {
    const scripts = this.scanScripts();
    const config = this.loadConfig();

    console.log('\n📊 脚本统计信息');
    console.log('='.repeat(30));
    console.log(`总脚本数量: ${scripts.length}`);
    console.log(`分类数量: ${config.categories.length}`);
    console.log(
      `最后扫描: ${new Date(config.lastScan).toLocaleString('zh-CN')}`
    );

    // 按分类统计
    console.log('\n📁 分类统计:');
    for (const category of config.categories) {
      const count = scripts.filter((s) => s.category === category).length;
      const icon = this.getCategoryIcon(category);
      if (count > 0) {
        console.log(`${icon} ${category}: ${count} 个`);
      }
    }

    // 大小统计
    const totalSize = scripts.reduce((sum, script) => sum + script.size, 0);
    console.log(`\n💾 总大小: ${this.formatSize(totalSize)}`);

    // 最近修改的脚本
    const recentScripts = scripts
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 5);

    if (recentScripts.length > 0) {
      console.log('\n🕒 最近修改的脚本:');
      recentScripts.forEach((script) => {
        const daysAgo = Math.floor(
          (Date.now() - script.lastModified.getTime()) / (1000 * 60 * 60 * 24)
        );
        console.log(`   ${script.name} (${daysAgo} 天前)`);
      });
    }
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new ScriptManager();

  try {
    switch (command) {
      case 'list':
        const category = args[1];
        manager.listScripts(category);
        break;

      case 'run':
        const scriptName = args[1];
        const runArgs = args.slice(2);
        if (!scriptName) {
          console.error('❌ 请指定要运行的脚本名称');
          process.exit(1);
        }
        await manager.runScript(scriptName, runArgs);
        break;

      case 'search':
        const pattern = args[1];
        if (!pattern) {
          console.error('❌ 请指定搜索模式');
          process.exit(1);
        }
        manager.searchScripts(pattern);
        break;

      case 'info':
        const infoScript = args[1];
        if (!infoScript) {
          console.error('❌ 请指定脚本名称');
          process.exit(1);
        }
        manager.showScriptInfo(infoScript);
        break;

      case 'clean':
        manager.cleanOldScripts();
        break;

      case 'stats':
        manager.generateStats();
        break;

      default:
        console.log('📋 脚本管理工具');
        console.log('');
        console.log('用法:');
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts list [category]     - 列出脚本'
        );
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts run <script>      - 运行脚本'
        );
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts search <pattern>  - 搜索脚本'
        );
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts info <script>      - 显示脚本信息'
        );
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts clean             - 清理临时文件'
        );
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts stats             - 显示统计信息'
        );
        console.log('');
        console.log('示例:');
        console.log('  pnpm tsx scripts/utils/script-manager.ts list deploy');
        console.log(
          '  pnpm tsx scripts/utils/script-manager.ts run pre-deploy-check'
        );
        console.log('  pnpm tsx scripts/utils/script-manager.ts search backup');
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ScriptManager, type ScriptInfo };
