import Redis from 'ioredis';
import { QueuedRequest } from '../types';
import logger from '../config/logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class QueueManager {
  private readonly queuePrefix = 'queue:';

  constructor() {}

  private getQueueKey(appId: string): string {
    return `${this.queuePrefix}${appId}`;
  }

  async enqueueRequest(request: QueuedRequest): Promise<void> {
    const key = this.getQueueKey(request.appId);
    try {
      await redis.lpush(key, JSON.stringify(request));
      logger.info(`Request queued for app ${request.appId}`);
    } catch (error) {
      logger.error('Error enqueueing request:', error);
      throw error;
    }
  }

  async dequeueRequest(appId: string): Promise<QueuedRequest | null> {
    const key = this.getQueueKey(appId);
    try {
      const request = await redis.rpop(key);
      if (!request) return null;
      return JSON.parse(request);
    } catch (error) {
      logger.error('Error dequeuing request:', error);
      throw error;
    }
  }

  async getQueueLength(appId: string): Promise<number> {
    const key = this.getQueueKey(appId);
    try {
      return await redis.llen(key);
    } catch (error) {
      logger.error('Error getting queue length:', error);
      throw error;
    }
  }
}