import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Re-export everything from runic-translator
export { GET, POST } from '../runic-translator/route';
