#!/usr/bin/env node

/**
 * UI Changes Comprehensive Test Script
 *
 * This script provides a systematic approach to test all UI changes made:
 * 1. Global font adjustment to satoshi
 * 2. Toolbar width increase (max-w-5xl to max-w-7xl)
 * 3. Tool right content format unification
 * 4. Global CTA button arrow icons
 * 5. "Explore more Translator Tools" text and style updates
 * 6. Back to top functionality
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

// Test categories with detailed steps
const testCategories = [
  {
    id: 'font',
    name: '全局字体测试 (Global Font Test)',
    description: '验证satoshi字体是否正确加载和应用',
    steps: [
      {
        description: '检查字体文件是否存在',
        action:
          '检查 src/fonts/satoshi-regular.woff2 和 src/fonts/satoshi-bold.woff2 文件',
        verification: '文件应存在于 src/fonts/ 目录中',
        command: 'ls -la src/fonts/satoshi-*.woff2',
      },
      {
        description: '检查layout.tsx字体配置',
        action: '检查 src/app/[locale]/layout.tsx 中的字体配置',
        verification: '应有 satoshi 变量的定义和在 body 中的应用',
        inspectFile: 'src/app/[locale]/layout.tsx',
        searchText: 'const satoshi',
      },
      {
        description: '检查全局CSS变量',
        action: '检查 src/app/globals.css 中的字体变量定义',
        verification: '应有 --font-sans 变量指向 satoshi 字体',
        inspectFile: 'src/app/globals.css',
        searchText: '--font-sans',
      },
      {
        description: '验证页面字体应用',
        action: '在浏览器中访问任意工具页面，检查字体',
        verification:
          '页面文本应使用 satoshi 字体，可通过开发者工具检查 computed styles',
        pages: ['/', '/pig-latin-translator', '/spanish-to-english'],
      },
    ],
  },
  {
    id: 'layout-width',
    name: '布局宽度测试 (Layout Width Test)',
    description: '验证工具页面容器宽度是否正确增大',
    steps: [
      {
        description: '检查工具页面容器宽度',
        action: '检查工具页面的主容器宽度类名',
        verification: '应从 max-w-5xl 改为 max-w-7xl',
        files: [
          'src/app/[locale]/tools/*/page.tsx',
          'src/components/tools/*Tool.tsx',
        ],
        searchText: 'max-w-7xl',
        oldText: 'max-w-5xl',
      },
      {
        description: '验证响应式行为',
        action: '在不同屏幕尺寸下检查布局',
        verification: '在小屏幕上应正确响应，大屏幕上应显示更宽的内容',
        screenSize: ['1920x1080', '1366x768', '768x1024'],
      },
    ],
  },
  {
    id: 'style-consistency',
    name: '样式一致性测试 (Style Consistency Test)',
    description: '验证工具左右两侧样式是否统一',
    steps: [
      {
        description: '检查右侧边框样式',
        action: '检查工具页面的右侧边框样式',
        verification: '应有正确的边框样式和CSS类名',
        files: ['src/components/tools/*Tool.tsx'],
        searchText: 'border-r',
      },
      {
        description: '检查CSS类名拼写',
        action: '确保所有CSS类名拼写正确',
        verification: '不应有拼写错误的CSS类名',
        checkFiles: ['src/components/tools/*Tool.tsx'],
        commonErrors: ['boder-r', 'borer-r', 'border-rigth'],
      },
      {
        description: '验证左右两侧对称性',
        action: '检查工具页面左右两侧的视觉平衡',
        verification: '左右两侧应有良好的视觉对称性和间距',
        visualCheck: true,
      },
    ],
  },
  {
    id: 'cta-buttons',
    name: 'CTA按钮图标测试 (CTA Button Icons Test)',
    description: '验证重要CTA按钮是否有箭头图标',
    steps: [
      {
        description: '检查CTA按钮图标导入',
        action: '检查ArrowRightIcon的导入和使用',
        verification: '应有正确的import语句和图标使用',
        files: [
          'src/components/tools/SpanishToEnglishTool.tsx',
          'src/components/tools/PigLatinTool.tsx',
        ],
        searchText: 'ArrowRightIcon',
      },
      {
        description: '验证11个重要CTA按钮',
        action: '检查每个重要CTA按钮是否包含箭头图标',
        verification: '所有指定的CTA按钮都应有ArrowRightIcon',
        buttons: [
          'Spanish to English - Translate Button',
          'Pig Latin Translator - Translate Button',
          'French to English - Translate Button',
          'German to English - Translate Button',
          'Italian to English - Translate Button',
          'Portuguese to English - Translate Button',
          'Russian to English - Translate Button',
          'Japanese to English - Translate Button',
          'Chinese to English - Translate Button',
          'Korean to English - Translate Button',
          'Arabic to English - Translate Button',
        ],
      },
      {
        description: '检查图标样式',
        action: '验证箭头图标的样式和大小',
        verification: '图标应有合适的大小和颜色，与按钮文本协调',
        checkClasses: ['w-5', 'h-5', 'ml-2'],
      },
    ],
  },
  {
    id: 'text-content',
    name: '文本内容测试 (Text Content Test)',
    description: '验证"Explore more Translator Tools"文本是否正确显示',
    steps: [
      {
        description: '检查Explore工具链接文本',
        action: '检查"Explore Other AI Tools"文本的更改',
        verification: '应改为"Explore more Translator Tools"',
        files: ['src/components/tools/*Tool.tsx'],
        searchText: 'Explore more Translator Tools',
        oldText: 'Explore Other AI Tools',
      },
      {
        description: '检查相关样式更改',
        action: '验证相关样式和间距的更改',
        verification: '应有适当的间距和样式调整',
        checkClasses: ['gap-2', 'items-center'],
      },
      {
        description: '验证多语言支持',
        action: '检查中英文版本的一致性',
        verification: '中英文版本都应正确显示相应的文本',
        languages: ['en', 'zh'],
      },
    ],
  },
  {
    id: 'back-to-top',
    name: '回到顶部功能测试 (Back to Top Test)',
    description: '验证回到顶部按钮是否正常工作',
    steps: [
      {
        description: '检查BackToTop组件',
        action: '检查BackToTop组件的存在和实现',
        verification: '应有 src/components/BackToTop.tsx 文件',
        inspectFile: 'src/components/BackToTop.tsx',
        searchText: 'BackToTop',
      },
      {
        description: '检查组件功能',
        action: '验证组件的功能实现',
        verification: '应有滚动监听和回到顶部的功能',
        checkFunctions: ['useEffect', 'scrollTo', 'useState'],
      },
      {
        description: '检查组件使用',
        action: '检查组件在工具页面中的使用',
        verification: '应在工具页面中正确导入和使用',
        files: ['src/components/tools/*Tool.tsx'],
        searchText: 'BackToTop',
      },
      {
        description: '测试交互功能',
        action: '在浏览器中测试按钮的显示和点击功能',
        verification: '向下滚动时按钮应显示，点击应平滑回到顶部',
        interactiveTest: true,
      },
    ],
  },
];

