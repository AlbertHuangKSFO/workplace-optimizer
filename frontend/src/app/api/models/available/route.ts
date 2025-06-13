import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 在 Docker 环境中使用容器名，否则使用 localhost
    const isDocker = process.env.DOCKER_ENV === 'true';
    const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

    console.log(
      `[API Route] /api/models/available - Proxying to: ${backendUrl}/api/models/available`
    );

    const response = await fetch(`${backendUrl}/api/models/available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[API Route] Backend responded with status: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch models from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API Route] Successfully fetched ${data?.length || 0} models`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error proxying to backend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
