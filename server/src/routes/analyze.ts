import { Router, Request, Response } from 'express';
import { getAIProvider, getAIProviderStatus } from '../ai/aiProvider';
import { analyzeMessageDeterministically } from '../analysis/messageAnalyzer';
import { analyzeUrlDeterministically } from '../analysis/urlAnalyzer';
import { analyzeQrDeterministically } from '../analysis/qrAnalyzer';
import { analyzeTransactionDeterministically } from '../analysis/transactionAnalyzer';
import { synthesizeRiskAnalysis } from '../analysis/riskEngine';
import { saveAnalysis } from '../db';
import {
  MessageAnalysisInput,
  UrlAnalysisInput,
  QrAnalysisInput,
  TransactionAnalysisInput,
  ContextAnalysisInput
} from '../types';

export const analyzeRouter = Router();

const MAX_INPUT_LENGTH = 10000;

// POST /api/analyze/message
analyzeRouter.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, sender, channel } = req.body as MessageAnalysisInput;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    if (text.length > MAX_INPUT_LENGTH) {
      res.status(400).json({ error: `Message exceeds maximum allowed length (${MAX_INPUT_LENGTH} chars).` });
      return;
    }

    // 1. Deterministic Analysis
    const deterministic = analyzeMessageDeterministically({ text, sender, channel });

    // 2. AI Semantic Analysis
    const aiProvider = getAIProvider();
    const aiStatus = getAIProviderStatus();

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
    const finalResult = synthesizeRiskAnalysis({
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
    const savedId = saveAnalysis(finalResult, 'message', text);
    finalResult.id = savedId;

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: 'Internal server error while evaluating message.' });
  }
});

// POST /api/analyze/url
analyzeRouter.post('/url', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, contextText } = req.body as UrlAnalysisInput;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      res.status(400).json({ error: 'URL is required.' });
      return;
    }

    if (url.length > 2048) {
      res.status(400).json({ error: 'URL exceeds maximum allowable length.' });
      return;
    }

    // Deterministic Heuristic URL Analysis (NO SSRF OUTBOUND CALLS)
    const deterministic = analyzeUrlDeterministically(url);

    // AI Semantic Evaluation
    const aiProvider = getAIProvider();
    const aiStatus = getAIProviderStatus();

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

    const finalResult = synthesizeRiskAnalysis({
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

    const savedId = saveAnalysis(finalResult, 'url', url);
    finalResult.id = savedId;

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error analyzing url:', error);
    res.status(500).json({ error: 'Internal server error while inspecting URL.' });
  }
});

// POST /api/analyze/qr
analyzeRouter.post('/qr', async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrData, userContext } = req.body as QrAnalysisInput;

    if (!qrData || typeof qrData !== 'string' || qrData.trim() === '') {
      res.status(400).json({ error: 'QR code payload data is required.' });
      return;
    }

    // Deterministic UPI Protocol & Collect Trap Analysis
    const deterministic = analyzeQrDeterministically(qrData, userContext);

    // AI Semantic Analysis
    const aiProvider = getAIProvider();
    const aiStatus = getAIProviderStatus();

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

    const finalResult = synthesizeRiskAnalysis({
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

    const savedId = saveAnalysis(finalResult, 'qr', qrData);
    finalResult.id = savedId;

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error analyzing QR:', error);
    res.status(500).json({ error: 'Internal server error while processing QR code.' });
  }
});

// POST /api/analyze/transaction
analyzeRouter.post('/transaction', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as TransactionAnalysisInput;

    if (body.amount === undefined || isNaN(Number(body.amount)) || Number(body.amount) < 0) {
      res.status(400).json({ error: 'Valid transaction amount is required.' });
      return;
    }

    if (!body.receiverUpi || typeof body.receiverUpi !== 'string' || body.receiverUpi.trim() === '') {
      res.status(400).json({ error: 'Receiver UPI address is required.' });
      return;
    }

    const deterministic = analyzeTransactionDeterministically({
      amount: Number(body.amount),
      receiverUpi: body.receiverUpi,
      merchantCategory: body.merchantCategory,
      transactionDescription: body.transactionDescription,
      isNewRecipient: Boolean(body.isNewRecipient),
      isUserInitiated: Boolean(body.isUserInitiated),
      suspiciousMessageReceived: Boolean(body.suspiciousMessageReceived)
    });

    const aiProvider = getAIProvider();
    const aiStatus = getAIProviderStatus();

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

    const finalResult = synthesizeRiskAnalysis({
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

    const savedId = saveAnalysis(
      finalResult,
      'transaction',
      `Payment ₹${body.amount} to ${body.receiverUpi}`
    );
    finalResult.id = savedId;

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error analyzing transaction:', error);
    res.status(500).json({ error: 'Internal server error while evaluating transaction parameters.' });
  }
});

// POST /api/analyze/context
analyzeRouter.post('/context', async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioDescription, supportingData } = req.body as ContextAnalysisInput;

    if (!scenarioDescription || typeof scenarioDescription !== 'string' || scenarioDescription.trim() === '') {
      res.status(400).json({ error: 'Scenario description is required.' });
      return;
    }

    if (scenarioDescription.length > MAX_INPUT_LENGTH) {
      res.status(400).json({ error: `Scenario description exceeds maximum allowed length (${MAX_INPUT_LENGTH} chars).` });
      return;
    }

    // Deterministic check on any URLs or VPAs mentioned in the scenario
    const msgDet = analyzeMessageDeterministically({ text: scenarioDescription });

    const aiProvider = getAIProvider();
    const aiStatus = getAIProviderStatus();

    const aiResult = await aiProvider.analyze({
      type: 'context',
      content: scenarioDescription,
      additionalContext: {
        supportingData,
        extractedUrls: msgDet.extractedUrls.map((u) => u.url),
        extractedUpis: msgDet.extractedUpis.map((u) => u.pa)
      }
    });

    const finalResult = synthesizeRiskAnalysis({
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

    const savedId = saveAnalysis(finalResult, 'context', scenarioDescription);
    finalResult.id = savedId;

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error analyzing scenario context:', error);
    res.status(500).json({ error: 'Internal server error while processing context scenario.' });
  }
});
