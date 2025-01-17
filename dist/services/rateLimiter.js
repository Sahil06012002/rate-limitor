"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucketRateLimiter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../config/logger"));
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
class TokenBucketRateLimiter {
    constructor() {
        this.keyPrefix = 'ratelimit:';
    }
    getKey(appId) {
        return `${this.keyPrefix}${appId}`;
    }
    async isAllowed(appId, limit, window) {
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
        }
        catch (error) {
            logger_1.default.error('Rate limiter error:', error);
            return false;
        }
    }
    async getRemainingRequests(appId, limit) {
        const key = this.getKey(appId);
        const current = await redis.get(key);
        if (!current)
            return limit;
        return Math.max(0, limit - parseInt(current, 10));
    }
}
exports.TokenBucketRateLimiter = TokenBucketRateLimiter;
