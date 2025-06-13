import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 在 Docker 环境中使用容器名，否则使用 localhost
    const isDocker = process.env.DOCKER_ENV === 'true';
    const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

    const body = await request.json();
    console.log(
      `[Frontend API] /api/image/generate - Proxying request to: ${backendUrl}/api/image/generate`
    );

    const response = await fetch(`${backendUrl}/api/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[Frontend API] Backend response error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({
        message: '图片生成服务出现问题，可能是AI的画笔没墨了',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Frontend API] Error proxying image generation to backend:', error);
    return NextResponse.json(
      {
        error: '图片生成服务连接失败，AI画家可能在摸鱼',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
