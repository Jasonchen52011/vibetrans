const puppeteer = require('puppeteer');

async function testWebsite() {
  console.log('启动浏览器测试...');

  const browser = await puppeteer.launch({
    headless: false, // 设置为false以查看浏览器
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    // 监听控制台消息
    page.on('console', msg => {
      console.log('页面控制台:', msg.type(), msg.text());
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.error('页面错误:', error.message);
    });

    // 监听请求失败
    page.on('requestfailed', request => {
      console.error('请求失败:', request.url(), request.failure().errorText);
    });

    console.log('访问 http://localhost:3001');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);

    // 检查navbar是否存在
    const navbar = await page.$('nav');
    console.log('Navbar存在:', !!navbar);

    // 检查logo是否存在
    const logo = await page.$('img[alt*="VibeTrans"], img[alt*="logo"], .logo');
    console.log('Logo存在:', !!logo);

    // 检查主要组件
    const heroSection = await page.$('[class*="hero"], [id*="hero"]');
    console.log('Hero Section存在:', !!heroSection);

    const whatIsSection = await page.$('[class*="what"], [id*="what"]');
    console.log('What Is Section存在:', !!whatIsSection);

    // 检查页面内容
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('页面内容长度:', bodyText.length);

    // 检查是否有404错误
    const has404Content = bodyText.includes('404') || bodyText.includes('Page not found');
    console.log('包含404内容:', has404Content);

    // 检查翻译错误
    const hasTranslationError = bodyText.includes('Missing translation') ||
                                bodyText.includes('Translation key') ||
                                bodyText.includes('t(');
    console.log('包含翻译错误:', hasTranslationError);

    // 截图
    await page.screenshot({ path: 'website-test-screenshot.png', fullPage: true });
    console.log('截图已保存为 website-test-screenshot.png');

    // 检查网络请求状态
    const performanceMetrics = await page.metrics();
    console.log('性能指标:', {
      timestamp: performanceMetrics.timestamp,
      documents: performanceMetrics.Documents,
      frames: performanceMetrics.Frames,
      jsHeapUsedSize: performanceMetrics.JSHeapUsedSize,
      jsHeapTotalSize: performanceMetrics.JSHeapTotalSize
    });

  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await browser.close();
    console.log('浏览器已关闭');
  }
}

testWebsite().catch(console.error);