#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function callOpenAI(model, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const requestBody = { model, messages, temperature: 0.3 };

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

const englishContent = {
  funFacts: [
    {
      title: 'Unexpected Humor Alert!',
      description:
        "I love it when VibeTrans' verbose generator tosses in surprise jokes or 'blah blah' lines. It's like a digital comedian! Makes you chuckle while you work. Who knew writing could be so entertaining?",
    },
    {
      title: 'Easter Egg Enthusiast',
      description:
        "Some say the verbose generator hides Easter eggs in text. It's like a treasure hunt! Discover quirky phrases and witty lines. I find it adds a whimsical twist to writing—pure fun!",
    },
  ],
  userInterest: [
    {
      title: 'Customize Your Verbosity',
      description:
        'Want more or less verbosity? Adjust settings to match your vibe! VibeTrans lets you tweak for brevity or verbosity. I suggest experimenting with templates to find your sweet spot.',
    },
    {
      title: 'Decode the Tech Magic',
      description:
        "Curious about the tech behind VibeTrans? It's like uncovering a magician's secrets! Learn algorithms that craft verbose magic. I find understanding the tech makes using it even cooler!",
    },
    {
      title: 'Real-Life Use Cases',
      description:
        "From essays to docs, VibeTrans fits all. See it shine in real scenarios! I recommend trying it for academic and dev writing. It's your trusty sidekick in the writing world!",
    },
    {
      title: 'SEO and Verbose Balance',
      description:
        'Worried about SEO? VibeTrans finds the balance. Keep content rich yet readable. I suggest keeping an eye on keyword density to ensure your content ranks and reads well!',
    },
  ],
};

const prompt = `请将以下英文内容翻译成中文，保持口语化和幽默感，品牌名 VibeTrans 保持不变：

${JSON.stringify(englishContent, null, 2)}

请以 JSON 格式返回翻译结果，格式与输入相同。`;

const result = await callOpenAI('gpt-4o', [{ role: 'user', content: prompt }]);
console.log(result);
