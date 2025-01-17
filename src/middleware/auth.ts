import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};