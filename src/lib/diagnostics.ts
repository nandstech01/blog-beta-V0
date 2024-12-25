import { Redis } from '@upstash/redis';
import { logger } from './logger';
import { JobStatus } from './queue';

interface DiagnosticResult {
  status: 'ok' | 'error';
  message: string;
  details?: any;
}

interface JobStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export class Diagnostics {
  constructor(private redis: Redis) {}

  async checkRedisConnection(): Promise<DiagnosticResult> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const latency = Date.now() - startTime;

      return {
        status: 'ok',
        message: `Redis接続は正常です (レイテンシ: ${latency}ms)`,
        details: { latency },
      };
    } catch (error) {
      logger.error('Redis接続チェックに失敗', error);
      return {
        status: 'error',
        message: 'Redis接続に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getJobStatistics(): Promise<JobStats> {
    try {
      logger.info('ジョブ統計情報の収集を開始');
      
      // TODO: 実際のジョブ統計情報収集を実装
      const stats: JobStats = {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      };
      
      return stats;
    } catch (error) {
      logger.error('ジョブ統計情報の収集に失敗', error);
      throw error;
    }
  }

  async checkSystemHealth(): Promise<DiagnosticResult> {
    try {
      logger.info('システム健全性チェックを開始');
      
      // Redis接続チェック
      const redisCheck = await this.checkRedisConnection();
      if (redisCheck.status === 'error') {
        return redisCheck;
      }
      
      // ジョブ統計情報の確認
      const jobStats = await this.getJobStatistics();
      
      return {
        status: 'ok',
        message: 'システムは正常に動作しています',
        details: {
          redis: redisCheck,
          jobStats,
        },
      };
    } catch (error) {
      logger.error('システム健全性チェックに失敗', error);
      return {
        status: 'error',
        message: 'システム健全性チェックに失敗しました',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export async function createDiagnostics(redis: Redis): Promise<Diagnostics> {
  if (!redis) {
    throw new Error('Redis client is required');
  }
  return new Diagnostics(redis);
} 