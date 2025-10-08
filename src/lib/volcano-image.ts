/**
 * Volcano Engine Image Generation API Wrapper
 * Model: Doubao SeedEdit 3.0 (jimeng_i2i_v30)
 * Based on successful implementation from hair-style.ai
 */

/**
 * Web Crypto API - SHA256 Hash
 */
async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Web Crypto API - HMAC-SHA256
 */
async function hmacSha256(
  key: string | Uint8Array,
  data: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();

  const keyBuffer = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const dataBuffer = encoder.encode(data);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return new Uint8Array(signature);
}

/**
 * Web Crypto API - HMAC-SHA256 Hex
 */
async function hmacSha256Hex(
  key: string | Uint8Array,
  data: string
): Promise<string> {
  const signature = await hmacSha256(key, data);
  return Array.from(signature)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface VolcanoImageOptions {
  prompt: string;
  imageUrl: string; // Base64 data URL or pure base64
  size?: 'adaptive' | '1K' | '2K' | '4K';
  watermark?: boolean;
}

export interface VolcanoImageResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

/**
 * Generate Volcano Engine API Signature Headers
 */
async function getVolcAuthHeader(
  method: 'POST' | 'GET',
  path: string,
  body: Record<string, any>
) {
  const accessKey = process.env.VOLC_ACCESS_KEY!;
  const secretKey = process.env.VOLC_SECRET_KEY!; // Use base64 directly!
  const region = process.env.VOLC_I2I_REGION || 'cn-north-1';
  const service = process.env.VOLC_I2I_SERVICE || 'cv';
  const apiUrl =
    process.env.VOLC_I2I_API_URL || 'https://visual.volcengineapi.com';

  if (!accessKey || !secretKey) {
    throw new Error('VOLC_ACCESS_KEY and VOLC_SECRET_KEY are required');
  }

  // Generate timestamp (YYYYMMDDTHHMMSSZ format)
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');

  const fullUrl = `${apiUrl}${path}`;
  const urlObj = new URL(fullUrl);

  const canonicalUri = urlObj.pathname;
  const canonicalQueryString = urlObj.searchParams.toString();
  const hashedPayload = await sha256Hash(JSON.stringify(body));

  // Headers must be sorted alphabetically
  const canonicalHeaders =
    [
      `content-type:application/json`,
      `host:${urlObj.hostname}`,
      `x-content-sha256:${hashedPayload}`,
      `x-date:${timestamp}`,
    ].join('\n') + '\n';

  const signedHeaders = 'content-type;host;x-content-sha256;x-date';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join('\n');

  const credentialScope = `${date}/${region}/${service}/request`;
  const hashedCanonicalRequest = await sha256Hash(canonicalRequest);

  const stringToSign = [
    'HMAC-SHA256',
    timestamp,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  // Calculate signing key - use base64 secret key directly!
  const kDate = await hmacSha256(secretKey, date);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const signingKey = await hmacSha256(kService, 'request');

  const signature = await hmacSha256Hex(signingKey, stringToSign);

  const authorization = `HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    'X-Date': timestamp,
    'X-Content-Sha256': hashedPayload,
    Host: urlObj.hostname,
    'Content-Type': 'application/json',
  };
}

/**
 * Generate image using Volcano Engine Visual Intelligence API
 */
export async function generateImage(
  options: VolcanoImageOptions
): Promise<VolcanoImageResponse> {
  const reqKey = process.env.VOLC_I2I_REQ_KEY || 'jimeng_i2i_v30';
  const apiUrl =
    process.env.VOLC_I2I_API_URL || 'https://visual.volcengineapi.com';

  console.log('🎨 Volcano Engine image generation request:', {
    reqKey,
    prompt: options.prompt,
    hasImageUrl: !!options.imageUrl,
  });

  // Extract pure base64 data (remove data URL prefix if present)
  let base64Data: string;
  if (options.imageUrl.startsWith('data:')) {
    const parts = options.imageUrl.split(',');
    if (parts.length === 2) {
      base64Data = parts[1]; // Pure base64 without prefix
    } else {
      throw new Error('Invalid data URL format');
    }
  } else {
    base64Data = options.imageUrl;
  }

  console.log('📦 Base64 data prepared:', {
    originalLength: options.imageUrl.length,
    processedLength: base64Data.length,
    isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data.substring(0, 100)),
  });

  // Build request body (use snake_case as per Jimeng API spec)
  const requestBody = {
    req_key: reqKey,
    prompt: options.prompt,
    binary_data_base64: [base64Data], // Pure base64, snake_case format
    seed: -1,
    scale: 0.9,
    width: 1328,
    height: 1328,
    logo_info: {
      add_logo: options.watermark !== undefined ? options.watermark : false,
    },
  };

  const path = '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
  const authHeaders = await getVolcAuthHeader('POST', path, requestBody);

  console.log('📤 Sending request to:', `${apiUrl}${path}`);
  console.log('🔐 Request headers prepared');

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseData = (await response.json()) as {
      code?: number;
      message?: string;
      data?: {
        task_id?: string;
      };
    };

    console.log('📥 Response:', {
      status: response.status,
      ok: response.ok,
      code: responseData.code,
      hasTaskId: !!responseData.data?.task_id,
    });

    // Check for API errors
    if (
      responseData.code &&
      responseData.code !== 0 &&
      responseData.code !== 10000
    ) {
      throw new Error(responseData.message || 'API request failed');
    }

    // Success with task ID
    if (response.ok && responseData.data?.task_id) {
      const taskId = responseData.data.task_id;

      // Poll for result
      const result = await pollTaskStatus(taskId, reqKey, apiUrl);

      if (result.success && result.imageUrls) {
        return {
          data: result.imageUrls.map((url: string) => ({
            url,
            revised_prompt: options.prompt,
          })),
        };
      }

      throw new Error(result.error || 'Failed to get image result');
    }

    // No task ID (face detection failed)
    if (responseData.code === 10000 && !responseData.data?.task_id) {
      throw new Error(
        'Unable to detect a clear face in the photo. Please upload a high-quality front-facing portrait photo.'
      );
    }

    throw new Error('Invalid response from Volcano Engine API');
  } catch (error) {
    console.error('❌ Volcano Engine API error:', error);
    throw error;
  }
}

/**
 * Poll task status until completion
 */
async function pollTaskStatus(
  taskId: string,
  reqKey: string,
  apiUrl: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const statusBody = {
      req_key: reqKey,
      task_id: taskId,
      req_json: JSON.stringify({
        return_url: true,
        logo_info: {
          add_logo: false,
          position: 0,
          language: 0,
          opacity: 1,
        },
      }),
    };

    const path = '/?Action=CVSync2AsyncGetResult&Version=2022-08-31';
    const authHeaders = await getVolcAuthHeader('POST', path, statusBody);

    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(statusBody),
    });

    const statusData = (await response.json()) as {
      code?: number;
      message?: string;
      data?: {
        status?: string;
        image_urls?: string[];
        binary_data_base64?: string[];
        resp_data?: string;
      };
    };

    console.log(`🔄 Polling attempt ${i + 1}/${maxAttempts}:`, {
      code: statusData.code,
      status: statusData.data?.status,
    });

    if (statusData.code === 10000 && statusData.data) {
      const result = statusData.data;

      if (result.status === 'success' || result.status === 'done') {
        // Get image URLs
        if (
          result.image_urls &&
          Array.isArray(result.image_urls) &&
          result.image_urls.length > 0
        ) {
          console.log('✅ Task completed successfully with URLs');
          return { success: true, imageUrls: result.image_urls };
        }

        // Convert base64 to data URLs if needed
        if (
          result.binary_data_base64 &&
          Array.isArray(result.binary_data_base64)
        ) {
          const dataUrls = result.binary_data_base64.map(
            (base64: string) => `data:image/png;base64,${base64}`
          );
          console.log('✅ Task completed successfully with base64');
          return { success: true, imageUrls: dataUrls };
        }

        return { success: false, error: 'No image data in response' };
      } else if (result.status === 'failed' || result.status === 'error') {
        return { success: false, error: result.resp_data || 'Task failed' };
      }
      // Continue polling for 'in_queue', 'processing', etc.
    }
  }

  return {
    success: false,
    error: 'Task timeout after ' + maxAttempts + ' attempts',
  };
}

/**
 * Get image generation cost in credits
 */
export function getImageCost(): number {
  return 20;
}

export const DEFAULT_IMAGE_COST = getImageCost();