// Main testing function
async function runTests() {
  console.log(colors.cyan + colors.bright);
  console.log('='.repeat(60));
  console.log('🎨 UI Changes Comprehensive Test Suite');
  console.log('='.repeat(60));
  console.log(colors.reset);

  console.log(colors.yellow + '\n📋 测试概览 (Test Overview):' + colors.reset);
  console.log('本测试套件将验证以下UI更改:');
  console.log('1. ✨ 全局字体调整为 satoshi');
  console.log('2. 📏 工具栏宽度增大 (max-w-5xl → max-w-7xl)');
  console.log('3. 🎨 工具右侧内容格式统一');
  console.log('4. ➡️ 全局CTA按钮添加箭头图标');
  console.log('5. 📝 更新"Explore more Translator Tools"文本');
  console.log('6. ⬆️ 添加回到顶部功能');

  console.log(colors.yellow + '\n⚠️  开始测试前请确认:' + colors.reset);
  console.log('• 开发服务器正在运行 (pnpm dev)');
  console.log('• 浏览器可以访问 http://localhost:3000');
  console.log('• 所有文件更改已保存');

  await askQuestion('\n按 Enter 键开始测试...');

  for (const category of testCategories) {
    await testCategory(category);
  }

  console.log(colors.green + colors.bright);
  console.log('\n' + '='.repeat(60));
  console.log('🎉 测试完成!');
  console.log('='.repeat(60));
  console.log(colors.reset);

  console.log('\n📊 测试总结:');
  console.log('如果所有测试都通过，UI更改已成功实施!');
  console.log('如果有测试失败，请查看上述详细信息进行修复。');

  await askQuestion('\n按 Enter 键退出...');
  rl.close();
}

