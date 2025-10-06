/**
 * Test script for Volcano Engine Image Generation API
 * Fixed version with proper secret key handling
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    value = value.replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

console.log('✓ Loaded environment variables');
console.log('  VOLC_ACCESS_KEY:', env.VOLC_ACCESS_KEY);
console.log(
  '  VOLC_SECRET_KEY:',
  env.VOLC_SECRET_KEY ? '***' + env.VOLC_SECRET_KEY.slice(-8) : 'Missing'
);
console.log('');

// Decode the base64 secret key
const decodedSecret = Buffer.from(env.VOLC_SECRET_KEY, 'base64').toString(
  'utf-8'
);
console.log('  Decoded Secret Key:', '***' + decodedSecret.slice(-8));
console.log('');

function generateSignature(method, path, query, headers, body, secretKey) {
  const hashedBody = crypto
    .createHash('sha256')
    .update(body)
    .digest('hex')
    .toLowerCase();

  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n');

  const signedHeaders = Object.keys(headers)
    .sort()
    .map((key) => key.toLowerCase())
    .join(';');

  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    '',
    signedHeaders,
    hashedBody,
  ].join('\n');

  const hashedCanonicalRequest = crypto
    .createHash('sha256')
    .update(canonicalRequest)
    .digest('hex')
    .toLowerCase();

  const dateStr = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z/, 'Z');
  const credentialScope = `${dateStr}/${env.VOLC_I2I_REGION}/${env.VOLC_I2I_SERVICE}/request`;

  const stringToSign = [
    'HMAC-SHA256',
    timestamp,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  // Use the decoded secret key
  const kDate = crypto.createHmac('sha256', secretKey).update(dateStr).digest();
  const kRegion = crypto
    .createHmac('sha256', kDate)
    .update(env.VOLC_I2I_REGION)
    .digest();
  const kService = crypto
    .createHmac('sha256', kRegion)
    .update(env.VOLC_I2I_SERVICE)
    .digest();
  const kSigning = crypto
    .createHmac('sha256', kService)
    .update('request')
    .digest();
  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign)
    .digest('hex')
    .toLowerCase();

  return { signature, timestamp, credentialScope, signedHeaders };
}

async function testVolcanoImageAPI() {
  console.log('🧪 Testing Volcano Engine Image Generation API\n');

  const accessKey = env.VOLC_ACCESS_KEY;
  const secretKey = Buffer.from(env.VOLC_SECRET_KEY, 'base64').toString(
    'utf-8'
  );
  const apiUrl = env.VOLC_I2I_API_URL;
  const reqKey = env.VOLC_I2I_REQ_KEY;

  // Create a simple test image
  const testImageBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const requestBody = {
    req_key: reqKey,
    prompt: 'A beautiful sunset over mountains',
    binary_data_base64: [testImageBase64],
    return_url: true,
    logo_info: {
      add_logo: false,
    },
  };

  const body = JSON.stringify(requestBody);
  const path = '/';
  const query = 'Action=CVProcess&Version=2022-08-31';

  const headers = {
    'Content-Type': 'application/json',
    Host: new URL(apiUrl).host,
  };

  const { signature, timestamp, credentialScope, signedHeaders } =
    generateSignature('POST', path, query, headers, body, secretKey);

  headers['X-Date'] = timestamp;
  headers['Authorization'] =
    `HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  console.log('📤 Sending request...');
  console.log('   URL:', `${apiUrl}/?${query}`);
  console.log('   Signature:', signature.substring(0, 16) + '...');
  console.log('');

  try {
    const response = await fetch(`${apiUrl}/?${query}`, {
      method: 'POST',
      headers,
      body,
    });

    const responseText = await response.text();
    console.log('📥 Response Status:', response.status);

    if (!response.ok) {
      console.error('❌ API Request Failed');
      console.error('   Response:', responseText);
      return false;
    }

    const data = JSON.parse(responseText);
    console.log('✅ API Request Successful!');
    console.log('   Response:', JSON.stringify(data, null, 2));

    if (data.data && data.data.image_urls) {
      console.log('');
      console.log('🎉 Test PASSED! Image URLs:');
      data.data.image_urls.forEach((url, idx) => {
        console.log(`   ${idx + 1}. ${url}`);
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    return false;
  }
}

testVolcanoImageAPI().then((success) => process.exit(success ? 0 : 1));
