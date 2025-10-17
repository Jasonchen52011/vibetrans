import path from 'path';
import { readFile } from 'fs/promises';

// 简单的 token 估算函数（使用 GPT 的估算规则：1 token ≈ 4 个字符）
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// 提取 JSON 中所有文本内容
function extractAllText(obj: any, prefix = ''): string[] {
  const texts: string[] = [];

  if (typeof obj === 'string') {
    texts.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      texts.push(...extractAllText(item, `${prefix}[${index}]`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      texts.push(...extractAllText(value, prefix ? `${prefix}.${key}` : key));
    });
  }

  return texts;
}

async function countPageTokens(toolSlug: string) {
  const enJsonPath = path.join(
    process.cwd(),
    `messages/pages/${toolSlug}/en.json`
  );

  console.log(`\n📊 Token 统计: ${toolSlug}`);
  console.log('='.repeat(60));

  try {
    // 读取英文翻译文件
    const enContent = await readFile(enJsonPath, 'utf-8');
    const enJson = JSON.parse(enContent);

    // 提取所有文本内容
    const allTexts = extractAllText(enJson);
    const fullText = allTexts.join(' ');

    // 统计各个部分
    const sections: Record<string, { text: string; tokens: number }> = {};

    // 遍历主要部分
    const pageName = Object.keys(enJson)[0];
    const pageData = enJson[pageName];

    // Hero 部分
    if (pageData.hero) {
      const heroText = JSON.stringify(pageData.hero);
      sections['Hero Section'] = {
        text: heroText,
        tokens: estimateTokens(heroText),
      };
    }

    // Tool 部分
    if (pageData.tool) {
      const toolText = JSON.stringify(pageData.tool);
      sections['Tool Component'] = {
        text: toolText,
        tokens: estimateTokens(toolText),
      };
    }

    // What Is 部分
    if (pageData.whatIs) {
      const whatIsText = JSON.stringify(pageData.whatIs);
      sections['What Is Section'] = {
        text: whatIsText,
        tokens: estimateTokens(whatIsText),
      };
    }

    // Examples 部分
    if (pageData.examples) {
      const examplesText = JSON.stringify(pageData.examples);
      sections['Examples Section'] = {
        text: examplesText,
        tokens: estimateTokens(examplesText),
      };
    }

    // How To 部分
    if (pageData.howto) {
      const howtoText = JSON.stringify(pageData.howto);
      sections['How To Section'] = {
        text: howtoText,
        tokens: estimateTokens(howtoText),
      };
    }

    // Fun Facts 部分
    if (pageData.funFacts) {
      const funFactsText = JSON.stringify(pageData.funFacts);
      sections['Fun Facts Section'] = {
        text: funFactsText,
        tokens: estimateTokens(funFactsText),
      };
    }

    // User Interest 部分
    if (pageData.userInterest) {
      const userInterestText = JSON.stringify(pageData.userInterest);
      sections['User Interest Section'] = {
        text: userInterestText,
        tokens: estimateTokens(userInterestText),
      };
    }

    // Highlights 部分
    if (pageData.highlights) {
      const highlightsText = JSON.stringify(pageData.highlights);
      sections['Highlights Section'] = {
        text: highlightsText,
        tokens: estimateTokens(highlightsText),
      };
    }

    // Testimonials 部分
    if (pageData.testimonials) {
      const testimonialsText = JSON.stringify(pageData.testimonials);
      sections['Testimonials Section'] = {
        text: testimonialsText,
        tokens: estimateTokens(testimonialsText),
      };
    }

    // FAQs 部分
    if (pageData.faqs) {
      const faqsText = JSON.stringify(pageData.faqs);
      sections['FAQs Section'] = {
        text: faqsText,
        tokens: estimateTokens(faqsText),
      };
    }

    // CTA 部分
    if (pageData.cta) {
      const ctaText = JSON.stringify(pageData.cta);
      sections['CTA Section'] = {
        text: ctaText,
        tokens: estimateTokens(ctaText),
      };
    }

    // 输出各部分统计
    console.log('\n📝 各部分 Token 统计:');
    console.log('-'.repeat(60));

    let totalTokens = 0;
    Object.entries(sections).forEach(([section, data]) => {
      console.log(
        `${section.padEnd(30)} ${data.tokens.toLocaleString()} tokens`
      );
      totalTokens += data.tokens;
    });

    console.log('-'.repeat(60));
    console.log(`${'总计'.padEnd(30)} ${totalTokens.toLocaleString()} tokens`);

    // 详细统计
    console.log('\n📈 详细信息:');
    console.log('-'.repeat(60));
    console.log(`文件大小: ${enContent.length.toLocaleString()} 字符`);
    console.log(`纯文本内容: ${fullText.length.toLocaleString()} 字符`);
    console.log(`文本片段数: ${allTexts.length} 个`);
    console.log(
      `预估 Token 数: ${estimateTokens(fullText).toLocaleString()} tokens`
    );

    // 成本估算
    const inputCost = (totalTokens / 1000000) * 2.5; // GPT-4o input cost
    const outputCost = (totalTokens / 1000000) * 10; // GPT-4o output cost

    console.log('\n💰 成本估算 (GPT-4o):');
    console.log('-'.repeat(60));
    console.log(`输入成本 ($2.50/1M tokens): $${inputCost.toFixed(4)}`);
    console.log(`输出成本 ($10.00/1M tokens): $${outputCost.toFixed(4)}`);
    console.log(
      `总计 (假设输入+输出): $${(inputCost + outputCost).toFixed(4)}`
    );

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  }
}

// 从命令行参数获取工具 slug
const toolSlug = process.argv[2];

if (!toolSlug) {
  console.error('用法: tsx scripts/count-page-tokens.ts <tool-slug>');
  console.error('示例: tsx scripts/count-page-tokens.ts albanian-to-english');
  process.exit(1);
}

countPageTokens(toolSlug).catch(console.error);
