"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIProvider = getAIProvider;
exports.getAIProviderStatus = getAIProviderStatus;
const gemini_1 = require("./gemini");
const openai_1 = require("./openai");
const mock_1 = require("./mock");
function getAIProvider() {
    const providerType = (process.env.AI_PROVIDER || 'mock').toLowerCase();
    if (providerType === 'gemini') {
        const gemini = new gemini_1.GeminiProvider();
        if (gemini.isConfigured)
            return gemini;
    }
    if (providerType === 'openai') {
        const openai = new openai_1.OpenAIProvider();
        if (openai.isConfigured)
            return openai;
    }
    return new mock_1.MockAIProvider();
}
function getAIProviderStatus() {
    const providerType = (process.env.AI_PROVIDER || 'mock').toLowerCase();
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    let activeProviderName = 'Prototype Semantic AI (Offline Heuristic)';
    let isLiveAPI = false;
    if (providerType === 'gemini' && hasGeminiKey) {
        activeProviderName = 'Google Gemini 2.5 Flash';
        isLiveAPI = true;
    }
    else if (providerType === 'openai' && hasOpenAIKey) {
        activeProviderName = 'OpenAI GPT-4o-mini';
        isLiveAPI = true;
    }
    return {
        configuredProvider: providerType,
        activeProviderName,
        isLiveAPI,
        hasGeminiKey,
        hasOpenAIKey,
        model: process.env.AI_MODEL || (providerType === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash'),
        disclaimer: isLiveAPI
            ? 'Connected to live cloud LLM API for contextual semantic evaluation.'
            : 'Demo Analysis — Live AI provider not configured. Operating in offline semantic heuristic mode with full realistic feature parity.'
    };
}
