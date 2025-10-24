#!/usr/bin/env tsx

/**
 * 项目备份脚本
 * 在部署前创建关键文件和配置的备份
 */

import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import { basename, dirname, join } from 'path';
import { createGzip } from 'zlib';
import { globSync } from 'glob';
import { pipeline } from 'stream/promises';

interface BackupConfig {
  name: string;
  files: string[];
  directories: string[];
  exclude?: string[];
}

interface BackupReport {
  timestamp: string;
  version: string;
  commit: string;
  branch: string;
  backupPath: string;
  size: string;
  files: string[];
  directories: string[];
  duration: number;
}

class ProjectBackup {
  private projectRoot: string;
  private backupDir: string;
  private timestamp: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = join(
      this.projectRoot,
      'backups',
      `backup-${this.timestamp}`
    );
  }

  private ensureBackupDir(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private async getGitInfo(): Promise<{
    version: string;
    commit: string;
    branch: string;
  }> {
    try {
      const version = JSON.parse(
        readFileSync(join(this.projectRoot, 'package.json'), 'utf8')
      ).version;
      const commit = execSync('git rev-parse HEAD', {
        encoding: 'utf8',
      }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();

      return { version, commit, branch };
    } catch (error) {
      return { version: 'unknown', commit: 'unknown', branch: 'unknown' };
    }
  }

  private async getBackupConfigs(): Promise<BackupConfig[]> {
    return [
      {
        name: 'critical-configs',
        files: [
          'package.json',
          'package-lock.json',
          'pnpm-lock.yaml',
          'next.config.mjs',
          'tsconfig.json',
          'tailwind.config.ts',
          'biome.json',
          'drizzle.config.ts',
          '.env.example',
        ],
        directories: ['src/config', 'src/db', 'src/lib'],
        exclude: ['node_modules', '.git', '.next', 'dist', 'build'],
      },
      {
        name: 'internationalization',
        files: ['messages/', 'src/i18n/'],
        directories: [],
        exclude: [],
      },
      {
        name: 'content',
        files: ['content/'],
        directories: [],
        exclude: ['content/**/node_modules'],
      },
      {
        name: 'scripts',
        files: ['scripts/'],
        directories: [],
        exclude: ['scripts/**/node_modules', 'scripts/**/*.log'],
      },
      {
        name: 'deployment',
        files: ['wrangler.toml', '.env.production', 'public/', 'src/app/api/'],
        directories: [],
        exclude: [],
      },
    ];
  }

  private async copyFile(src: string, dest: string): Promise<void> {
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    const sourceStream = createReadStream(src);
    const destStream = createWriteStream(dest);

    await pipeline(sourceStream, destStream);
  }

  private async copyDirectory(
    src: string,
    dest: string,
    exclude: string[] = []
  ): Promise<void> {
    if (!existsSync(src)) {
      console.log(`⚠️ 目录不存在，跳过: ${src}`);
      return;
    }

    mkdirSync(dest, { recursive: true });

    const items = globSync('**/*', { cwd: src, dot: true });

    for (const item of items) {
      const srcPath = join(src, item);
      const destPath = join(dest, item);

      // 检查是否需要排除
      const shouldExclude = exclude.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(item);
      });

      if (shouldExclude) {
        continue;
      }

      const stats = statSync(srcPath);
      if (stats.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
      } else {
        await this.copyFile(srcPath, destPath);
      }
    }
  }

  private async backupConfig(
    config: BackupConfig
  ): Promise<{ files: string[]; size: number }> {
    const configDir = join(this.backupDir, config.name);
    const backedUpFiles: string[] = [];
    let totalSize = 0;

    console.log(`📦 备份配置: ${config.name}`);

    // 备份文件
    for (const filePattern of config.files) {
      const files = globSync(filePattern, { cwd: this.projectRoot });

      for (const file of files) {
        const srcPath = join(this.projectRoot, file);
        const destPath = join(configDir, file);

        if (existsSync(srcPath)) {
          const stats = statSync(srcPath);
          if (stats.isDirectory()) {
            await this.copyDirectory(srcPath, destPath, config.exclude);
          } else {
            await this.copyFile(srcPath, destPath);
            backedUpFiles.push(file);
            totalSize += stats.size;
          }
        }
      }
    }

    // 备份目录
    for (const dir of config.directories) {
      const srcPath = join(this.projectRoot, dir);
      const destPath = join(configDir, dir);

      if (existsSync(srcPath)) {
        await this.copyDirectory(srcPath, destPath, config.exclude);
        backedUpFiles.push(dir);
      }
    }

    return { files: backedUpFiles, size: totalSize };
  }

  private async createBackupMetadata(report: BackupReport): Promise<void> {
    const metadataPath = join(this.backupDir, 'backup-info.json');
    writeFileSync(metadataPath, JSON.stringify(report, null, 2));
  }

  private async createCompressedArchive(): Promise<string> {
    const archivePath = join(
      this.projectRoot,
      'backups',
      `backup-${this.timestamp}.tar.gz`
    );

    try {
      // 使用系统tar命令创建压缩包
      execSync(
        `tar -czf "${archivePath}" -C "${dirname(this.backupDir)}" "${basename(this.backupDir)}"`,
        {
          stdio: 'pipe',
        }
      );

      console.log(`📦 压缩备份完成: ${archivePath}`);
      return archivePath;
    } catch (error) {
      console.log(`⚠️ 无法创建压缩包，备份目录保留在: ${this.backupDir}`);
      return this.backupDir;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  }

  public async createBackup(): Promise<BackupReport> {
    const startTime = Date.now();
    this.ensureBackupDir();

    console.log('🚀 开始项目备份...\n');

    const gitInfo = await this.getGitInfo();
    const configs = await this.getBackupConfigs();

    const report: BackupReport = {
      timestamp: this.timestamp,
      version: gitInfo.version,
      commit: gitInfo.commit,
      branch: gitInfo.branch,
      backupPath: this.backupDir,
      size: '0 Bytes',
      files: [],
      directories: [],
      duration: 0,
    };

    let totalSize = 0;
    const allFiles: string[] = [];

    // 执行备份配置
    for (const config of configs) {
      const result = await this.backupConfig(config);
      allFiles.push(...result.files);
      totalSize += result.size;
    }

    // 创建备份元数据
    await this.createBackupMetadata(report);

    // 创建压缩包
    const archivePath = await this.createCompressedArchive();

    // 更新报告
    report.files = allFiles;
    report.size = this.formatBytes(totalSize);
    report.duration = Date.now() - startTime;

    console.log('\n✅ 备份完成!');
    console.log(`📊 备份统计:`);
    console.log(`   - 文件数量: ${allFiles.length}`);
    console.log(`   - 总大小: ${report.size}`);
    console.log(`   - 耗时: ${report.duration}ms`);
    console.log(`   - 版本: ${gitInfo.version}`);
    console.log(`   - 分支: ${gitInfo.branch}`);
    console.log(`   - 提交: ${gitInfo.commit.substring(0, 7)}`);
    console.log(`   - 备份路径: ${this.backupDir}`);
    console.log(`   - 压缩包: ${archivePath}`);

    return report;
  }
}

// 主执行函数
async function main() {
  try {
    const backup = new ProjectBackup();
    await backup.createBackup();
    process.exit(0);
  } catch (error) {
    console.error('❌ 备份失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProjectBackup, type BackupReport };
