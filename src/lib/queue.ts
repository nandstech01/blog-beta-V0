import { Redis } from '@upstash/redis';
import { logger } from './logger';
import { Job, JobData, JobResult, JobStatus, JobStatusType } from './types';

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// キューの名前
export const QUEUE_NAME = 'article-queue';

// Upstash Redis REST API接続
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL?.replace('redis://', 'https://') || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

logger.info('Redis設定を読み込みました');

// キューの操作関数
export const queue = {
  // ジョブの追加
  async add(name: string, data: JobData, options: { jobId: string }): Promise<Job> {
    try {
      const jobData: Job = {
        id: options.jobId,
        name,
        data,
        status: 'generating',
        createdAt: new Date().toISOString(),
        progress: 0
      };

      // JobオブジェクトをRedis用のプレーンオブジェクトに変換
      const redisData = {
        ...jobData,
        data: JSON.stringify(jobData.data)
      };

      await redis.hset(`job:${options.jobId}`, redisData);
      await redis.lpush('job:queue', options.jobId);

      logger.info('ジョブをキューに追加しました', {
        jobId: options.jobId,
        data: jobData
      });

      return jobData;
    } catch (error) {
      logger.error('ジョブの追加に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  },

  // ジョブの取得
  async getJob(jobId: string): Promise<Job | null> {
    try {
      const redisData = await redis.hgetall(`job:${jobId}`);
      if (!redisData || Object.keys(redisData).length === 0) {
        return null;
      }

      // Redis形式のデータをJobオブジェクトに変換
      const jobData: Job = {
        id: redisData.id as string,
        name: redisData.name as string,
        data: JSON.parse(redisData.data as string) as JobData,
        status: redisData.status as JobStatusType,
        createdAt: redisData.createdAt as string,
        progress: Number(redisData.progress || 0),
        result: redisData.result ? JSON.parse(redisData.result as string) as JobResult : undefined,
        error: redisData.error as string | undefined
      };

      return jobData;
    } catch (error) {
      logger.error('ジョブの取得に失敗', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  },

  // ジョブステータスの取得
  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    try {
      const job = await this.getJob(jobId);
      if (!job) {
        return null;
      }

      return {
        id: job.id,
        status: job.status,
        progress: job.progress || 0,
        result: job.result,
        error: job.error,
        data: job.data
      };
    } catch (error) {
      logger.error('ジョブステータスの取得に失敗', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  },

  // ジョブステータスの更新
  async updateJobStatus(
    jobId: string,
    status: JobStatusType,
    progress: number,
    result?: JobResult,
    error?: string
  ): Promise<Job | null> {
    try {
      const job = await this.getJob(jobId);
      if (!job) {
        return null;
      }

      const updatedJob: Job = {
        ...job,
        status,
        progress,
        result,
        error,
        data: {
          ...job.data,
          status,
          result,
          error
        }
      };

      // JobオブジェクトをRedis用のプレーンオブジェクトに変換
      const redisData = {
        ...updatedJob,
        data: JSON.stringify(updatedJob.data),
        result: updatedJob.result ? JSON.stringify(updatedJob.result) : undefined
      };

      await redis.hset(`job:${jobId}`, redisData);

      // ステータスに応じてキューを更新
      if (status === 'completed') {
        await redis.lrem('job:queue', 0, jobId);
        await redis.lpush('job:completed', jobId);
      } else if (status === 'failed') {
        await redis.lrem('job:queue', 0, jobId);
        await redis.lpush('job:failed', jobId);
      }

      logger.info('ジョブステータスを更新しました', {
        jobId,
        status,
        progress,
        result,
        error
      });

      return updatedJob;
    } catch (error) {
      logger.error('ジョブステータスの更新に失敗', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  },

  // ジョブの削除
  async remove(jobId: string) {
    try {
      await redis.del(`job:${jobId}`);
      await redis.lrem('job:queue', 0, jobId);
      await redis.lrem('job:completed', 0, jobId);
      await redis.lrem('job:failed', 0, jobId);
      logger.info('ジョブを削除しました', { jobId });
    } catch (error) {
      logger.error('ジョブの削除に失敗', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  },

  // 待機中のジョブを取得
  async getWaiting(): Promise<Job[]> {
    try {
      const jobIds = await redis.lrange('job:queue', 0, -1);
      const jobs = await Promise.all(
        jobIds.map(async (jobId) => {
          const jobData = await this.getJob(jobId);
          return jobData;
        })
      );
      return jobs.filter((job): job is Job => job !== null);
    } catch (error) {
      logger.error('待機中のジョブの取得に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  },

  // キューの状態を取得
  async getActiveCount() {
    try {
      const count = await redis.llen('job:active');
      return count;
    } catch (error) {
      logger.error('アクティブなジョブ数の取得に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  },

  async getWaitingCount() {
    try {
      const count = await redis.llen('job:queue');
      return count;
    } catch (error) {
      logger.error('待機中のジョブ数の取得に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  },

  async getCompletedCount() {
    try {
      const count = await redis.llen('job:completed');
      return count;
    } catch (error) {
      logger.error('完了したジョブ数の取得に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  },

  async getFailedCount() {
    try {
      const count = await redis.llen('job:failed');
      return count;
    } catch (error) {
      logger.error('失敗したジョブ数の取得に失敗', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }
}; 