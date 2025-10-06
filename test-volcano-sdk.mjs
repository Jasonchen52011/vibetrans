/**
 * Test Volcano Engine with SDK approach
 * Using simplified HTTP signature
 */

import crypto from 'crypto';
import fs from 'fs';

const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

console.log('Testing with simplified approach...\n');

// Try a simple test without complex signature
async function testSimple() {
  const testImageBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const body = {
    req_key: env.VOLC_I2I_REQ_KEY,
    prompt: 'A beautiful mountain landscape',
    binary_data_base64: [testImageBase64],
    return_url: true,
  };

  console.log('Request body:', JSON.stringify(body, null, 2));
  console.log('\nPlease check if the API keys are correct:');
  console.log('Access Key:', env.VOLC_ACCESS_KEY);
  console.log('Secret Key (base64):', env.VOLC_SECRET_KEY);
  console.log(
    'Secret Key (decoded):',
    Buffer.from(env.VOLC_SECRET_KEY, 'base64').toString('utf-8')
  );
  console.log('\nAPI URL:', env.VOLC_I2I_API_URL);
  console.log('Req Key:', env.VOLC_I2I_REQ_KEY);
}

testSimple();
