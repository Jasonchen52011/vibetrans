import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // 使用 Edge Runtime 满足 Cloudflare Pages 要求

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  try {
    // 验证文件名
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // 防止路径遍历攻击
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
    }

    // 只允许 mp3 文件
    if (!filename.endsWith('.mp3')) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // 预定义的音频文件内容（实际项目中应该是真实的音频数据）
    // 这里返回一个简单的响应，让前端知道文件存在
    return NextResponse.json({
      success: true,
      filename: filename,
      message: 'Audio file available',
      audioUrl: `/voice/${filename}`
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}