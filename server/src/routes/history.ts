import { Router, Request, Response } from 'express';
import { getAnalyses, getAnalysisById, deleteAnalysis, clearAnalyses } from '../db';

export const historyRouter = Router();

// GET /api/history
historyRouter.get('/', (req: Request, res: Response): void => {
  try {
    const { search, classification, threatType, limit, offset } = req.query;

    const result = getAnalyses({
      search: typeof search === 'string' ? search : undefined,
      classification: typeof classification === 'string' ? classification : undefined,
      threatType: typeof threatType === 'string' ? threatType : undefined,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis history.' });
  }
});

// GET /api/history/:id
historyRouter.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = getAnalysisById(id);
    if (!analysis) {
      res.status(404).json({ error: 'Analysis record not found.' });
      return;
    }
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis details:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis record.' });
  }
});

// DELETE /api/history/:id
historyRouter.delete('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = deleteAnalysis(id);
    if (!success) {
      res.status(404).json({ error: 'Analysis record not found or already deleted.' });
      return;
    }
    res.json({ message: 'Analysis record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting analysis record:', error);
    res.status(500).json({ error: 'Failed to delete record.' });
  }
});

// DELETE /api/history (Clear all history)
historyRouter.delete('/', (_req: Request, res: Response): void => {
  try {
    clearAnalyses();
    res.json({ message: 'All analysis history cleared successfully.' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear analysis history.' });
  }
});
