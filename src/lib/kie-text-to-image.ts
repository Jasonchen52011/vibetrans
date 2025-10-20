/**
 * KIE.AI Text-to-Image Generator using Google Nano Banana
 * Supports pure text-to-image generation (not editing)
 */

const KIE_API_BASE = 'https://api.kie.ai/api/v1';
const KIE_API_KEY =
  process.env.KIE_API_KEY || 'edd26a45e54629eb013d550bbcb8cef2';

export interface KieTextToImageInput {
  prompt: string;
  output_format?: 'png' | 'jpeg';
  image_size?:
    | '1:1'
    | '9:16'
    | '16:9'
    | '3:4'
    | '4:3'
    | '3:2'
    | '2:3'
    | '5:4'
    | '4:5'
    | '21:9'
    | 'auto';
}

// Seedream 4.0 specific types
export interface SeedreamInput {
  prompt: string;
  image_size?:
    | 'square'
    | 'square_hd'
    | 'portrait_4_3'
    | 'portrait_3_2'
    | 'portrait_16_9'
    | 'landscape_4_3'
    | 'landscape_3_2'
    | 'landscape_16_9'
    | 'landscape_21_9';
  image_resolution?: '1K' | '2K' | '4K';
  max_images?: number; // 1-6
  seed?: number;
}

// Ideogram v3 specific types
export interface IdeogramInput {
  prompt: string;
  rendering_speed?: 'TURBO' | 'BALANCED' | 'QUALITY';
  style?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN';
  expand_prompt?: boolean;
  image_size?:
    | 'square'
    | 'square_hd'
    | 'portrait_4_3'
    | 'portrait_16_9'
    | 'landscape_4_3'
    | 'landscape_16_9';
  num_images?: '1' | '2' | '3' | '4';
  seed?: number;
  sync_mode?: boolean;
  negative_prompt?: string;
}

export interface KieCreateTaskRequest {
  model: string;
  callBackUrl?: string;
  input: KieTextToImageInput;
}

export interface KieCreateTaskResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export interface KieTaskResult {
  code: number;
  message: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    param: string;
    resultJson?: string;
    failCode?: string;
    failMsg?: string;
    completeTime?: number;
    createTime: number;
    updateTime: number;
    consumeCredits?: number;
    costTime?: number;
  };
}

/**
 * Create a new text-to-image task using Google Nano Banana
 */
