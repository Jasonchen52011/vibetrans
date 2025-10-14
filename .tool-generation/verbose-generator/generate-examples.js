#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function callOpenAI(model, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const requestBody = { model, messages, temperature: 0.7 };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

const prompt = `You are a creative English content writer. Create 6 verbose translation examples for a "Verbose Generator" tool.

Each example should show:
1. A short, simple input (5-10 words)
2. A verbose, elaborated output (30-50 words)
3. Context/explanation of how it's used

Requirements:
- Examples should be diverse (business, academic, casual, creative contexts)
- Show clear transformation from concise to verbose
- Make the verbose version natural and useful, not just wordy
- Include practical scenarios

Format as JSON:
\`\`\`json
[
  {
    "input": "short input text",
    "output": "verbose elaborated version with more details and explanation",
    "context": "When to use this / Why this is helpful"
  }
]
\`\`\`

Create 6 creative examples that demonstrate the power of verbose generation.`;

const result = await callOpenAI('gpt-4o', [{ role: 'user', content: prompt }]);
console.log(result);
