import Redis from 'ioredis';
import logger from './logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy: () => null,
  maxRetriesPerRequest: 1,
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export const cacheGet = async (key: string): Promise<any> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 3600
): Promise<boolean> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DEL error:', error);
    return false;
  }
};

export const cacheFlush = async (): Promise<boolean> => {
  try {
    await redis.flushdb();
    return true;
  } catch (error) {
    logger.error('Redis FLUSH error:', error);
    return false;
  }
};

export default redis;
