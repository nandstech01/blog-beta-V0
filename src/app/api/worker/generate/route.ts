import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import { queue, QUEUE_NAME } from '@/lib/queue';
import { JobData } from '@/lib/types';

// Upstash Redis REST API接続
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL?.replace('redis://', 'https://') || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    logger.info('ジョブ生成リクエストを受信', data);

    const { nanoid } = await import('nanoid');
    const jobId = nanoid();
    const jobData: JobData = {
      ...data,
      status: 'generating'
    };

    // キューにジョブを追加
    const job = await queue.add('generate', jobData, { jobId });

    logger.info('キューにジョブを追加しました', {
      jobId: job.id
    });

    return NextResponse.json({
      jobId: job.id,
      status: 'generating'
    });
  } catch (error) {
    logger.error('ジョブ生成リクエストの処理中にエラーが発生', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 