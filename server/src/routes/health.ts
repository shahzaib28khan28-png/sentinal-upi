import { Router, Request, Response } from 'express';
import { getAIProviderStatus } from '../ai/aiProvider';

export const healthRouter = Router();

// GET /api/health
healthRouter.get('/', (_req: Request, res: Response): void => {
  const aiStatus = getAIProviderStatus();

  res.json({
    status: 'online',
    engine: 'UPI Sentinel Detection Engine v1.0.0',
    timestamp: new Date().toISOString(),
    ai: aiStatus,
    securityNotice: 'UPI Sentinel is a hackathon prototype. Risk assessments are advisory and should not be treated as definitive proof of fraud. No direct access to private NPCI or bank internal databases is claimed.'
  });
});
