import { NextResponse } from 'next/server';
import type { TextToSpeechClient } from '@google-cloud/text-to-speech';

export const runtime = 'edge';

// 小黄人语音配置
const MINION_VOICES = {
  cute: {
    voice: 'en-US-Wavenet-C', // 女性高音
    pitch: 10.0, // +10 semitones，非常高
    speakingRate: 1.5, // 1.5倍速
  },
  evil: {
    voice: 'en-US-Wavenet-D', // 男性低音
    pitch: -5.0, // -5 semitones，低沉
    speakingRate: 0.75, // 0.75倍速，慢
  },
  excited: {
    voice: 'en-GB-Wavenet-A', // 英式女声
    pitch: 15.0, // +15 semitones，超高
    speakingRate: 1.8, // 1.8倍速，超快
  },
};

type Tone = keyof typeof MINION_VOICES;

export async function POST(request: Request) {
  try {
    const { text, tone = 'cute' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No valid text provided' },
        { status: 400 }
      );
    }

    // 检查是否配置了 Google Cloud credentials
    if (!process.env.GOOGLE_CLOUD_CREDENTIALS && !process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
      console.warn('[Google-TTS] No credentials found, using browser TTS fallback');
      return NextResponse.json(
        {
          error: 'Google Cloud TTS not configured',
          message: 'Please set GOOGLE_CLOUD_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS_JSON in .env.local',
          fallback: 'browser-tts',
        },
        { status: 503 }
      );
    }

    // 动态导入 Google Cloud TTS
    const textToSpeech = await import('@google-cloud/text-to-speech');

    // 创建客户端
    let client: TextToSpeechClient;

    if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
      // 使用 JSON 字符串
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON);
      client = new textToSpeech.TextToSpeechClient({
        credentials,
      });
    } else if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      // 使用文件路径
      client = new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS,
      });
    } else {
      throw new Error('No valid Google Cloud credentials found');
    }

    // 获取语气配置
    const config = MINION_VOICES[tone as Tone] || MINION_VOICES.cute;

    console.log('[Google-TTS] Generating speech:', {
      voice: config.voice,
      pitch: config.pitch,
      rate: config.speakingRate,
      textLength: text.length,
    });

    // 构建请求
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: config.voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: config.pitch,
        speakingRate: config.speakingRate,
        volumeGainDb: 0.0,
      },
    });

    if (!response.audioContent) {
      throw new Error('No audio content returned');
    }

    console.log('[Google-TTS] Success, audio size:', response.audioContent.length, 'bytes');

    // 返回音频数据
    return new NextResponse(response.audioContent as Buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString(),
      },
    });
  } catch (error) {
    console.error('[Google-TTS] Error:', error);

    // 返回友好的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'TTS generation failed',
        details: errorMessage,
        hint: 'Check docs/GOOGLE-TTS-SETUP.md for setup instructions',
      },
      { status: 500 }
    );
  }
}
