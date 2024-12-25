import { logger } from '@/lib/logger';
import { queue } from '@/lib/queue';
import { processArticleJob } from '@/workers/articleGenerator';

// ワーカーの初期化と実行
export async function startWorker() {
  try {
    logger.info('ワーカーを開始します');

    while (true) {
      // 待機中のジョブを取得
      const jobs = await queue.getWaiting();
      
      for (const job of jobs) {
        try {
          await processArticleJob(job);
        } catch (error) {
          logger.error('ジョブの処理に失敗', {
            jobId: job.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // 1秒待機してから次のポーリング
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    logger.error('ワーカーの実行中にエラーが発生', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
} 