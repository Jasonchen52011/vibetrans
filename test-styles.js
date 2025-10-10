// 测试不同风格的翻译效果
async function testStyles() {
  const baseUrl = 'http://localhost:3002';

  const testTexts = [
    'Hello my friend, how are you doing today?',
    'The weather is beautiful and sunny.',
    'I enjoy reading books and learning new things.',
    'Technology is changing our world rapidly.',
  ];

  const styles = ['humor', 'funny', 'absurd', 'chaos'];

  console.log('🎭 测试不同翻译风格的效果\n');

  for (const text of testTexts) {
    console.log(`📝 原文: "${text}"\n`);

    for (const style of styles) {
      try {
        console.log(`  🎨 风格: ${style.toUpperCase()}`);

        const startTime = Date.now();
        const response = await fetch(`${baseUrl}/api/bad-translator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            style: style,
            iterations: 6,
          }),
        });

        const result = await response.json();
        const endTime = Date.now();

        if (result.success) {
          console.log(`    ✅ 结果: "${result.translated}"`);
          console.log(
            `    🔗 语言链: ${result.chain.join(' → ')} (${result.actualSteps} 步)`
          );
          console.log(`    ⏱️  耗时: ${endTime - startTime}ms`);

          // 计算文本变化度
          const similarity = calculateSimilarity(text, result.translated);
          console.log(`    📊 变化度: ${(100 - similarity * 100).toFixed(1)}%`);
        } else {
          console.log(`    ❌ 失败: ${result.error}`);
        }
        console.log('');
      } catch (error) {
        console.error(`    ❌ 请求失败:`, error.message);
      }
    }

    console.log('---\n');
  }

  // 简单的文本相似度计算
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

testStyles().catch(console.error);
