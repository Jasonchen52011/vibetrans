// 使用既有的生成脚本，直接复制成功的模式
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 直接使用 pnpm tsx 运行自动生成脚本
async function main() {
  console.log('使用自动化脚本重新生成图片...');

  try {
    const { stdout, stderr } = await execAsync(
      'pnpm tsx scripts/generate-aramaic-translator-images-auto.ts'
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('生成失败:', error);
  }
}

main();
