import { Router, Request, Response } from 'express';
import { getStats } from '../db';

export const statsRouter = Router();

// GET /api/stats
statsRouter.get('/', (_req: Request, res: Response): void => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' });
  }
});
