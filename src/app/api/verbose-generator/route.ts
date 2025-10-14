import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// Style definitions
const STYLE_PROMPTS = {
  academic: {
    name: 'Academic Style',
    description:
      'Rigorous, formal, and detailed - suitable for academic writing and research papers',
    systemPrompt: `You are an academic writing expert. Transform the given text into a verbose, detailed academic style.

Guidelines:
- Use formal academic language and terminology
- Include proper citations format (Author, Year)
- Add theoretical frameworks and scholarly context
- Use complex sentence structures
- Include transitional phrases like "Furthermore", "In addition", "Consequently"
- Provide detailed explanations and examples
- Maintain objectivity and precision

Transform this text into detailed academic prose:`,
  },
  creative: {
    name: 'Creative Writing Style',
    description:
      'Expressive, narrative, and artistic - perfect for novels, scripts, and poetry',
    systemPrompt: `You are a creative writing master. Transform the given text into vivid, expressive creative prose.

Guidelines:
- Use rich, descriptive language and metaphors
- Create vivid imagery and sensory details
- Develop narrative flow and rhythm
- Include literary devices (simile, personification, alliteration)
- Build atmosphere and mood
- Use varied sentence lengths for dramatic effect
- Make the text emotionally engaging

Transform this text into creative narrative prose:`,
  },
  humorous: {
    name: 'Humorous Style',
    description:
      'Light-hearted, witty, and entertaining - ideal for social media and comedy content',
    systemPrompt: `You are a comedy writer. Transform the given text into a humorous, entertaining version.

Guidelines:
- Use witty wordplay and puns
- Include exaggeration and hyperbole
- Add amusing observations and asides
- Use informal, conversational tone
- Include pop culture references where appropriate
- Create unexpected comparisons
- Make it fun and engaging while keeping the core message

Transform this text into humorous prose:`,
  },
  technical: {
    name: 'Technical Style',
    description:
      'Professional, precise, and data-driven - best for technical documentation',
    systemPrompt: `You are a technical documentation specialist. Transform the given text into precise, detailed technical prose.

Guidelines:
- Use specific technical terminology
- Include exact specifications and measurements
- Provide step-by-step procedures
- Use bullet points and numbered lists where appropriate
- Add implementation details
- Include potential edge cases and considerations
- Maintain clarity and precision
- Use present tense and active voice

Transform this text into detailed technical documentation:`,
  },
  narrative: {
    name: 'Narrative Style',
    description:
      'Story-driven with clear plot progression - great for blog posts and storytelling',
    systemPrompt: `You are a storytelling expert. Transform the given text into an engaging narrative.

Guidelines:
- Create a clear story arc (beginning, middle, end)
- Use chronological flow and transitions
- Include character perspectives and emotions
- Build tension and resolution
- Use dialogue where appropriate
- Create immersive scene-setting
- Maintain consistent narrative voice
- Make it engaging and easy to follow

Transform this text into narrative prose:`,
  },
  business: {
    name: 'Formal Business Style',
    description:
      'Professional, objective, and concise - suitable for corporate communications',
    systemPrompt: `You are a business communications expert. Transform the given text into formal business prose.

Guidelines:
- Use professional business language
- Maintain objective, neutral tone
- Include key performance indicators and metrics
- Use formal salutations and closings
- Structure information hierarchically
- Include action items and next steps
- Use business terminology appropriately
- Keep it clear, direct, and actionable

Transform this text into formal business communication:`,
  },
};

type StyleType = keyof typeof STYLE_PROMPTS;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      style?: StyleType;
    };
    const { text, style = 'academic' } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Validate style
    if (!STYLE_PROMPTS[style]) {
      return NextResponse.json(
        {
          error: `Invalid style. Available styles: ${Object.keys(STYLE_PROMPTS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Initialize Gemini model (Flash 2.0)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    // Get style prompt
    const styleConfig = STYLE_PROMPTS[style];
    const fullPrompt = `${styleConfig.systemPrompt}\n\n"${text}"`;

    // Generate verbose text
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const verboseText = response.text();

    return NextResponse.json({
      translated: verboseText,
      original: text,
      style: style,
      styleName: styleConfig.name,
      message: `Successfully transformed to ${styleConfig.name}`,
    });
  } catch (error: any) {
    console.error('Verbose generation error:', error);

    // Handle specific Gemini errors
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Text transformation failed. Please try again.' },
      { status: 500 }
    );
  }
}
