#!/usr/bin/env tsx

/**
 * 项目回滚脚本
 * 从备份恢复项目到指定状态
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
import { createWriteStream as createWriteStreamFs } from 'fs';
import { basename, dirname, join } from 'path';
import { createGunzip } from 'zlib';
import { globSync } from 'glob';
import { pipeline } from 'stream/promises';

interface RollbackOptions {
  backupId?: string;
  dryRun?: boolean;
  confirm?: boolean;
  restoreConfigs?: string[];
  skipGit?: boolean;
}

interface BackupInfo {
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

class ProjectRollback {
  private projectRoot: string;
  private backupsDir: string;
  private options: RollbackOptions;

  constructor(options: RollbackOptions = {}) {
    this.projectRoot = process.cwd();
    this.backupsDir = join(this.projectRoot, 'backups');
    this.options = {
      dryRun: false,
      confirm: false,
      restoreConfigs: [],
      skipGit: false,
      ...options,
    };
  }

  private async listAvailableBackups(): Promise<BackupInfo[]> {
    if (!existsSync(this.backupsDir)) {
      throw new Error('备份目录不存在');
    }

    const backupArchives = globSync('backup-*.tar.gz', {
      cwd: this.backupsDir,
    });
    const backups: BackupInfo[] = [];

    for (const archive of backupArchives) {
      const archivePath = join(this.backupsDir, archive);

      try {
        // 尝试读取备份信息
        const extractPath = join(this.backupsDir, 'temp-' + Date.now());
        mkdirSync(extractPath, { recursive: true });

        // 使用系统tar命令解压
        execSync(`tar -xzf "${archivePath}" -C "${extractPath}"`, {
          stdio: 'pipe',
        });

        const infoPath = join(extractPath, 'backup-info.json');
        if (existsSync(infoPath)) {
          const info = JSON.parse(readFileSync(infoPath, 'utf8')) as BackupInfo;
          info.backupPath = archivePath;
          backups.push(info);
        }

        // 清理临时文件
        execSync(`rm -rf "${extractPath}"`);
      } catch (error) {
        console.log(`⚠️ 无法读取备份信息: ${archive}`);
      }
    }

    // 按时间戳排序
    backups.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return backups;
  }

  private async selectBackup(): Promise<BackupInfo> {
    const backups = await this.listAvailableBackups();

    if (backups.length === 0) {
      throw new Error('没有可用的备份');
    }

    if (this.options.backupId) {
      const selected = backups.find((backup) =>
        backup.timestamp.includes(this.options.backupId!)
      );
      if (!selected) {
        throw new Error(`找不到包含ID "${this.options.backupId}" 的备份`);
      }
      return selected;
    }

    // 交互式选择
    console.log('📋 可用的备份列表:\n');

    backups.forEach((backup, index) => {
      const date = new Date(backup.timestamp);
      const formattedDate = date.toLocaleString('zh-CN');

      console.log(`${index + 1}. ${formattedDate}`);
      console.log(`   版本: ${backup.version}`);
      console.log(`   分支: ${backup.branch}`);
      console.log(`   提交: ${backup.commit.substring(0, 7)}`);
      console.log(`   大小: ${backup.size}`);
      console.log('');
    });

    // 简单选择最新的备份（在生产环境中可以通过命令行参数选择）
    return backups[0];
  }

  private async extractBackup(backup: BackupInfo): Promise<string> {
    const extractPath = join(this.backupsDir, 'restore-' + Date.now());
    mkdirSync(extractPath, { recursive: true });

    console.log('📦 解压备份文件...');

    // 使用系统tar命令解压
    execSync(`tar -xzf "${backup.backupPath}" -C "${extractPath}"`, {
      stdio: 'pipe',
    });

    console.log(`✅ 备份已解压到: ${extractPath}`);
    return extractPath;
  }

  private async checkConflicts(extractPath: string): Promise<string[]> {
    console.log('🔍 检查文件冲突...');

    const conflicts: string[] = [];
    const backupFiles = globSync('**/*', { cwd: extractPath });

    for (const file of backupFiles) {
      const projectFile = join(this.projectRoot, file);
      const backupFile = join(extractPath, file);

      if (existsSync(projectFile) && existsSync(backupFile)) {
        try {
          const projectContent = readFileSync(projectFile, 'utf8');
          const backupContent = readFileSync(backupFile, 'utf8');

          if (projectContent !== backupContent) {
            conflicts.push(file);
          }
        } catch (error) {
          // 二进制文件或其他错误
          conflicts.push(file);
        }
      }
    }

    return conflicts;
  }

  private async restoreFile(
    extractPath: string,
    relativePath: string
  ): Promise<void> {
    const srcPath = join(extractPath, relativePath);
    const destPath = join(this.projectRoot, relativePath);

    if (!existsSync(srcPath)) {
      console.log(`⚠️ 备份中不存在文件: ${relativePath}`);
      return;
    }

    // 确保目标目录存在
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    // 复制文件
    const sourceStream = createReadStream(srcPath);
    const destStream = createWriteStream(destPath);
    await pipeline(sourceStream, destStream);
  }

  private async restoreDirectory(
    extractPath: string,
    relativePath: string
  ): Promise<void> {
    const srcPath = join(extractPath, relativePath);
    const destPath = join(this.projectRoot, relativePath);

    if (!existsSync(srcPath)) {
      console.log(`⚠️ 备份中不存在目录: ${relativePath}`);
      return;
    }

    // 复制整个目录
    const files = globSync('**/*', { cwd: srcPath });

    for (const file of files) {
      await this.restoreFile(srcPath, file);
    }
  }

  private async performRollback(backup: BackupInfo): Promise<void> {
    console.log(`🔄 开始回滚到备份: ${backup.timestamp}`);

    // 解压备份
    const extractPath = await this.extractBackup(backup);

    try {
      // 检查冲突
      const conflicts = await this.checkConflicts(extractPath);

      if (conflicts.length > 0 && !this.options.dryRun) {
        console.log('⚠️ 发现文件冲突:');
        conflicts.forEach((file) => {
          console.log(`   - ${file}`);
        });

        if (!this.options.confirm) {
          console.log('\n请使用 --confirm 参数确认要覆盖这些文件');
          throw new Error('文件冲突需要确认');
        }
      }

      // 确定要恢复的配置
      const configsToRestore =
        this.options.restoreConfigs.length > 0
          ? this.options.restoreConfigs
          : await this.detectBackupConfigs(extractPath);

      console.log(`📋 将恢复配置: ${configsToRestore.join(', ')}`);

      // 执行恢复
      for (const config of configsToRestore) {
        const configPath = join(extractPath, config);

        if (!existsSync(configPath)) {
          console.log(`⚠️ 配置不存在: ${config}`);
          continue;
        }

        const stats = statSync(configPath);

        if (stats.isDirectory()) {
          await this.restoreDirectory(extractPath, config);
          console.log(`✅ 已恢复目录: ${config}`);
        } else {
          await this.restoreFile(extractPath, config);
          console.log(`✅ 已恢复文件: ${config}`);
        }
      }

      // Git 回滚（如果需要）
      if (!this.options.skipGit) {
        console.log('🔄 执行 Git 回滚...');

        try {
          // 回退到备份时的提交
          execSync(`git reset --hard ${backup.commit}`, { stdio: 'inherit' });
          console.log(`✅ 已回退到提交: ${backup.commit.substring(0, 7)}`);
        } catch (error) {
          console.log('⚠️ Git 回滚失败，请手动处理:', error.message);
        }
      }

      console.log('\n✅ 回滚完成!');
      console.log(`📊 恢复统计:`);
      console.log(
        `   - 备份时间: ${new Date(backup.timestamp).toLocaleString('zh-CN')}`
      );
      console.log(`   - 版本: ${backup.version}`);
      console.log(`   - 恢复配置: ${configsToRestore.length}`);
    } finally {
      // 清理临时文件
      execSync(`rm -rf "${extractPath}"`);
    }
  }

  private async detectBackupConfigs(extractPath: string): Promise<string[]> {
    const configs: string[] = [];
    const items = globSync('*', { cwd: extractPath });

    for (const item of items) {
      if (item !== 'backup-info.json') {
        configs.push(item);
      }
    }

    return configs;
  }

  public async execute(): Promise<void> {
    try {
      console.log('🔄 开始项目回滚...\n');

      // 选择备份
      const backup = await this.selectBackup();

      console.log(`\n📋 选择备份:`);
      console.log(
        `   时间: ${new Date(backup.timestamp).toLocaleString('zh-CN')}`
      );
      console.log(`   版本: ${backup.version}`);
      console.log(`   分支: ${backup.branch}`);
      console.log(`   提交: ${backup.commit.substring(0, 7)}`);

      if (this.options.dryRun) {
        console.log('\n🔍 干运行模式 - 不会实际执行回滚');

        const extractPath = await this.extractBackup(backup);
        const conflicts = await this.checkConflicts(extractPath);

        console.log(`\n📊 预计影响:`);
        console.log(`   - 冲突文件: ${conflicts.length}`);
        console.log(`   - 备份文件: ${backup.files.length}`);

        execSync(`rm -rf "${extractPath}"`);
        return;
      }

      // 确认回滚
      if (!this.options.confirm) {
        console.log('\n⚠️ 警告: 这将覆盖当前文件并可能导致数据丢失');
        console.log('请使用 --confirm 参数确认执行回滚');
        return;
      }

      // 执行回滚
      await this.performRollback(backup);
    } catch (error) {
      console.error('❌ 回滚失败:', error.message);
      throw error;
    }
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);

  const options: RollbackOptions = {
    dryRun: args.includes('--dry-run'),
    confirm: args.includes('--confirm'),
    skipGit: args.includes('--skip-git'),
  };

  const backupIdIndex = args.findIndex((arg) => arg === '--backup-id');
  if (backupIdIndex !== -1 && args[backupIdIndex + 1]) {
    options.backupId = args[backupIdIndex + 1];
  }

  const configsIndex = args.findIndex((arg) => arg === '--configs');
  if (configsIndex !== -1 && args[configsIndex + 1]) {
    options.restoreConfigs = args[configsIndex + 1].split(',');
  }

  try {
    const rollback = new ProjectRollback(options);
    await rollback.execute();
    process.exit(0);
  } catch (error) {
    console.error('❌ 回滚失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProjectRollback, type RollbackOptions, type BackupInfo };
