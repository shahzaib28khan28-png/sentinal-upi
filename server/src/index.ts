import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze';
import { historyRouter } from './routes/history';
import { statsRouter } from './routes/stats';
import { healthRouter } from './routes/health';
import { getAIProviderStatus } from './ai/aiProvider';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Security and utility middleware
app.use(
  cors({
    origin: true, // Allow frontend dev server and production builds
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);
app.use('/api/stats', statsRouter);
app.use('/api/health', healthRouter);

// Root informative endpoint
app.get('/api', (_req, res) => {
  res.json({
    project: 'UPI Sentinel',
    tagline: 'Detect UPI Scams Before You Pay',
    problemStatement: 'PS-03: UPI Scam Detection & Risk Analysis System',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      'POST /api/analyze/message',
      'POST /api/analyze/url',
      'POST /api/analyze/qr',
      'POST /api/analyze/transaction',
      'POST /api/analyze/context',
      'GET /api/history',
      'GET /api/history/:id',
      'DELETE /api/history/:id',
      'DELETE /api/history',
      'GET /api/stats',
      'GET /api/health'
    ]
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server exception:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  const aiStatus = getAIProviderStatus();
  console.log(`========================================================`);
  console.log(`🛡️  UPI SENTINEL BACKEND ENGINE ONLINE`);
  console.log(`⚡  Listening on http://localhost:${PORT}`);
  console.log(`🤖  AI Provider: ${aiStatus.activeProviderName} (${aiStatus.isLiveAPI ? 'Live API' : 'Offline Heuristic Demo'})`);
  console.log(`========================================================`);
});