// Test individual category
async function testCategory(category) {
  console.log(colors.blue + colors.bright);
  console.log(`\n🧪 ${category.name}`);
  console.log('─'.repeat(50));
  console.log(colors.reset);
  console.log(colors.cyan + category.description + colors.reset);

  let passedTests = 0;
  const totalTests = category.steps.length;

  for (let i = 0; i < category.steps.length; i++) {
    const step = category.steps[i];
    console.log(
      colors.yellow + `\n${i + 1}. ${step.description}` + colors.reset
    );

    console.log(`   📝 操作: ${step.action}`);
    console.log(`   ✅ 验证: ${step.verification}`);

    let testPassed = false;

    try {
      if (step.command) {
        console.log(
          colors.magenta + `   💻 执行命令: ${step.command}` + colors.reset
        );
        const result = execSync(step.command, {
          encoding: 'utf8',
          cwd: process.cwd(),
        });
        console.log(colors.green + `   ✓ 命令执行成功` + colors.reset);
        if (result.trim()) {
          console.log(
            colors.green + `   输出: ${result.trim()}` + colors.reset
          );
        }
        testPassed = true;
      }

      if (step.inspectFile) {
        console.log(
          colors.magenta + `   🔍 检查文件: ${step.inspectFile}` + colors.reset
        );
        const fs = require('fs');
        if (fs.existsSync(step.inspectFile)) {
          const content = fs.readFileSync(step.inspectFile, 'utf8');
          if (step.searchText && content.includes(step.searchText)) {
            console.log(
              colors.green +
                `   ✓ 找到预期内容: "${step.searchText}"` +
                colors.reset
            );
            testPassed = true;
          } else if (step.searchText) {
            console.log(
              colors.red +
                `   ✗ 未找到预期内容: "${step.searchText}"` +
                colors.reset
            );
          }
        } else {
          console.log(
            colors.red + `   ✗ 文件不存在: ${step.inspectFile}` + colors.reset
          );
        }
      }

      if (step.files) {
        console.log(
          colors.magenta + `   📁 检查文件模式: ${step.files}` + colors.reset
        );
        const glob = require('glob');
        const files = glob.sync(step.files[0]);
        for (const file of files) {
          const fs = require('fs');
          const content = fs.readFileSync(file, 'utf8');
          if (step.searchText && content.includes(step.searchText)) {
            console.log(
              colors.green + `   ✓ ${file} 包含预期内容` + colors.reset
            );
            testPassed = true;
          }
          if (step.oldText && !content.includes(step.oldText)) {
            console.log(
              colors.green + `   ✓ ${file} 不包含旧内容` + colors.reset
            );
          }
        }
      }

      if (step.interactiveTest) {
        console.log(colors.magenta + `   🖱️  需要手动测试` + colors.reset);
        testPassed = await askForManualTest(step);
      }

      if (step.visualCheck) {
        console.log(colors.magenta + `   👀 需要视觉检查` + colors.reset);
        testPassed = await askForVisualCheck(step);
      }

      if (step.buttons) {
        console.log(
          colors.magenta +
            `   🔘 检查按钮: ${step.buttons.length} 个CTA按钮` +
            colors.reset
        );
        testPassed = await askForButtonCheck(step.buttons);
      }

      if (step.pages) {
        console.log(
          colors.magenta +
            `   🌐 需要检查页面: ${step.pages.join(', ')}` +
            colors.reset
        );
        testPassed = await askForPageCheck(step.pages);
      }
    } catch (error) {
      console.log(
        colors.red + `   ❌ 测试失败: ${error.message}` + colors.reset
      );
    }

    if (testPassed) {
      passedTests++;
      console.log(colors.green + `   ✅ 测试通过` + colors.reset);
    } else {
      console.log(colors.red + `   ❌ 测试失败或需要手动验证` + colors.reset);
    }

    if (i < category.steps.length - 1) {
      await askQuestion('   按 Enter 继续...');
    }
  }

  console.log(
    colors.blue +
      `\n📊 ${category.name} 结果: ${passedTests}/${totalTests} 测试通过` +
      colors.reset
  );
}

// Helper functions for interactive testing
function askForManualTest(step) {
  return new Promise((resolve) => {
    rl.question(`   请手动测试: ${step.description} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function askForVisualCheck(step) {
  return new Promise((resolve) => {
    rl.question(`   请视觉检查: ${step.description} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function askForButtonCheck(buttons) {
  return new Promise((resolve) => {
    console.log(
      colors.magenta + `   请检查以下按钮是否包含箭头图标:` + colors.reset
    );
    buttons.forEach((button, index) => {
      console.log(`   ${index + 1}. ${button}`);
    });
    rl.question(`   所有按钮都有箭头图标吗? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function askForPageCheck(pages) {
  return new Promise((resolve) => {
    console.log(colors.magenta + `   请检查以下页面:` + colors.reset);
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. http://localhost:3000${page}`);
    });
    rl.question(`   页面显示是否正常? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, () => {
      resolve();
    });
  });
}

// Run the test suite
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testCategories };
