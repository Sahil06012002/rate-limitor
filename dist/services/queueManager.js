"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../config/logger"));
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
class QueueManager {
    constructor() {
        this.queuePrefix = 'queue:';
    }
    getQueueKey(appId) {
        return `${this.queuePrefix}${appId}`;
    }
    async enqueueRequest(request) {
        const key = this.getQueueKey(request.appId);
        try {
            await redis.lpush(key, JSON.stringify(request));
            logger_1.default.info(`Request queued for app ${request.appId}`);
        }
        catch (error) {
            logger_1.default.error('Error enqueueing request:', error);
            throw error;
        }
    }
    async dequeueRequest(appId) {
        const key = this.getQueueKey(appId);
        try {
            const request = await redis.rpop(key);
            if (!request)
                return null;
            return JSON.parse(request);
        }
        catch (error) {
            logger_1.default.error('Error dequeuing request:', error);
            throw error;
        }
    }
    async getQueueLength(appId) {
        const key = this.getQueueKey(appId);
        try {
            return await redis.llen(key);
        }
        catch (error) {
            logger_1.default.error('Error getting queue length:', error);
            throw error;
        }
    }
}
exports.QueueManager = QueueManager;
