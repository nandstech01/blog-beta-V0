import Redis from 'ioredis';
import { logger } from './logger';

let redis: Redis | null = null;
let initializationPromise: Promise<void> | null = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getRedisClient(): Promise<Redis | null> {
  if (redis) {
    return redis;
  }

  try {
    if (!initializationPromise) {
      initializationPromise = (async () => {
        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            if (!process.env.UPSTASH_REDIS_REST_URL) {
              throw new Error('UPSTASH_REDIS_REST_URL is not defined');
            }

            redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
              tls: {
                rejectUnauthorized: false
              },
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
              }
            });

            // Test connection
            const testKey = `test-${Date.now()}`;
            await redis.set(testKey, 'test');
            await redis.del(testKey);
            
            logger.info('Redis connection established', {
              url: process.env.UPSTASH_REDIS_REST_URL.replace(/\/\/.*@/, '//***@')
            });
            break;
          } catch (error) {
            retries++;
            logger.error('Failed to initialize Redis', { 
              attempt: retries, 
              maxRetries: MAX_RETRIES,
              error: error instanceof Error ? error.message : String(error)
            });
            
            if (retries === MAX_RETRIES) {
              throw error;
            }
            
            await sleep(RETRY_DELAY * retries);
          }
        }
      })();
    }

    await initializationPromise;
    return redis;
  } catch (error) {
    logger.error('Failed to initialize Redis', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      redis = null;
      initializationPromise = null;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Failed to close Redis connection', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Redis操作のラッパー関数
export async function withRedisClient<T>(operation: (client: Redis) => Promise<T>): Promise<T | null> {
  const client = await getRedisClient();
  if (!client) {
    logger.error('Redis client is not available');
    return null;
  }

  try {
    return await operation(client);
  } catch (error) {
    logger.error('Redis operation failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
} 