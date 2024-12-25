import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import { queue } from '@/lib/queue';

// Upstash Redis REST API接続
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL?.replace('redis://', 'https://') || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const status = await queue.getJobStatus(jobId);
    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    logger.error('ジョブステータスの取得に失敗', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
} 