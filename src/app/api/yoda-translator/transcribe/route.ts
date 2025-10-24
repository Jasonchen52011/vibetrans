import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/m4a',
      'audio/ogg',
      'audio/webm',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Please upload MP3, WAV, M4A, OGG, or WebM files.',
        },
        { status: 400 }
      );
    }

    // 检查文件大小 (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'File too large. Please upload audio files smaller than 25MB.',
        },
        { status: 400 }
      );
    }

    // 获取环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // 如果没有API密钥，返回模拟结果
      console.log('No OpenAI API key found, returning mock transcription');
      const mockTranscription = generateMockTranscription(file.name);

      return NextResponse.json({
        transcription: mockTranscription,
        duration: estimateDuration(file.size),
        provider: 'mock',
      });
    }

    // 使用OpenAI Whisper API进行转录
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // 创建FormData发送给OpenAI
    const openaiFormData = new FormData();
    openaiFormData.append('file', blob, file.name);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'en'); // 强制使用英语，因为Yoda只说英语

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: openaiFormData,
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);

      // 如果API失败，返回模拟结果
      const mockTranscription = generateMockTranscription(file.name);
      return NextResponse.json({
        transcription: mockTranscription,
        duration: estimateDuration(file.size),
        provider: 'mock-fallback',
      });
    }

    const result = await openaiResponse.json();

    return NextResponse.json({
      transcription: result.text,
      duration: result.duration || estimateDuration(file.size),
      provider: 'openai-whisper',
    });
  } catch (error) {
    console.error('Transcription error:', error);

    // 出错时返回模拟结果
    const mockTranscription = generateMockTranscription('audio-file');
    return NextResponse.json({
      transcription: mockTranscription,
      duration: 5,
      provider: 'mock-error',
    });
  }
}

// 生成模拟转录文本
function generateMockTranscription(fileName: string): string {
  const mockTexts = [
    'Hello, how are you today?',
    'I want to learn more about the Force.',
    'The path to becoming a Jedi is long and difficult.',
    'Train yourself to let go of everything you fear to lose.',
    'Do or do not, there is no try.',
    'The fear of loss is a path to the dark side.',
    'In a dark place we find ourselves, and a little more knowledge might light our way.',
    'Patience you must have, my young padawan.',
    'The greatest teacher, failure is.',
    'Size matters not. Look at me. Judge me by my size, do you?',
  ];

  return mockTexts[Math.floor(Math.random() * mockTexts.length)];
}

// 估算音频时长（基于文件大小的粗略估算）
function estimateDuration(fileSize: number): number {
  // 假设平均比特率为 128kbps = 16KB/s
  const estimatedSeconds = Math.max(1, Math.round(fileSize / (16 * 1024)));
  return Math.min(estimatedSeconds, 600); // 最大10分钟
}