export async function createKieTextToImageTask(
  prompt: string,
  options?: {
    imageSize?: KieTextToImageInput['image_size'];
    outputFormat?: 'png' | 'jpeg';
    callBackUrl?: string;
  }
): Promise<KieCreateTaskResponse> {
  const input: KieTextToImageInput = {
    prompt,
    output_format: options?.outputFormat || 'png',
    image_size: options?.imageSize || '4:3',
  };

  const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/nano-banana', // Text-to-image model
      callBackUrl: options?.callBackUrl,
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `KIE API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Query task status and results
 */
export async function getKieTaskResult(taskId: string): Promise<KieTaskResult> {
  const response = await fetch(
    `${KIE_API_BASE}/jobs/recordInfo?taskId=${taskId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `KIE API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Poll task until completion (with timeout)
 */
export async function pollKieTextToImageResult(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<KieTaskResult> {
  console.log(`⏳ Polling task ${taskId}...`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getKieTaskResult(taskId);

    console.log(
      `   Attempt ${attempt + 1}/${maxAttempts}: ${result.data.state}`
    );

    if (result.data.state === 'success' || result.data.state === 'fail') {
      return result;
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Task polling timeout after 2 minutes');
}

/**
 * Extract result URLs from resultJson
 */
export function extractKieResultUrls(resultJson?: string): string[] {
  if (!resultJson) return [];

  try {
    const parsed = JSON.parse(resultJson);
    return parsed.resultUrls || [];
  } catch (error) {
    console.error('Failed to parse resultJson:', error);
    return [];
  }
}

/**
 * High-level function: Generate image from text prompt
 */
export async function generateImageWithKie(
  prompt: string,
  options?: {
    imageSize?: KieTextToImageInput['image_size'];
    outputFormat?: 'png' | 'jpeg';
  }
): Promise<{ url: string; revisedPrompt?: string }> {
  console.log('🎨 Creating KIE text-to-image task...');
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  // Step 1: Create task
  const createResponse = await createKieTextToImageTask(prompt, options);

  if (createResponse.code !== 200) {
    throw new Error(`Failed to create task: ${createResponse.message}`);
  }

  const taskId = createResponse.data.taskId;
  console.log(`✅ Task created: ${taskId}`);

  // Step 2: Poll for result
  const result = await pollKieTextToImageResult(taskId);

  // Step 3: Handle result
  if (result.data.state === 'fail') {
    throw new Error(`Task failed: ${result.data.failMsg || 'Unknown error'}`);
  }

  const urls = extractKieResultUrls(result.data.resultJson);

  if (urls.length === 0) {
    throw new Error('No images generated');
  }

  console.log(`✅ Image generated: ${urls[0]}`);

  return {
    url: urls[0],
    revisedPrompt: prompt, // KIE doesn't revise prompts like DALL-E
  };
}

/**
 * Create a new Seedream 4.0 text-to-image task
 */
export async function createSeedreamTask(
  prompt: string,
  options?: {
    imageSize?: SeedreamInput['image_size'];
    imageResolution?: SeedreamInput['image_resolution'];
    maxImages?: number;
    seed?: number;
    callBackUrl?: string;
  }
): Promise<KieCreateTaskResponse> {
  const input: SeedreamInput = {
    prompt,
    image_size: options?.imageSize || 'landscape_4_3', // Default 4:3 aspect ratio
    image_resolution: options?.imageResolution || '2K',
    max_images: options?.maxImages || 1,
  };

  if (options?.seed !== undefined) {
    input.seed = options.seed;
  }

  const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'bytedance/seedream-v4-text-to-image',
      callBackUrl: options?.callBackUrl,
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `KIE API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Poll task for Seedream 4.0 with 3-minute timeout
 * Extended timeout for Volcano 4.0 higher quality generation
 */
export async function pollSeedreamResult(
  taskId: string,
  maxAttempts = 90, // 90 attempts * 2 seconds = 3 minutes
  intervalMs = 2000
): Promise<KieTaskResult> {
  console.log(`⏳ Polling task ${taskId}...`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getKieTaskResult(taskId);

    console.log(
      `   Attempt ${attempt + 1}/${maxAttempts}: ${result.data.state}`
    );

    if (result.data.state === 'success' || result.data.state === 'fail') {
      return result;
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Task polling timeout after 30 seconds');
}

/**
 * High-level function: Generate image using Seedream 4.0 (DEFAULT)
 */
export async function generateImageWithSeedream(
  prompt: string,
  options?: {
    imageSize?: SeedreamInput['image_size'];
    imageResolution?: SeedreamInput['image_resolution'];
    maxImages?: number;
    seed?: number;
  }
): Promise<{ url: string; revisedPrompt?: string }> {
  console.log('🎨 [Seedream 4.0] Creating text-to-image task...');
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  // Step 1: Create task
  const createResponse = await createSeedreamTask(prompt, options);

  if (createResponse.code !== 200) {
    throw new Error(
      `Failed to create Seedream task: ${createResponse.message}`
    );
  }

  const taskId = createResponse.data.taskId;
  console.log(`✅ [Seedream 4.0] Task created: ${taskId}`);

  // Step 2: Poll for result with 3-minute timeout
  const result = await pollSeedreamResult(taskId);

  // Step 3: Handle result
  if (result.data.state === 'fail') {
    throw new Error(
      `Seedream task failed: ${result.data.failMsg || 'Unknown error'}`
    );
  }

  const urls = extractKieResultUrls(result.data.resultJson);

  if (urls.length === 0) {
    throw new Error('No images generated by Seedream');
  }

  console.log(`✅ [Seedream 4.0] Image generated: ${urls[0]}`);

  return {
    url: urls[0],
    revisedPrompt: prompt,
  };
}

/**
 * Create a new Ideogram v3 text-to-image task
 */
export async function createIdeogramTask(
  prompt: string,
  options?: {
    imageSize?: IdeogramInput['image_size'];
    renderingSpeed?: IdeogramInput['rendering_speed'];
    style?: IdeogramInput['style'];
    expandPrompt?: boolean;
    numImages?: IdeogramInput['num_images'];
    seed?: number;
    negativePrompt?: string;
    callBackUrl?: string;
  }
): Promise<KieCreateTaskResponse> {
  const input: IdeogramInput = {
    prompt,
    image_size: options?.imageSize || 'landscape_4_3', // Default 4:3 aspect ratio
    rendering_speed: options?.renderingSpeed || 'BALANCED',
    style: options?.style || 'AUTO',
    expand_prompt:
      options?.expandPrompt !== undefined ? options.expandPrompt : true,
    num_images: options?.numImages || '1',
    sync_mode: false,
  };

  if (options?.seed !== undefined) {
    input.seed = options.seed;
  }

  if (options?.negativePrompt) {
    input.negative_prompt = options.negativePrompt;
  }

  const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'ideogram/v3-text-to-image',
      callBackUrl: options?.callBackUrl,
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `KIE API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Poll task for Ideogram v3 with 30-second timeout
 */
export async function pollIdeogramResult(
  taskId: string,
  maxAttempts = 15, // 15 attempts * 2 seconds = 30 seconds
  intervalMs = 2000
): Promise<KieTaskResult> {
  console.log(`⏳ Polling task ${taskId}...`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getKieTaskResult(taskId);

    console.log(
      `   Attempt ${attempt + 1}/${maxAttempts}: ${result.data.state}`
    );

    if (result.data.state === 'success' || result.data.state === 'fail') {
      return result;
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Task polling timeout after 30 seconds');
}

/**
 * High-level function: Generate image using Ideogram v3
 */
export async function generateImageWithIdeogram(
  prompt: string,
  options?: {
    imageSize?: IdeogramInput['image_size'];
    renderingSpeed?: IdeogramInput['rendering_speed'];
    style?: IdeogramInput['style'];
    expandPrompt?: boolean;
    numImages?: IdeogramInput['num_images'];
    seed?: number;
    negativePrompt?: string;
  }
): Promise<{ url: string; revisedPrompt?: string }> {
  console.log('🎨 [Ideogram v3] Creating text-to-image task...');
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  // Step 1: Create task
  const createResponse = await createIdeogramTask(prompt, options);

  if (createResponse.code !== 200) {
    throw new Error(
      `Failed to create Ideogram task: ${createResponse.message}`
    );
  }

  const taskId = createResponse.data.taskId;
  console.log(`✅ [Ideogram v3] Task created: ${taskId}`);

  // Step 2: Poll for result with 30-second timeout
  const result = await pollIdeogramResult(taskId);

  // Step 3: Handle result
  if (result.data.state === 'fail') {
    throw new Error(
      `Ideogram task failed: ${result.data.failMsg || 'Unknown error'}`
    );
  }

  const urls = extractKieResultUrls(result.data.resultJson);

  if (urls.length === 0) {
    throw new Error('No images generated by Ideogram');
  }

  console.log(`✅ [Ideogram v3] Image generated: ${urls[0]}`);

  return {
    url: urls[0],
    revisedPrompt: prompt,
  };
}
