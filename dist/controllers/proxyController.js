"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("../config/supabase");
const rateLimiter_1 = require("../services/rateLimiter");
const queueManager_1 = require("../services/queueManager");
const logger_1 = __importDefault(require("../config/logger"));
const uuid_1 = require("uuid");
const rateLimiter = new rateLimiter_1.TokenBucketRateLimiter();
const queueManager = new queueManager_1.QueueManager();
const proxyRequest = async (req, res) => {
    const appId = req.params.appId;
    const path = req.params[0];
    try {
        // Get app configuration
        const { data: app, error } = await supabase_1.supabase
            .from('apps')
            .select('*')
            .eq('id', appId)
            .eq('user_id', req.user.id)
            .single();
        if (error || !app) {
            return res.status(404).json({ error: 'App not found' });
        }
        // Check rate limit
        const allowed = await rateLimiter.isAllowed(appId, app.rate_limit, app.time_window);
        if (!allowed) {
            // Queue the request
            const queuedRequest = {
                id: (0, uuid_1.v4)(),
                appId,
                method: req.method,
                path,
                headers: req.headers,
                body: req.body,
                timestamp: Date.now()
            };
            await queueManager.enqueueRequest(queuedRequest);
            const queuePosition = await queueManager.getQueueLength(appId);
            return res.status(429).json({
                error: 'Rate limit exceeded',
                queuePosition,
                retryAfter: app.time_window
            });
        }
        // Forward the request
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `${app.base_url}/${path}`,
            headers: {
                ...req.headers,
                host: new URL(app.base_url).host
            },
            data: req.body,
            validateStatus: () => true
        });
        // Forward the response
        res.status(response.status).json(response.data);
    }
    catch (error) {
        logger_1.default.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed' });
    }
};
exports.proxyRequest = proxyRequest;
