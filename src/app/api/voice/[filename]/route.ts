import { join } from 'path';
import { readFile } from 'fs/promises';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for file system access

// 支持的音频文件扩展名
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

// MIME类型映射
const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // 验证文件名安全性
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // 检查文件扩展名
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // 防止路径遍历攻击
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      );
    }

    // 构建文件路径
    const filePath = join(process.cwd(), 'public', 'voice', filename);

    try {
      // 读取文件
      const fileBuffer = await readFile(filePath);
      const mimeType = MIME_TYPES[ext] || 'audio/mpeg';

      // 设置缓存头
      const headers = new Headers({
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // 1年缓存
        ETag: `"${Date.now()}-${fileBuffer.length}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error(`File not found: ${filePath}`, fileError);
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 支持CORS预检请求
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
