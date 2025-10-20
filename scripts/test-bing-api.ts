#!/usr/bin/env tsx

/**
 * Bing API 测试脚本
 * 验证 Bing API Key 是否有效
 */

async function testBingAPI() {
  const bingApiKey = process.env.BING_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibetrans.com';

  console.log('🔍 Testing Bing API...');
  console.log(`API Key: ${bingApiKey ? '***configured***' : 'NOT SET'}`);
  console.log(`Site URL: ${siteUrl}`);

  if (!bingApiKey) {
    console.error('❌ Bing API Key not found in environment variables');
    return;
  }

  // 测试 Bing API
  const bingApiUrl = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?url=${encodeURIComponent(siteUrl)}&apikey=${bingApiKey}`;

  try {
    console.log('\n📤 Submitting to Bing API...');
    const response = await fetch(bingApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans SEO Bot)',
      },
    });

    const responseText = await response.text();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response: ${responseText}`);

    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        if (result.d === true) {
          console.log('✅ Bing API submission: SUCCESS');
        } else {
          console.log('❌ Bing API submission: FAILED');
          console.log('Result:', result);
        }
      } catch (parseError) {
        console.log('⚠️ Bing API returned non-JSON response');
        console.log('Raw response:', responseText);
      }
    } else {
      console.log('❌ Bing API request failed');

      // 分析常见错误
      if (response.status === 400) {
        console.log('💡 Possible causes:');
        console.log('   - API Key is invalid or expired');
        console.log('   - Website not verified in Bing Webmaster Tools');
        console.log('   - Invalid URL format');
      } else if (response.status === 401) {
        console.log('💡 Possible causes:');
        console.log('   - API Key is incorrect');
        console.log('   - Authentication failed');
      } else if (response.status === 403) {
        console.log('💡 Possible causes:');
        console.log('   - API Key permissions insufficient');
        console.log('   - Rate limit exceeded');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// 测试 Bing Webmaster Tools 网站验证状态
async function testBingVerification() {
  console.log('\n🔍 Testing Bing Webmaster Tools verification...');

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibetrans.com';
  const verificationUrl = `https://www.bing.com/webmaster/api.svc/json/GetVerificationDetails?siteUrl=${encodeURIComponent(siteUrl)}`;

  try {
    const response = await fetch(verificationUrl);
    console.log(`Verification check status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('Verification details:', result);
    } else {
      console.log('Could not verify website status');
    }
  } catch (error) {
    console.log('Verification check failed:', error);
  }
}

async function main() {
  console.log('🌐 Bing API Test Suite');
  console.log('======================');

  await testBingAPI();
  await testBingVerification();

  console.log('\n📋 Next steps:');
  console.log('1. Ensure website is verified in Bing Webmaster Tools');
  console.log('2. Check if API Key has correct permissions');
  console.log('3. Verify website URL is correct');
  console.log('4. Check Bing Webmaster Tools API documentation');
}

if (require.main === module) {
  main().catch(console.error);
}

export { testBingAPI };
