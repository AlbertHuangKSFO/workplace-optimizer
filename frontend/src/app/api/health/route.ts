import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'workplace-optimizer-frontend',
    version: process.env.npm_package_version || '1.0.0',
  });
}
