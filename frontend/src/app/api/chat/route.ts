import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 在 Docker 环境中使用容器名，否则使用 localhost
    const isDocker = process.env.DOCKER_ENV === 'true';
    const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

    const body = await request.json();
    console.log(`[Frontend API] /api/chat - Proxying request to: ${backendUrl}/api/chat`);

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[Frontend API] Backend response error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({
        message: '后端服务出现问题，请稍后再试',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Frontend API] Error proxying to backend:', error);
    return NextResponse.json(
      {
        error: '服务器连接失败，请检查网络连接或稍后再试',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
