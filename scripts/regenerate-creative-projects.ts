/**
 * Regenerate Alien Text for Creative Projects image
 * With smart prompt comparison before generation
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';
import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 现有的 prompt（从原始生成脚本获取）
const EXISTING_PROMPT = `Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects". Sky blue (#87CEEB) primary with soft gradient. Center features an artist's workspace with an open laptop (rectangular frame in silver) showing a sci-fi project with alien text overlays. A cartoon creator (circular head, rectangular body wearing creative beret) types enthusiastically. Around the workspace: storyboard panels with alien text labels, character design sketches with futuristic name tags, UI mockups with alien interface text. Floating creative tools: pencil (cylinder shape), paintbrush (geometric bristles), digital pen (sleek rectangle). Alien text examples float in bubbles: story titles in zalgo style, character names in circle text, UI elements in square text. Background shows: planet shapes representing different creative genres, constellation lines connecting ideas, geometric stars for inspiration. Color palette: sky blue dominant, deep purple (#6A0DAD), emerald green (#50C878), coral pink (#FF6B6B), lemon yellow (#FFF44F). Creative, inspiring, project-focused atmosphere. 4:3 aspect ratio, 800x600px.`;

// 内容标题和说明
const SECTION_TITLE = 'Alien Text for Creative Projects';
const SECTION_CONTENT = `Use alien text to make your creative projects stand out. Whether you're designing a sci-fi story, creating character names, or building a futuristic UI, alien text adds an otherworldly touch that captures attention and sparks imagination.`;

/**
 * 使用 Gemini 比较两个 prompt 的质量
 */
async function comparePrompts(
  existingPrompt: string,
  newPrompt: string
): Promise<{
  shouldUseExisting: boolean;
  reason: string;
  recommendation: string;
}> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  No Gemini API key found, using new prompt by default');
    return {
      shouldUseExisting: false,
      reason: 'No API key available for comparison',
      recommendation: newPrompt,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const comparisonPrompt = `You are an expert at evaluating image generation prompts for geometric flat-style illustrations.

Compare these two prompts for the same image concept "${SECTION_TITLE}":

EXISTING PROMPT:
${existingPrompt}

NEW PROMPT:
${newPrompt}

Evaluate based on:
1. Detail and specificity
2. Color palette accuracy (must use sky blue #87CEEB as primary)
3. Geometric flat style adherence
4. Completeness of scene description
5. Keyword integration for "${SECTION_TITLE}"

Response format:
DECISION: [USE_EXISTING or USE_NEW]
REASON: [One sentence explanation]
RECOMMENDATION: [If USE_EXISTING, return EXISTING PROMPT exactly as is; if USE_NEW, return NEW PROMPT exactly as is]

Now evaluate:`;

  try {
    const result = await model.generateContent(comparisonPrompt);
    const response = result.response.text().trim();

    const decisionMatch = response.match(/DECISION:\s*(USE_EXISTING|USE_NEW)/i);
    const reasonMatch = response.match(/REASON:\s*([\s\S]+?)(?=\nRECOMMENDATION:)/i);
    const recommendationMatch = response.match(
      /RECOMMENDATION:\s*([\s\S]+)$/i
    );

    const decision = decisionMatch?.[1].toUpperCase();
    const reason = reasonMatch?.[1].trim() || 'No reason provided';
    const recommendation =
      recommendationMatch?.[1].trim() || newPrompt;

    return {
      shouldUseExisting: decision === 'USE_EXISTING',
      reason,
      recommendation,
    };
  } catch (error: any) {
    console.error('❌ Comparison failed:', error.message);
    return {
      shouldUseExisting: false,
      reason: 'Comparison error, defaulting to new prompt',
      recommendation: newPrompt,
    };
  }
}

async function regenerateCreativeProjectsImage() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating: Alien Text for Creative Projects');
  console.log('='.repeat(70) + '\n');

  // Step 1: 检查是否存在现有 prompt
  console.log('📋 Step 1: Checking existing prompt...');
  if (EXISTING_PROMPT) {
    console.log(`✅ Found existing prompt (${EXISTING_PROMPT.length} chars)`);
    console.log(`📝 Existing: ${EXISTING_PROMPT.substring(0, 100)}...\n`);
  } else {
    console.log('⚠️  No existing prompt found\n');
  }

  // Step 2: 使用 Gemini 生成新 prompt
  console.log('📋 Step 2: Generating new prompt with Gemini...');
  const { prompt: newPrompt } = await testGeneratePrompt(
    SECTION_TITLE,
    SECTION_CONTENT
  );
  console.log(`✅ Generated new prompt (${newPrompt.length} chars)`);
  console.log(`📝 New: ${newPrompt.substring(0, 100)}...\n`);

  // Step 3: 比较两个 prompt
  let finalPrompt = newPrompt;

  if (EXISTING_PROMPT) {
    console.log('📋 Step 3: Comparing prompts with Gemini...');
    const comparison = await comparePrompts(EXISTING_PROMPT, newPrompt);

    console.log(`\n🎯 Decision: ${comparison.shouldUseExisting ? 'USE EXISTING' : 'USE NEW'}`);
    console.log(`💡 Reason: ${comparison.reason}\n`);

    finalPrompt = comparison.recommendation;
  } else {
    console.log('📋 Step 3: No comparison needed (no existing prompt)\n');
  }

  console.log(`📝 Final prompt: ${finalPrompt.substring(0, 100)}...\n`);

  // Step 4: 生成图片
  console.log('📋 Step 4: Generating image with KIE API...');

  try {
    const imageResult = await generateImageWithKie(finalPrompt, {
      imageSize: '4:3',
      outputFormat: 'png',
    });

    console.log(`✅ Image generated: ${imageResult.url}\n`);

    // Step 5: 转换为 WebP
    console.log('📋 Step 5: Converting to WebP...');
    const webpResult = await convertURLToWebP(imageResult.url, {
      filename: 'alien-text-creative-projects',
      targetSize: 90,
    });

    if (webpResult.success) {
      console.log('\n' + '='.repeat(70));
      console.log(`✅ Success: ${webpResult.filename} (${webpResult.size}KB)`);
      console.log(`📁 Location: public/images/docs/${webpResult.filename}`);
      console.log('='.repeat(70) + '\n');
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error(`\n❌ Failed: ${error.message}\n`);
    throw error;
  }
}

regenerateCreativeProjectsImage().catch(console.error);
