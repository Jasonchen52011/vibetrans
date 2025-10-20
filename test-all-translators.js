#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://localhost:3001';

// 所有翻译器页面路由
const translatorRoutes = [
  '/dog-translator',
  '/gen-z-translator',
  '/gen-alpha-translator',
  '/bad-translator',
  '/baby-translator',
  '/gibberish-translator',
  '/ancient-greek-translator',
  '/al-bhed-translator',
  '/alien-text-generator',
  '/esperanto-translator',
  '/cuneiform-translator',
  '/ivr-translator',
  '/creole-to-english-translator',
  '/pig-latin-translator',
  '/cantonese-translator',
  '/chinese-to-english-translator',
  '/middle-english-translator',
  '/minion-translator',
  '/baybayin-translator',
  '/samoan-to-english-translator',
  '/gaster-translator',
  '/high-valyrian-translator',
  '/aramaic-translator',
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testTranslatorPages() {
  console.log('🚀 测试所有翻译器页面...\n');
  console.log(`📍 服务器地址: ${BASE_URL}\n`);

  const workingPages = [];
  const failedPages = [];

  console.log('📄 测试页面状态:');
  for (const route of translatorRoutes) {
    try {
      const response = await makeRequest(route);

      if (response.statusCode === 200) {
        console.log(`  ✅ ${route} - 工作正常 (200)`);
        workingPages.push(route);
      } else if (response.statusCode === 404) {
        console.log(`  ❌ ${route} - 页面未找到 (404)`);
        failedPages.push(route);
      } else {
        console.log(`  ⚠️  ${route} - 状态码: ${response.statusCode}`);
        failedPages.push(route);
      }
    } catch (error) {
      console.log(`  ❌ ${route} - 连接错误: ${error.message}`);
      failedPages.push(route);
    }
  }

  console.log('\n📊 测试总结:');
  console.log(`✅ 工作正常的页面: ${workingPages.length}`);
  console.log(`❌ 有问题的页面: ${failedPages.length}`);

  if (failedPages.length > 0) {
    console.log('\n🔍 需要修复的页面:');
    failedPages.forEach((page) => {
      console.log(`  - ${page}`);
    });
  }

  if (workingPages.length === translatorRoutes.length) {
    console.log('\n🎉 所有翻译器页面都工作正常！');
  }
}

// 检查服务器是否可用
async function checkServer() {
  try {
    console.log('🔍 检查服务器是否可用...');
    await makeRequest('/');
    return true;
  } catch (error) {
    console.log('❌ 服务器不可用');
    console.log(`   地址应该是: ${BASE_URL}`);
    return false;
  }
}

async function main() {
  const serverAvailable = await checkServer();
  if (!serverAvailable) {
    process.exit(1);
  }

  console.log('');
  await testTranslatorPages();
}

main().catch(console.error);
