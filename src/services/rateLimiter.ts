import Redis from 'ioredis';
import logger from '../config/logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class TokenBucketRateLimiter {
  private readonly keyPrefix = 'ratelimit:';

  constructor() {}

  private getKey(appId: string): string {
    return `${this.keyPrefix}${appId}`;
  }

  async isAllowed(appId: string, limit: number, window: number): Promise<boolean> {
    const key = this.getKey(appId);
    const now = Date.now();

    try {
      const current = await redis.get(key);
      
      if (!current) {
        await redis.set(key, '1', 'EX', window);
        return true;
      }

      const count = parseInt(current, 10);
      if (count < limit) {
        await redis.incr(key);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Rate limiter error:', error);
      return false;
    }
  }

  async getRemainingRequests(appId: string, limit: number): Promise<number> {
    const key = this.getKey(appId);
    const current = await redis.get(key);
    
    if (!current) return limit;
    return Math.max(0, limit - parseInt(current, 10));
  }
}