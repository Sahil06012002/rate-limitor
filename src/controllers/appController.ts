import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { z } from 'zod';

const appSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  rateLimit: z.number().positive(),
  timeWindow: z.number().positive()
});

export const registerApp = async (req: Request, res: Response) => {
  try {
    const validation = appSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { name, baseUrl, rateLimit, timeWindow } = validation.data;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('apps')
      .insert([{
        id: uuidv4(),
        user_id: userId,
        name,
        base_url: baseUrl,
        rate_limit: rateLimit,
        time_window: timeWindow
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'App registered successfully',
      app: data
    });
  } catch (error) {
    logger.error('App registration error:', error);
    res.status(500).json({ error: 'Failed to register app' });
  }
};

export const getApps = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ apps: data });
  } catch (error) {
    logger.error('Get apps error:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
};