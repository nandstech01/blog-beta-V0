import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { queue } from '@/lib/queue';
import { JobResult, JobStatusType } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, progress, result, error } = body;

    logger.info('ジョブステータス更新リクエストを受信', {
      jobId,
      status,
      progress,
      hasResult: !!result,
      error
    });

    const job = await queue.getJob(jobId);
    if (!job) {
      logger.error('ジョブが見つかりません', { jobId });
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // ステータス、進捗、結果、エラーを一括で更新
    const updatedJob = await queue.updateJobStatus(
      jobId,
      status || job.status,
      typeof progress === 'number' ? progress : job.progress || 0,
      result || job.result,
      error || job.error
    );

    if (!updatedJob) {
      logger.error('ジョブの更新に失敗しました', { jobId });
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    logger.info('ジョブを更新しました', {
      jobId,
      status: updatedJob.status,
      progress: updatedJob.progress,
      hasResult: !!updatedJob.result,
      error: updatedJob.error
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    logger.error('ジョブステータスの更新に失敗', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
} 