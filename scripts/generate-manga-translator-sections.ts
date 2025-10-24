#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

interface SectionImage {
  filename: string;
  title: string;
  basePrompt: string;
}

const mangaTranslatorSections: SectionImage[] = [
  {
    filename: 'manga-translator-fact-1',
    title: 'Scanlation Origins',
    basePrompt:
      'Illustration showing the evolution of manga scanlation culture from early fan communities to modern digital translation tools.',
  },
  {
    filename: 'manga-translator-fact-2',
    title: 'Manga Reading Habits',
    basePrompt:
      'Historical illustration showing how Western readers adapted to reading manga in right-to-left format, preserving authentic Japanese layout.',
  },
  {
    filename: 'manga-translator-interest-1',
    title: 'Anime Fans',
    basePrompt:
      'Modern illustration showing diverse anime fans using AI-powered manga translation tools on digital devices.',
  },
  {
    filename: 'manga-translator-interest-2',
    title: 'Language Learners',
    basePrompt:
      'Educational illustration showing students of various ages learning Japanese through manga context with language learning tools.',
  },
  {
    filename: 'manga-translator-interest-3',
    title: 'Content Creators',
    basePrompt:
      'Creative illustration showing content creators producing translated manga content for digital platforms.',
  },
  {
    filename: 'manga-translator-interest-4',
    title: 'Cultural Exchange',
    basePrompt:
      'Illustration depicting cultural exchange between Japanese creators and international fans through translated manga works.',
  },
];

// Generate detailed prompt using Gemini
async function generateDetailedPrompt(
  basePrompt: string,
  title: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const geminiPrompt = `你是一个专业的图像提示词生成专家。基于以下基础描述，生成一个详细、生动的英文图像生成提示词，用于AI图像生成。

标题：${title}
基础描述：${basePrompt}

请生成一个详细的提示词，包含：
1. 具体的视觉元素和细节
2. 色彩搭配和风格指导
3. 构图和视角建议
4. 情感和氛围描述
5. 适合图像生成AI的英文表达

要求：
- 提示词必须是英文
- 长度在150-250词之间
- 描述要具体且富有创意
- 避免任何不当或有害内容
- 确保提示词适合生成高质量的商业图像

请直接返回优化后的英文提示词，不要包含其他解释文字。`;

  try {
    const result = await model.generateContent(geminiPrompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error('❌ Failed to generate prompt with Gemini:', error);
    // Fallback to a basic prompt if Gemini fails
    return `${basePrompt} Style: professional illustration with vibrant colors and clean composition.`;
  }
}

async function generateMangaImages() {
  console.log('🎨 Generating manga translator section images...\n');

  for (let i = 0; i < mangaTranslatorSections.length; i++) {
    const section = mangaTranslatorSections[i];
    console.log(`🎯 Processing: ${section.title}`);
    console.log('-'.repeat(60));

    try {
      console.log('📋 Step 1: Generating detailed prompt with Gemini...');

      const detailedPrompt = await generateDetailedPrompt(
        section.basePrompt,
        section.title
      );
      console.log('✅ Detailed prompt generated successfully');
      console.log(
        '📝 Prompt preview:',
        detailedPrompt.substring(0, 100) + '...'
      );

      console.log('📋 Step 2: Generating image with Volcano 4.0 API...');

      const result = await generateVolcanoImage({
        prompt: detailedPrompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const url = result.data[0].url;
      console.log('✅ Image generated:', url);

      console.log('📋 Step 3: Downloading and converting to WebP...');
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());

      await sharp(buffer)
        .webp({ quality: 85, effort: 6 })
        .toFile(`public/images/docs/${section.filename}.webp`);

      console.log(
        `✅ Image saved: public/images/docs/${section.filename}.webp`
      );

      if (i < mangaTranslatorSections.length - 1) {
        console.log('⏱️  Waiting 5 seconds before next request...\n');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to generate ${section.filename}:`,
        error.message
      );
      continue;
    }

    console.log('-'.repeat(60));
    console.log(`✅ Success: ${section.filename}.webp\n`);
  }

  console.log(
    '======================================================================'
  );
  console.log('🎉 All manga translator section images generated!');
  console.log(
    '======================================================================'
  );
}

generateMangaImages().catch(console.error);
