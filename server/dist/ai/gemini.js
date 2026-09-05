"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const genai_1 = require("@google/genai");
const mock_1 = require("./mock");
class GeminiProvider {
    name = 'Google Gemini 2.5 Flash';
    isConfigured;
    client = null;
    fallback;
    constructor() {
        this.fallback = new mock_1.MockAIProvider();
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (apiKey) {
            this.isConfigured = true;
            try {
                this.client = new genai_1.GoogleGenAI({ apiKey });
            }
            catch (err) {
                console.error('Failed to initialize GoogleGenAI client:', err);
                this.isConfigured = false;
            }
        }
        else {
            this.isConfigured = false;
        }
    }
    async analyze(input) {
        if (!this.isConfigured || !this.client) {
            return this.fallback.analyze(input);
        }
        const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';
        const systemPrompt = `You are UPI Sentinel's Senior Cyber Threat Analyst specializing in UPI fraud, social engineering, and financial cybercrime.
Your job is to analyze the user's input (message, URL, QR context, transaction, or incident narrative) and determine if it is a scam.

CRITICAL INSTRUCTION:
Do NOT simply search for words such as "OTP", "urgent", "KYC", "refund", "money" and automatically call something a scam.
You MUST analyze the CONTEXT, INTENT, and SOCIAL ENGINEERING PATTERN.
Example: "Your account will be closed unless you verify your KYC immediately."
Identify this as suspicious because of:
- authority impersonation
- urgency
- account suspension threat
- KYC manipulation
even if the word "scam" does not appear.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "riskScore": number (0 to 100 integer),
  "classification": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "threatType": "Fake KYC" | "Phishing" | "Refund Scam" | "QR Scam" | "UPI Collect Scam" | "Bank Impersonation" | "Customer Support Scam" | "OTP Scam" | "Lottery / Prize Scam" | "Investment Scam" | "Job Scam" | "Remote Access Scam" | "Payment Redirection" | "Unknown",
  "confidence": number (float 0.0 to 1.0),
  "summary": string (concise explanation of what is happening and why it is risky or safe),
  "indicators": [
    {
      "name": string,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "explanation": string,
      "scoreContribution": number
    }
  ],
  "recommendations": string[] (actionable defense instructions),
  "socialEngineeringTechniques": string[]
}

Scoring criteria:
0-29: SAFE
30-69: SUSPICIOUS
70-100: HIGH RISK
`;
        const userPrompt = `Input Type: ${input.type}
Content:
"""
${input.content}
"""

Additional Context:
${JSON.stringify(input.additionalContext || {}, null, 2)}
`;
        try {
            const response = await this.client.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: 'application/json',
                    temperature: 0.2
                }
            });
            const responseText = response.text?.trim();
            if (!responseText) {
                throw new Error('Empty response from Gemini API');
            }
            const parsed = JSON.parse(responseText);
            // Clamp risk score to 0-100
            parsed.riskScore = Math.max(0, Math.min(100, Math.round(parsed.riskScore || 0)));
            // Enforce classification mapping
            if (parsed.riskScore >= 70) {
                parsed.classification = 'HIGH_RISK';
            }
            else if (parsed.riskScore >= 30) {
                parsed.classification = 'SUSPICIOUS';
            }
            else {
                parsed.classification = 'SAFE';
            }
            return parsed;
        }
        catch (error) {
            console.warn('Gemini API call failed, falling back to local semantic engine:', error);
            return this.fallback.analyze(input);
        }
    }
}
exports.GeminiProvider = GeminiProvider;
