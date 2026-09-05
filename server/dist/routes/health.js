"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const aiProvider_1 = require("../ai/aiProvider");
exports.healthRouter = (0, express_1.Router)();
// GET /api/health
exports.healthRouter.get('/', (_req, res) => {
    const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
    res.json({
        status: 'online',
        engine: 'UPI Sentinel Detection Engine v1.0.0',
        timestamp: new Date().toISOString(),
        ai: aiStatus,
        securityNotice: 'UPI Sentinel is a hackathon prototype. Risk assessments are advisory and should not be treated as definitive proof of fraud. No direct access to private NPCI or bank internal databases is claimed.'
    });
});
