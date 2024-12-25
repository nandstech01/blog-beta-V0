import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Health check started');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL);
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Redisの接続テスト
    const pingResult = await redis.ping();
    console.log('Redis ping result:', pingResult);

    return NextResponse.json({
      status: 'healthy',
      redis: 'connected',
      timestamp: new Date().toISOString(),
      env: process.env.VERCEL_ENV || 'unknown'
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      env: process.env.VERCEL_ENV || 'unknown'
    }, { status: 500 });
  }
} 