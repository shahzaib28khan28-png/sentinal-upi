"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRouter = void 0;
const express_1 = require("express");
const aiProvider_1 = require("../ai/aiProvider");
const messageAnalyzer_1 = require("../analysis/messageAnalyzer");
const urlAnalyzer_1 = require("../analysis/urlAnalyzer");
const qrAnalyzer_1 = require("../analysis/qrAnalyzer");
const transactionAnalyzer_1 = require("../analysis/transactionAnalyzer");
const riskEngine_1 = require("../analysis/riskEngine");
const db_1 = require("../db");
exports.analyzeRouter = (0, express_1.Router)();
const MAX_INPUT_LENGTH = 10000;
// POST /api/analyze/message
exports.analyzeRouter.post('/message', async (req, res) => {
    try {
        const { text, sender, channel } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            res.status(400).json({ error: 'Message content is required.' });
            return;
        }
        if (text.length > MAX_INPUT_LENGTH) {
            res.status(400).json({ error: `Message exceeds maximum allowed length (${MAX_INPUT_LENGTH} chars).` });
            return;
        }
        // 1. Deterministic Analysis
        const deterministic = (0, messageAnalyzer_1.analyzeMessageDeterministically)({ text, sender, channel });
        // 2. AI Semantic Analysis
        const aiProvider = (0, aiProvider_1.getAIProvider)();
        const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
        const aiResult = await aiProvider.analyze({
            type: 'message',
            content: text,
            additionalContext: {
                sender,
                channel,
                extractedUrls: deterministic.extractedUrls.map((u) => u.url),
                extractedUpis: deterministic.extractedUpis.map((u) => u.pa)
            }
        });
        // 3. Hybrid Risk Synthesis
        const finalResult = (0, riskEngine_1.synthesizeRiskAnalysis)({
            inputType: 'message',
            inputContent: text,
            aiResult,
            deterministicIndicators: deterministic.indicators,
            deterministicScore: deterministic.deterministicRisk,
            isAiGenerated: aiStatus.isLiveAPI,
            aiProviderName: aiStatus.activeProviderName,
            metadata: {
                extractedUrls: deterministic.extractedUrls,
                extractedUpis: deterministic.extractedUpis
            }
        });
        // 4. Save to local SQLite database
        const savedId = (0, db_1.saveAnalysis)(finalResult, 'message', text);
        finalResult.id = savedId;
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error analyzing message:', error);
        res.status(500).json({ error: 'Internal server error while evaluating message.' });
    }
});
// POST /api/analyze/url
exports.analyzeRouter.post('/url', async (req, res) => {
    try {
        const { url, contextText } = req.body;
        if (!url || typeof url !== 'string' || url.trim() === '') {
            res.status(400).json({ error: 'URL is required.' });
            return;
        }
        if (url.length > 2048) {
            res.status(400).json({ error: 'URL exceeds maximum allowable length.' });
            return;
        }
        // Deterministic Heuristic URL Analysis (NO SSRF OUTBOUND CALLS)
        const deterministic = (0, urlAnalyzer_1.analyzeUrlDeterministically)(url);
        // AI Semantic Evaluation
        const aiProvider = (0, aiProvider_1.getAIProvider)();
        const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
        const aiResult = await aiProvider.analyze({
            type: 'url',
            content: url,
            additionalContext: {
                contextText,
                hostname: deterministic.details.hostname,
                tld: deterministic.details.tld,
                isHttps: deterministic.details.isHttps,
                impersonatedBrand: deterministic.details.impersonatedBrand
            }
        });
        const finalResult = (0, riskEngine_1.synthesizeRiskAnalysis)({
            inputType: 'url',
            inputContent: url,
            aiResult,
            deterministicIndicators: deterministic.indicators,
            deterministicScore: deterministic.riskScore,
            isAiGenerated: aiStatus.isLiveAPI,
            aiProviderName: aiStatus.activeProviderName,
            metadata: {
                urlDetails: deterministic.details
            }
        });
        const savedId = (0, db_1.saveAnalysis)(finalResult, 'url', url);
        finalResult.id = savedId;
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error analyzing url:', error);
        res.status(500).json({ error: 'Internal server error while inspecting URL.' });
    }
});
// POST /api/analyze/qr
exports.analyzeRouter.post('/qr', async (req, res) => {
    try {
        const { qrData, userContext } = req.body;
        if (!qrData || typeof qrData !== 'string' || qrData.trim() === '') {
            res.status(400).json({ error: 'QR code payload data is required.' });
            return;
        }
        // Deterministic UPI Protocol & Collect Trap Analysis
        const deterministic = (0, qrAnalyzer_1.analyzeQrDeterministically)(qrData, userContext);
        // AI Semantic Analysis
        const aiProvider = (0, aiProvider_1.getAIProvider)();
        const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
        const aiResult = await aiProvider.analyze({
            type: 'qr',
            content: qrData,
            additionalContext: {
                userContext,
                upiDetails: deterministic.upiDetails,
                isCollectRequest: deterministic.upiDetails.isCollectRequest,
                warnings: deterministic.warnings
            }
        });
        const finalResult = (0, riskEngine_1.synthesizeRiskAnalysis)({
            inputType: 'qr',
            inputContent: qrData,
            aiResult,
            deterministicIndicators: deterministic.indicators,
            deterministicScore: deterministic.deterministicRisk,
            isAiGenerated: aiStatus.isLiveAPI,
            aiProviderName: aiStatus.activeProviderName,
            metadata: {
                upiDetails: deterministic.upiDetails,
                mandatorySafetyNotice: deterministic.mandatorySafetyNotice
            }
        });
        const savedId = (0, db_1.saveAnalysis)(finalResult, 'qr', qrData);
        finalResult.id = savedId;
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error analyzing QR:', error);
        res.status(500).json({ error: 'Internal server error while processing QR code.' });
    }
});
// POST /api/analyze/transaction
exports.analyzeRouter.post('/transaction', async (req, res) => {
    try {
        const body = req.body;
        if (body.amount === undefined || isNaN(Number(body.amount)) || Number(body.amount) < 0) {
            res.status(400).json({ error: 'Valid transaction amount is required.' });
            return;
        }
        if (!body.receiverUpi || typeof body.receiverUpi !== 'string' || body.receiverUpi.trim() === '') {
            res.status(400).json({ error: 'Receiver UPI address is required.' });
            return;
        }
        const deterministic = (0, transactionAnalyzer_1.analyzeTransactionDeterministically)({
            amount: Number(body.amount),
            receiverUpi: body.receiverUpi,
            merchantCategory: body.merchantCategory,
            transactionDescription: body.transactionDescription,
            isNewRecipient: Boolean(body.isNewRecipient),
            isUserInitiated: Boolean(body.isUserInitiated),
            suspiciousMessageReceived: Boolean(body.suspiciousMessageReceived)
        });
        const aiProvider = (0, aiProvider_1.getAIProvider)();
        const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
        const aiResult = await aiProvider.analyze({
            type: 'transaction',
            content: `Payment of ₹${body.amount} to ${body.receiverUpi}. Note: "${body.transactionDescription || 'None'}". Category: ${body.merchantCategory || 'Personal'}`,
            additionalContext: {
                isNewRecipient: body.isNewRecipient,
                isUserInitiated: body.isUserInitiated,
                suspiciousMessageReceived: body.suspiciousMessageReceived,
                amount: body.amount,
                receiverUpi: body.receiverUpi
            }
        });
        const finalResult = (0, riskEngine_1.synthesizeRiskAnalysis)({
            inputType: 'transaction',
            inputContent: `₹${body.amount} to ${body.receiverUpi} (${body.transactionDescription || 'No description'})`,
            aiResult,
            deterministicIndicators: deterministic.indicators,
            deterministicScore: deterministic.deterministicRisk,
            isAiGenerated: aiStatus.isLiveAPI,
            aiProviderName: aiStatus.activeProviderName,
            metadata: {
                transactionDetails: body
            }
        });
        const savedId = (0, db_1.saveAnalysis)(finalResult, 'transaction', `Payment ₹${body.amount} to ${body.receiverUpi}`);
        finalResult.id = savedId;
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error analyzing transaction:', error);
        res.status(500).json({ error: 'Internal server error while evaluating transaction parameters.' });
    }
});
// POST /api/analyze/context
exports.analyzeRouter.post('/context', async (req, res) => {
    try {
        const { scenarioDescription, supportingData } = req.body;
        if (!scenarioDescription || typeof scenarioDescription !== 'string' || scenarioDescription.trim() === '') {
            res.status(400).json({ error: 'Scenario description is required.' });
            return;
        }
        if (scenarioDescription.length > MAX_INPUT_LENGTH) {
            res.status(400).json({ error: `Scenario description exceeds maximum allowed length (${MAX_INPUT_LENGTH} chars).` });
            return;
        }
        // Deterministic check on any URLs or VPAs mentioned in the scenario
        const msgDet = (0, messageAnalyzer_1.analyzeMessageDeterministically)({ text: scenarioDescription });
        const aiProvider = (0, aiProvider_1.getAIProvider)();
        const aiStatus = (0, aiProvider_1.getAIProviderStatus)();
        const aiResult = await aiProvider.analyze({
            type: 'context',
            content: scenarioDescription,
            additionalContext: {
                supportingData,
                extractedUrls: msgDet.extractedUrls.map((u) => u.url),
                extractedUpis: msgDet.extractedUpis.map((u) => u.pa)
            }
        });
        const finalResult = (0, riskEngine_1.synthesizeRiskAnalysis)({
            inputType: 'context',
            inputContent: scenarioDescription,
            aiResult,
            deterministicIndicators: msgDet.indicators,
            deterministicScore: msgDet.deterministicRisk,
            isAiGenerated: aiStatus.isLiveAPI,
            aiProviderName: aiStatus.activeProviderName,
            metadata: {
                scenarioLength: scenarioDescription.length
            }
        });
        const savedId = (0, db_1.saveAnalysis)(finalResult, 'context', scenarioDescription);
        finalResult.id = savedId;
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error analyzing scenario context:', error);
        res.status(500).json({ error: 'Internal server error while processing context scenario.' });
    }
});
