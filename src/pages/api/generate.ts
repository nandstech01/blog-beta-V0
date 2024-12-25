import { NextApiRequest, NextApiResponse } from 'next';
import { queue } from '@/lib/queue';
import { logger } from '@/lib/logger';
import { JobData } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    const { nanoid } = await import('nanoid');
    const jobId = nanoid();
    const jobData: JobData = {
      prompt,
      status: 'generating'
    };

    logger.info('記事生成ジョブを作成します', { jobId, prompt });

    const job = await queue.add('generate', jobData, { jobId });

    logger.info('記事生成ジョブを作成しました', { jobId, job });

    return res.status(200).json({ id: jobId });
  } catch (error) {
    logger.error('記事生成ジョブの作成に失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
} 