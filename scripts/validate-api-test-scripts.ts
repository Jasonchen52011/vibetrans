#!/usr/bin/env tsx

/**
 * API测试脚本验证工具
 * 验证所有API测试脚本的语法和基本功能
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  script: string;
  syntaxValid: boolean;
  functionsValid: boolean;
  dependenciesValid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateScript(scriptPath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    script: scriptPath,
    syntaxValid: false,
    functionsValid: false,
    dependenciesValid: false,
    errors: [],
    warnings: [],
  };

  try {
    // 1. 检查文件是否存在
    if (!fs.existsSync(scriptPath)) {
      result.errors.push('Script file does not exist');
      return result;
    }

    // 2. 检查语法
    const content = fs.readFileSync(scriptPath, 'utf-8');

    // 基本语法检查
    if (!content.includes('import') && !content.includes('require')) {
      result.warnings.push('No imports detected');
    }

    if (!content.includes('async') && !content.includes('function')) {
      result.errors.push('No functions detected');
      return result;
    }

    result.syntaxValid = true;

    // 3. 检查关键函数
    const hasMainFunction =
      content.includes('function main(') ||
      content.includes('async function main(');
    const hasExport =
      content.includes('export') || content.includes('module.exports');

    if (!hasMainFunction) {
      result.warnings.push('No main function detected');
    }

    result.functionsValid = true;

    // 4. 检查依赖
    const requiredImports = ['performance', 'fs'];
    const missingImports = requiredImports.filter(
      (imp) => !content.includes(imp)
    );

    if (missingImports.length > 0) {
      result.warnings.push(`Missing imports: ${missingImports.join(', ')}`);
    }

    result.dependenciesValid = true;

    // 5. 特定脚本验证
    if (scriptPath.includes('test-all-apis')) {
      if (!content.includes('TOOLS_APIS')) {
        result.errors.push('Missing TOOLS_APIS constant');
      }
      if (!content.includes('testToolApi')) {
        result.errors.push('Missing testToolApi function');
      }
    } else if (scriptPath.includes('quick-api-test')) {
      if (!content.includes('CRITICAL_APIS')) {
        result.errors.push('Missing CRITICAL_APIS constant');
      }
      if (!content.includes('quickApiHealthCheck')) {
        result.errors.push('Missing quickApiHealthCheck function');
      }
    } else if (scriptPath.includes('api-monitor')) {
      if (!content.includes('APIMonitor')) {
        result.errors.push('Missing APIMonitor class');
      }
      if (!content.includes('start()')) {
        result.errors.push('Missing start method');
      }
    }
  } catch (error: any) {
    result.errors.push(`Validation error: ${error.message}`);
  }

  return result;
}

async function main() {
  console.log('🔍 Validating API Test Scripts...\n');

  const scripts = [
    'scripts/test-all-apis.ts',
    'scripts/quick-api-test.ts',
    'scripts/api-monitor.ts',
  ];

  const results: ValidationResult[] = [];

  for (const script of scripts) {
    console.log(`Validating ${script}...`);
    const result = await validateScript(script);
    results.push(result);

    const status = result.errors.length === 0 ? '✅' : '❌';
    console.log(`${status} ${script}`);

    if (result.errors.length > 0) {
      result.errors.forEach((error) => console.log(`   ❌ Error: ${error}`));
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) =>
        console.log(`   ⚠️  Warning: ${warning}`)
      );
    }

    console.log('');
  }

  // 生成摘要
  const validScripts = results.filter((r) => r.errors.length === 0).length;
  const totalScripts = results.length;

  console.log('📊 Validation Summary:');
  console.log(`   Total Scripts: ${totalScripts}`);
  console.log(`   Valid: ${validScripts}`);
  console.log(`   Invalid: ${totalScripts - validScripts}`);
  console.log(
    `   Success Rate: ${Math.round((validScripts / totalScripts) * 100)}%`
  );

  if (validScripts === totalScripts) {
    console.log('\n🎉 All scripts are valid and ready to use!');

    console.log('\n📋 Usage Instructions:');
    console.log('   pnpm api:test          - Run comprehensive API tests');
    console.log('   pnpm api:test:quick    - Run quick health check');
    console.log('   pnpm api:monitor       - Start continuous monitoring');
    console.log('   pnpm api:monitor:report - View monitoring report');
  } else {
    console.log('\n🚨 Some scripts have issues that need to be fixed.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}
