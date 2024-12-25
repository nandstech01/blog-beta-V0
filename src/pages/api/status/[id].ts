import { NextApiRequest, NextApiResponse } from 'next';
import { queue } from '@/lib/queue';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    logger.info('ジョブステータスを取得します', { jobId: id });

    const job = await queue.getJob(id);

    if (!job) {
      logger.warn('ジョブが見つかりません', { jobId: id });
      return res.status(404).json({ error: 'Job not found' });
    }

    logger.info('ジョブステータスを取得しました', { jobId: id, job });

    return res.status(200).json(job);
  } catch (error) {
    logger.error('ジョブステータスの取得に失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
} 