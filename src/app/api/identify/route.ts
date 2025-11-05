import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 获取请求头信息
    const headersList = headers();

    // 获取真实的客户端IP（考虑代理情况）
    const clientIP = (() => {
      // 检查各种可能的IP头
      const ipHeaders = [
        'CF-Connecting-IP', // Cloudflare
        'X-Forwarded-For', // 标准代理头
        'X-Real-IP', // Nginx代理
        'X-Client-IP', // Apache代理
      ];

      for (const header of ipHeaders) {
        const ip = headersList.get(header);
        if (ip && typeof ip === 'string') {
          // 如果是多个IP（X-Forwarded-For可能包含多个），取第一个
          return ip.split(',')[0].trim();
        }
      }

      // 如果没有代理头，使用直接连接的IP
      return request.ip || 'unknown';
    })();

    // 获取用户代理
    const userAgent = headersList.get('user-agent') || 'unknown';

    // 获取设备ID（如果已存在）
    const existingDeviceId = headersList.get('DeviceId') || 'unknown';

    // 生成设备指纹
    const deviceFingerprint = {
      ip: clientIP,
      userAgent: userAgent,
      acceptLanguage: headersList.get('accept-language') || 'unknown',
      acceptEncoding: headersList.get('accept-encoding') || 'unknown',
      dnt: headersList.get('dnt') || 'unknown',
      secChUa: headersList.get('sec-ch-ua') || 'unknown',
      secChUaMobile: headersList.get('sec-ch-ua-mobile') || 'unknown',
      secChUaPlatform: headersList.get('sec-ch-ua-platform') || 'unknown',
    };

    // 生成设备ID（基于IP和用户代理的哈希）
    const generateDeviceId = (
      fingerprint: typeof deviceFingerprint
    ): string => {
      const fingerprintString = JSON.stringify(fingerprint);
      // 简单的哈希函数生成设备ID
      let hash = 0;
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // 转换为32位整数
      }
      return `device_${Math.abs(hash).toString(16)}`;
    };

    // 如果没有现有设备ID，生成一个新的
    const deviceId =
      existingDeviceId !== 'unknown'
        ? existingDeviceId
        : generateDeviceId(deviceFingerprint);

    // 返回设备信息
    return NextResponse.json({
      success: true,
      deviceId: deviceId,
      fingerprint: deviceFingerprint,
      isNewDevice: existingDeviceId === 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Device identification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to identify device',
        deviceId: null,
      },
      { status: 500 }
    );
  }
}

// 支持GET请求用于获取基本信息
export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const clientIP =
      headersList.get('CF-Connecting-IP') ||
      headersList.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      request.ip ||
      'unknown';

    return NextResponse.json({
      success: true,
      ip: clientIP,
      userAgent: headersList.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Device identification GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get device information',
      },
      { status: 500 }
    );
  }
}
