import path from 'path';
import fs from 'fs/promises';

/**
 * 下载婴儿哭声音频文件的脚本
 *
 * 由于需要符合版权要求，本脚本提供两种方案：
 * 1. 从 Freesound.org 下载 CC0/CC-BY 许可的音频
 * 2. 使用占位音频文件（需要用户手动替换为真实音频）
 */

async function downloadAudioFiles() {
  console.log('🎵 Baby Cry Audio Files Setup\n');
  console.log('━'.repeat(60));

  const audioDir = path.join(process.cwd(), 'public/audio/baby-cries');

  // 确保目录存在
  await fs.mkdir(audioDir, { recursive: true });

  const audioFiles = [
    {
      name: 'hungry-cry.mp3',
      description: 'Repetitive, rhythmic crying pattern',
      freesoundUrls: [
        'https://freesound.org/people/InspectorJ/sounds/484344/', // Baby Crying
        'https://freesound.org/people/soundmary/sounds/194931/', // Baby cry
      ],
    },
    {
      name: 'tired-cry.mp3',
      description: 'Fussy, whiny, and intermittent sounds',
      freesoundUrls: [
        'https://freesound.org/people/InspectorJ/sounds/484344/',
        'https://freesound.org/people/soundmary/sounds/194932/',
      ],
    },
    {
      name: 'discomfort-cry.mp3',
      description: 'Distressed and urgent crying',
      freesoundUrls: ['https://freesound.org/people/InspectorJ/sounds/484344/'],
    },
    {
      name: 'pain-cry.mp3',
      description: 'Sharp, intense, and sudden cries',
      freesoundUrls: ['https://freesound.org/people/InspectorJ/sounds/484344/'],
    },
  ];

  console.log('\n📋 Required Audio Files:\n');

  for (const file of audioFiles) {
    console.log(`\n${file.name}`);
    console.log(`   Description: ${file.description}`);
    console.log(`   Suggested sources:`);
    for (const url of file.freesoundUrls) {
      console.log(`   - ${url}`);
    }
  }

  console.log('\n\n━'.repeat(60));
  console.log('\n📌 IMPORTANT: Manual Steps Required\n');
  console.log(
    'Since we cannot automatically download audio files due to licensing,'
  );
  console.log('please follow these steps:\n');

  console.log('1️⃣  Visit Freesound.org and search for "baby cry"');
  console.log('    URL: https://freesound.org/search/?q=baby+cry\n');

  console.log('2️⃣  Filter by Creative Commons licenses (CC0 or CC-BY)');
  console.log('    - CC0: Public domain, no attribution required');
  console.log('    - CC-BY: Attribution required\n');

  console.log('3️⃣  Download 4 different baby cry sounds representing:');
  console.log('    - Hungry: Repetitive, rhythmic pattern');
  console.log('    - Tired: Fussy, whiny sounds');
  console.log('    - Discomfort: Distressed, urgent');
  console.log('    - Pain: Sharp, intense cries\n');

  console.log('4️⃣  Convert/trim audio files to meet specs:');
  console.log('    - Format: MP3');
  console.log('    - Duration: 3-5 seconds');
  console.log('    - Bitrate: 128-192 kbps');
  console.log('    - File size: < 100KB\n');

  console.log('5️⃣  Save files to: public/audio/baby-cries/');
  console.log('    - hungry-cry.mp3');
  console.log('    - tired-cry.mp3');
  console.log('    - discomfort-cry.mp3');
  console.log('    - pain-cry.mp3\n');

  console.log('━'.repeat(60));
  console.log('\n🛠️  Alternative: Use Audio Editing Tools\n');
  console.log('You can use these free tools to trim/convert audio:\n');
  console.log('- Audacity (free, open-source): https://www.audacityteam.org/');
  console.log(
    '- ffmpeg (command-line): ffmpeg -i input.wav -b:a 128k -t 5 output.mp3'
  );
  console.log('- Online converter: https://cloudconvert.com/\n');

  console.log('━'.repeat(60));
  console.log('\n💡 Quick Start Option\n');
  console.log('For development/testing, you can use placeholder audio or');
  console.log(
    'a single audio file for all 4 types until you get proper samples.\n'
  );

  // 检查是否已有音频文件
  console.log('📊 Checking existing audio files...\n');

  for (const file of audioFiles) {
    const filePath = path.join(audioDir, file.name);
    try {
      const stats = await fs.stat(filePath);
      console.log(`✅ ${file.name} - ${(stats.size / 1024).toFixed(2)} KB`);
    } catch {
      console.log(`❌ ${file.name} - NOT FOUND`);
    }
  }

  console.log('\n━'.repeat(60));
}

downloadAudioFiles().catch(console.error);
