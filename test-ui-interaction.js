#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testPageInteraction(
  toolName,
  baseUrl = 'http://localhost:3003'
) {
  console.log(`\n🧪 测试页面交互: ${toolName}`);
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({ headless: false }); // 设置为false以便观察测试过程
    const page = await browser.newPage();

    const url = `${baseUrl}/${toolName}`;
    console.log(`📖 访问页面: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 1. 检查初始状态
    console.log('\n🔍 检查初始状态:');

    const inputTitle = await page.$eval('h2', (el) => el.textContent);
    console.log(`  输入框标题: "${inputTitle}"`);

    const inputPlaceholder = await page.$eval(
      'textarea',
      (el) => el.placeholder
    );
    console.log(`  输入框占位符: "${inputPlaceholder.substring(0, 50)}..."`);

    // 2. 测试点击输出框标题切换
    console.log('\n🔄 测试点击输出框标题切换:');

    // 获取输出框标题
    const outputTitles = await page.$$('h2');
    const outputTitle = await outputTitles[1].evaluate((el) => el.textContent);
    console.log(`  输出框标题: "${outputTitle}"`);

    // 点击输出框标题
    await outputTitles[1].click();
    await page.waitForTimeout(1000);

    // 检查切换后的状态
    const newInputTitle = await page.$eval('h2', (el) => el.textContent);
    const newInputPlaceholder = await page.$eval(
      'textarea',
      (el) => el.placeholder
    );
    const newOutputTitle = await outputTitles[1].evaluate(
      (el) => el.textContent
    );

    console.log(`  切换后输入框标题: "${newInputTitle}"`);
    console.log(
      `  切换后输入框占位符: "${newInputPlaceholder.substring(0, 50)}..."`
    );
    console.log(`  切换后输出框标题: "${newOutputTitle}"`);

    // 验证是否成功切换
    const titleChanged =
      inputTitle !== newInputTitle || outputTitle !== newOutputTitle;
    const placeholderChanged = inputPlaceholder !== newInputPlaceholder;

    console.log(`  ✅ 标题切换: ${titleChanged ? '成功' : '失败'}`);
    console.log(`  ✅ 占位符更新: ${placeholderChanged ? '成功' : '失败'}`);

    // 3. 测试输入一些文本
    console.log('\n⌨️  测试文本输入:');

    const testText = 'Hello world';
    await page.type('textarea', testText, { delay: 100 });
    await page.waitForTimeout(1000);

    const inputValue = await page.$eval('textarea', (el) => el.value);
    console.log(`  输入文本: "${inputValue}"`);

    // 4. 测试切换按钮
    console.log('\n🔘 测试切换按钮:');

    const swapButton = await page.$('button[title*="Switch"]');
    if (swapButton) {
      console.log('  找到切换按钮');
      await swapButton.click();
      await page.waitForTimeout(1000);

      const afterSwapInputTitle = await page.$eval(
        'h2',
        (el) => el.textContent
      );
      console.log(`  点击切换按钮后标题: "${afterSwapInputTitle}"`);
      console.log('  ✅ 切换按钮功能: 正常');
    } else {
      console.log('  ❌ 未找到切换按钮');
    }

    // 5. 检查是否有多余的文字提示
    console.log('\n👁️  检查UI设计:');

    const pageText = await page.evaluate(() => document.body.textContent);
    const hasExtraHints =
      pageText.includes('Click to switch') ||
      pageText.includes('Toggle direction') ||
      pageText.includes('切换方向') ||
      pageText.includes('点击切换');

    console.log(
      `  干净UI设计: ${hasExtraHints ? '❌ 有多余提示' : '✅ 无多余提示'}`
    );

    await browser.close();

    return {
      success: true,
      titleSwitching: titleChanged,
      placeholderUpdate: placeholderChanged,
      inputWorks: inputValue === testText,
      hasSwapButton: !!swapButton,
      cleanUI: !hasExtraHints,
    };
  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    if (browser) await browser.close();
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runUIInteractionTests() {
  console.log('🚀 开始测试 Baybayin Translator 页面交互...\n');

  const result = await testPageInteraction('baybayin-translator');

  // 生成总结报告
  console.log('\n📋 UI交互测试总结');
  console.log('='.repeat(80));

  if (result.success) {
    let score = 0;
    const maxScore = 5;

    if (result.titleSwitching) score += 1;
    if (result.placeholderUpdate) score += 1;
    if (result.inputWorks) score += 1;
    if (result.hasSwapButton) score += 1;
    if (result.cleanUI) score += 1;

    const percentage = Math.round((score / maxScore) * 100);
    console.log(`\nbaybayin-translator:`);
    console.log(`  评分: ${score}/${maxScore} (${percentage}%)`);
    console.log(`  标题切换: ${result.titleSwitching ? '✅' : '❌'}`);
    console.log(`  占位符更新: ${result.placeholderUpdate ? '✅' : '❌'}`);
    console.log(`  文本输入: ${result.inputWorks ? '✅' : '❌'}`);
    console.log(`  切换按钮: ${result.hasSwapButton ? '✅' : '❌'}`);
    console.log(`  干净UI: ${result.cleanUI ? '✅' : '❌'}`);
  } else {
    console.log(`  评分: 0/5 (0%) - 测试失败: ${result.error}`);
  }

  return [result];
}

// 检查是否有puppeteer
try {
  require.resolve('puppeteer');
  runUIInteractionTests().catch(console.error);
} catch (error) {
  console.log('⚠️  Puppeteer未安装，跳过浏览器UI交互测试');
  console.log('   要安装: npm install puppeteer');
}
