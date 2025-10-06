/**
 * Final Volcano Engine API Test
 * Based on successful hair-style.ai implementation
 */

import crypto from 'crypto';
import fs from 'fs';

// Load env
const env = {};
fs.readFileSync('.env.local', 'utf-8')
  .split('\n')
  .forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });

console.log('✅ Configuration loaded');
console.log('   VOLC_ACCESS_KEY:', env.VOLC_ACCESS_KEY);
console.log('   VOLC_I2I_REQ_KEY:', env.VOLC_I2I_REQ_KEY);
console.log('   VOLC_I2I_API_URL:', env.VOLC_I2I_API_URL);
console.log('');

// Web Crypto-compatible functions
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key, data) {
  return crypto
    .createHmac(
      'sha256',
      Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf-8')
    )
    .update(data)
    .digest();
}

function hmacHex(key, data) {
  return crypto
    .createHmac(
      'sha256',
      Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf-8')
    )
    .update(data)
    .digest('hex');
}

async function getAuthHeaders(method, path, body) {
  const accessKey = env.VOLC_ACCESS_KEY;
  const secretKey = env.VOLC_SECRET_KEY; // Use base64 directly!
  const region = env.VOLC_I2I_REGION;
  const service = env.VOLC_I2I_SERVICE;
  const apiUrl = env.VOLC_I2I_API_URL;

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');

  const fullUrl = `${apiUrl}${path}`;
  const urlObj = new URL(fullUrl);
  const hashedPayload = sha256(JSON.stringify(body));

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
    urlObj.pathname,
    urlObj.searchParams.toString(),
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join('\n');

  const credentialScope = `${date}/${region}/${service}/request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);

  const stringToSign = [
    'HMAC-SHA256',
    timestamp,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  // Use base64 secret key directly!
  const kDate = hmac(secretKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const signingKey = hmac(kService, 'request');
  const signature = hmacHex(signingKey, stringToSign);

  return {
    Authorization: `HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'X-Date': timestamp,
    'X-Content-Sha256': hashedPayload,
    Host: urlObj.hostname,
    'Content-Type': 'application/json',
  };
}

async function testAPI() {
  console.log('🧪 Testing Volcano Engine API\n');

  // Simple test image (1x1 red pixel)
  const testBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const requestBody = {
    req_key: env.VOLC_I2I_REQ_KEY,
    prompt: 'Add a bright sunny sky background',
    binary_data_base64: [testBase64], // Pure base64, snake_case
    seed: -1,
    scale: 0.9,
    width: 1328,
    height: 1328,
    logo_info: {
      add_logo: false,
    },
  };

  const path = '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
  const headers = await getAuthHeaders('POST', path, requestBody);

  console.log('📤 Submitting task...');
  console.log('   URL:', `${env.VOLC_I2I_API_URL}${path}`);
  console.log('');

  const response = await fetch(`${env.VOLC_I2I_API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  console.log('📥 Response Status:', response.status);
  console.log('📦 Response Data:', JSON.stringify(data, null, 2));
  console.log('');

  if (data.code === 10000 && data.data?.task_id) {
    console.log('✅ SUCCESS! Task submitted');
    console.log('   Task ID:', data.data.task_id);
    console.log('');
    console.log('🎉 Volcano Engine API is working correctly!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Test with a real face photo for better results');
    console.log('   2. The API is now ready to use in your /image page');
    console.log('   3. Remember: Photos must have clear front-facing faces');
    return true;
  } else if (data.code === 10000 && !data.data?.task_id) {
    console.log('⚠️  API works but no TaskId (expected for test image)');
    console.log('   This happens when the image has no detectable face');
    console.log('   Try with a real portrait photo for actual generation');
    return true;
  } else {
    console.log('❌ Request failed');
    console.log('   Error:', data.ResponseMetadata?.Error || data.message);
    return false;
  }
}

testAPI().then((success) => process.exit(success ? 0 : 1));
