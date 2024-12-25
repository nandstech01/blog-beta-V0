import { Worker } from 'bullmq';
import { logger } from './logger';
import { QUEUE_NAME, JobData } from './queue';
import { generateArticle } from './articleGenerator';

// ワーカーの設定
const worker = new Worker<JobData>(QUEUE_NAME, async (job) => {
  try {
    if (!job?.id) {
      throw new Error('ジョブIDが見つかりません');
    }

    logger.info('ジョブの処理を開始', { jobId: job.id });
    
    const result = await generateArticle(job.data, job.id.toString());
    
    logger.info('ジョブの処理が完了', { 
      jobId: job.id,
      contentLength: result.content.length
    });
    
    return result;
  } catch (error) {
    logger.error('ジョブの処理中にエラーが発生', {
      jobId: job?.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
});

worker.on('completed', (job) => {
  if (!job?.id) {
    logger.warn('完了したジョブのIDが見つかりません');
    return;
  }
  logger.info('ジョブが正常に完了', { jobId: job.id });
});

worker.on('failed', (job, error) => {
  logger.error('ジョブが失敗', {
    jobId: job?.id,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
});

export { worker }; 