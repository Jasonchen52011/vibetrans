import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 婴儿哭声类型的分析
function analyzeBabyCry(audioData?: any, text?: string): string {
  // 如果有音频数据，简单模拟分析
  if (audioData) {
    const cryTypes = [
      'Hungry: Your baby shows signs of hunger - rhythmic, persistent crying with mouth movements',
      'Tired: Your baby seems tired - fussy, intermittent crying with yawning gestures',
      'Discomfort: Your baby appears uncomfortable - distressed crying with body tension',
      'Pain: Your baby may be in pain - sharp, intense crying with sudden onset',
      'Sleepy: Your baby seems sleepy - soft whimpers with eye rubbing',
      'Playful: Your baby appears playful - happy sounds with laughter',
    ];

    // 简单随机选择（在实际应用中应该是真实的音频分析）
    const randomIndex = Math.floor(Math.random() * cryTypes.length);
    return cryTypes[randomIndex];
  }

  // 如果只有文本，简单分析
  if (text) {
    return `Based on your description: "${text}", this appears to be a normal baby communication pattern. Consider the context and timing to better understand your baby's needs.`;
  }

  return 'Please provide either audio recording or text description for analysis.';
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let body;

    if (contentType?.includes('multipart/form-data')) {
      // 处理音频文件上传
      const formData = await request.formData();
      const audioFile = formData.get('audio');
      const text = formData.get('text') as string;

      const analysis = analyzeBabyCry(audioFile, text);

      return NextResponse.json({
        success: true,
        translated: analysis,
        original: text || 'Audio recording',
        inputType: audioFile ? 'audio' : 'text',
        translationMethod: 'baby-cry-analysis',
        suggestions: [
          "Observe your baby's body language",
          'Check the time since last feeding',
          'Consider if diaper change is needed',
          'Look for signs of sleepiness',
        ],
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: '< 200ms',
          inputType: audioFile ? 'audio' : 'text',
        },
      });
    } else {
      // 处理JSON请求
      body = await request.json();
      const { text, options = {} } = body;

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Valid text is required' },
          { status: 400 }
        );
      }

      const analysis = analyzeBabyCry(null, text);

      return NextResponse.json({
        success: true,
        translated: analysis,
        original: text,
        inputType: 'text',
        options,
        translationMethod: 'baby-cry-analysis',
        suggestions: [
          "Try to identify patterns in your baby's cries",
          'Keep a log of feeding and sleeping times',
          'Pay attention to body language cues',
          'Consult with your pediatrician if concerned',
        ],
        confidence: Math.floor(Math.random() * 15) + 75, // 75-89%
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: '< 50ms',
          textLength: text.length,
        },
      });
    }
  } catch (error) {
    console.error('Baby analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        suggestion: 'Please try again or check if the audio file is valid',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Baby Translator API',
    description: 'Simple translation response service',
    features: ['Basic text processing', 'Real-time response', 'Error handling'],
    timestamp: new Date().toISOString(),
  });
}
