import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type (audio only)
    const validTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/webm',
      'audio/ogg',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll return a mock transcription
    // In a real implementation, you would integrate with a speech-to-text service
    // like OpenAI Whisper, Google Speech-to-Text, etc.

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock transcription based on common Telugu phrases
    const mockTranscriptions = [
      'నమస్కారం, మీరు ఎలా ఉన్నారు?',
      'నేను తెలుగు నేర్చుకుంటున్నాను',
      'ఈ రోజు వాతావరణం ఎలా ఉంది?',
      'మీరు తెలుగు మాట్లాడగలరా?',
      'నాకు తెలుగు భాష చాలా ఇష్టం',
      'దయచేసి నాకు సహాయం చేయండి',
      'నేను హైదరాబాద్ నుండి వస్తున్నాను',
      'తెలుగు అందమైన భాష',
    ];

    const randomTranscription =
      mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

    return NextResponse.json({
      transcription: randomTranscription,
      language: 'telugu',
      confidence: 0.95,
      duration: '0:02',
    });
  } catch (error) {
    console.error('Audio transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
