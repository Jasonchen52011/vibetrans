// Simplified API route for dog translator (without external dependencies)
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type Emotion = 'happy' | 'sad' | 'angry' | 'normal';

// Simple emotion detection based on keywords
function detectEmotion(text: string): Emotion {
  const lowerText = text.toLowerCase();

  // Happy keywords
  const happyWords = [
    'love',
    'happy',
    'joy',
    'good',
    'great',
    'awesome',
    'wonderful',
    'excited',
    '爱',
    '开心',
    '快乐',
    '好',
    '棒',
    '喜欢',
  ];
  // Sad keywords
  const sadWords = [
    'sad',
    'sorry',
    'miss',
    'lonely',
    'cry',
    'hurt',
    '伤心',
    '难过',
    '想念',
    '孤独',
    '哭',
    '好难过',
  ];
  // Angry keywords
  const angryWords = [
    'angry',
    'mad',
    'hate',
    'bad',
    'no',
    'stop',
    'wrong',
    '生气',
    '讨厌',
    '坏',
    '不',
    '停',
  ];

  let happyScore = 0;
  let sadScore = 0;
  let angryScore = 0;

  happyWords.forEach((word) => {
    if (lowerText.includes(word)) happyScore++;
  });

  sadWords.forEach((word) => {
    if (lowerText.includes(word)) sadScore++;
  });

  angryWords.forEach((word) => {
    if (lowerText.includes(word)) angryScore++;
  });

  // Determine emotion based on scores
  if (happyScore > sadScore && happyScore > angryScore && happyScore > 0) {
    return 'happy';
  } else if (sadScore > happyScore && sadScore > angryScore && sadScore > 0) {
    return 'sad';
  } else if (
    angryScore > happyScore &&
    angryScore > sadScore &&
    angryScore > 0
  ) {
    return 'angry';
  }

  return 'normal';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };
    const humanText = body.text;

    if (!humanText || typeof humanText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (humanText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    // Detect emotion
    const emotion = detectEmotion(humanText);

    // Return the detected emotion
    return NextResponse.json({
      emotion: emotion,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing dog translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process translation',
        emotion: 'normal', // Fallback emotion
        isQuotaError: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Dog Translator API - Use POST method to translate text',
      version: '1.0',
      supported_emotions: ['happy', 'sad', 'angry', 'normal'],
    },
    { status: 200 }
  );
}
