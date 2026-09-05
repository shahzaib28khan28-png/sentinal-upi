"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const analyze_1 = require("./routes/analyze");
const history_1 = require("./routes/history");
const stats_1 = require("./routes/stats");
const health_1 = require("./routes/health");
const aiProvider_1 = require("./ai/aiProvider");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// Security and utility middleware
app.use((0, cors_1.default)({
    origin: true, // Allow frontend dev server and production builds
    credentials: true
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// API Routes
app.use('/api/analyze', analyze_1.analyzeRouter);
app.use('/api/history', history_1.historyRouter);
app.use('/api/stats', stats_1.statsRouter);
app.use('/api/health', health_1.healthRouter);
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
app.use((err, _req, res, _next) => {
    console.error('Unhandled server exception:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
    console.log(`========================================================`);
    console.log(`🛡️  UPI SENTINEL BACKEND ENGINE ONLINE`);
    console.log(`⚡  Listening on http://localhost:${PORT}`);
    console.log(`🤖  AI Provider: ${aiStatus.activeProviderName} (${aiStatus.isLiveAPI ? 'Live API' : 'Offline Heuristic Demo'})`);
    console.log(`========================================================`);
});
