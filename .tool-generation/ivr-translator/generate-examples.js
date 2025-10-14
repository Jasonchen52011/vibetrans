#!/usr/bin/env node

/**
 * Generate 6 IVR translation examples using GPT-4o
 */

const fs = require('fs/promises');
const path = require('path');

const prompt = `Create 6 diverse IVR (Interactive Voice Response) translation examples for an "IVR Translator" tool.

Each example should show:
1. A short IVR prompt in English (10-20 words)
2. The translated version in a different language (can be shown as concept, not actual translation)
3. Context about what type of IVR scenario it is

Requirements:
- Examples should cover diverse scenarios: banking, healthcare, e-commerce, customer service, tech support, government services
- Show transformation from English IVR script to multilingual support
- Focus on practical, real-world IVR use cases
- Each example should have a category and brief description

Format your response as a JSON array with 6 objects, each having:
{
  "name": "Category: Brief title",
  "alt": "English IVR prompt → Translated concept description"
}

Example format:
{
  "name": "Banking: Account balance inquiry",
  "alt": "Press 1 for balance → Multilingual menu with 5 languages"
}

Make them practical, diverse, and representative of real IVR translation needs.`;

async function generateExamples() {
  console.log('🎯 Generating IVR translation examples using GPT-4o...\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in IVR systems, multilingual customer support, and call center automation. Generate practical, diverse IVR translation examples.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.choices) {
    console.error('API Error:', JSON.stringify(data, null, 2));
    throw new Error(
      `API request failed: ${data.error?.message || 'Unknown error'}`
    );
  }

  const responseText = data.choices[0].message.content;
  console.log('📄 Raw response:\n', responseText, '\n');

  // Extract JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON array in response');
  }

  const examples = JSON.parse(jsonMatch[0]);
  console.log('✅ Parsed examples:', JSON.stringify(examples, null, 2), '\n');

  // Save to file
  const outputPath = path.join(
    process.cwd(),
    '.tool-generation/ivr-translator/examples.json'
  );
  await fs.writeFile(outputPath, JSON.stringify(examples, null, 2));
  console.log(`💾 Saved examples to: ${outputPath}`);

  return examples;
}

generateExamples().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
