import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const apiKey = uuidv4();

    const { data, error } = await supabase
      .from('users')
      .insert([{ api_key: apiKey }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Registration successful',
      api_key: apiKey
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
};