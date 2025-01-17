import { Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../config/supabase';
import { TokenBucketRateLimiter } from '../services/rateLimiter';
import { QueueManager } from '../services/queueManager';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

const rateLimiter = new TokenBucketRateLimiter();
const queueManager = new QueueManager();

export const proxyRequest = async (req: Request, res: Response) => {
  const appId = req.params.appId;
  const path = req.params[0];

  try {
    // Get app configuration
    const { data: app, error } = await supabase
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
        id: uuidv4(),
        appId,
        method: req.method,
        path,
        headers: req.headers as Record<string, string>,
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
    const response = await axios({
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
  } catch (error) {
    logger.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
};