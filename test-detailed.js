// 更详细的测试来理解翻译行为
async function detailedTest() {
  const baseUrl = 'http://localhost:3002';

  console.log('🔍 详细翻译分析测试\n');

  // 测试简单句子的多语言翻译路径
  const testText = 'Good morning';
  console.log(`测试文本: "${testText}"`);

  // 手动构建翻译链来测试
  const languages = ['zh', 'ja', 'fr', 'de', 'es'];

  for (const lang of languages) {
    try {
      console.log(`\n🌐 测试 en → ${lang}`);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(testText)}&langpair=en|${lang}`
      );
      const result = await response.json();

      if (result.responseStatus === 200) {
        console.log(`  结果: "${result.responseData.translatedText}"`);

        // 测试回译
        const backResponse = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(result.responseData.translatedText)}&langpair=${lang}|en`
        );
        const backResult = await backResponse.json();

        if (backResult.responseStatus === 200) {
          console.log(`  回译: "${backResult.responseData.translatedText}"`);
        }
      }
    } catch (error) {
      console.error(`  ❌ 翻译失败:`, error.message);
    }
  }

  // 测试我们的 API 的多步翻译
  console.log('\n🔄 测试多步翻译链:');

  try {
    const response = await fetch(`${baseUrl}/api/bad-translator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        style: 'chaos',
        iterations: 8,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`原文: "${result.original}"`);
      console.log(`最终: "${result.translated}"`);
      console.log(`语言链: [${result.chain.join(' → ')}]`);

      console.log('\n详细步骤:');
      result.translationSteps.forEach((step, index) => {
        console.log(
          `${index + 1}. ${step.from} → ${step.to}: "${step.intermediateResult}"`
        );
      });
    }
  } catch (error) {
    console.error('❌ 多步翻译失败:', error.message);
  }
}

detailedTest().catch(console.error);
