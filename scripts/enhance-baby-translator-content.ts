import path from 'path';
import fs from 'fs/promises';

async function callOpenAI(prompt: string, model = 'gpt-4o'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0].message.content || '';
}

async function enhanceContent() {
  console.log('🚀 增强 Baby Translator 内容（Fun Facts & User Interests）\n');

  // 读取现有的 JSON 文件
  const jsonPath = path.join(
    process.cwd(),
    'messages/pages/baby-translator/en.json'
  );
  const content = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(content);

  // 使用 gpt-4o 生成 Fun Facts
  console.log('📝 生成 Fun Facts 内容...');
  const funFactsPrompt = `As a content expert for a Baby Translator app (AI-powered baby cry analysis tool), write 4 engaging and informative "Fun Facts" about baby crying and communication.

Each fun fact should:
- Be 2-3 sentences long (40-60 words)
- Include surprising or interesting information
- Be educational but accessible
- Relate to baby crying, baby communication, or baby development
- Be engaging and shareable

Format as JSON array:
[
  {
    "title": "Short catchy title (4-7 words)",
    "description": "2-3 sentences of engaging content"
  }
]

Focus on topics like:
- Scientific discoveries about baby cries
- Cultural differences in baby communication
- Historical facts about baby crying research
- Interesting statistics about infant vocal development
- Pop culture references to baby translators`;

  const funFactsText = await callOpenAI(funFactsPrompt);
  const funFactsMatch = funFactsText.match(/\[[\s\S]*\]/);
  const funFacts = funFactsMatch ? JSON.parse(funFactsMatch[0]) : [];

  console.log(`✅ 生成了 ${funFacts.length} 个 Fun Facts\n`);

  // 使用 gpt-4o 生成 User Interests
  console.log('📝 生成 User Interests 内容...');
  const interestsPrompt = `As a content expert for a Baby Translator app (AI-powered baby cry analysis tool), write 6 "User Interests" sections that address common questions and concerns parents have.

Each interest should:
- Have a clear, benefit-focused title (4-7 words)
- Include 2-3 sentences of content (40-60 words)
- Address a specific parent concern or interest
- Be informative and reassuring
- Mention VibeTrans naturally

Format as JSON array:
[
  {
    "title": "Clear, benefit-focused title",
    "description": "2-3 sentences addressing the topic"
  }
]

Cover these topics:
1. How the AI technology works (scientific principles)
2. Privacy and data security concerns
3. Integration with smart home devices
4. Cultural and linguistic considerations
5. Accuracy and reliability
6. Learning and improvement over time`;

  const interestsText = await callOpenAI(interestsPrompt);
  const interestsMatch = interestsText.match(/\[[\s\S]*\]/);
  const interests = interestsMatch ? JSON.parse(interestsMatch[0]) : [];

  console.log(`✅ 生成了 ${interests.length} 个 User Interests\n`);

  // 更新 JSON 文件
  data.BabyTranslatorPage.userScenarios.items = funFacts;
  data.BabyTranslatorPage.unique.items = interests;

  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log('✅ 内容已更新到:', jsonPath);
  console.log('\n📊 摘要:');
  console.log(`   Fun Facts: ${funFacts.length} 项`);
  console.log(`   User Interests: ${interests.length} 项`);
}

enhanceContent().catch(console.error);
