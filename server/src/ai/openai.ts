import { AIPromptInput, AIAnalysisResponse, IAIProvider } from './types';
import { MockAIProvider } from './mock';

export class OpenAIProvider implements IAIProvider {
  public readonly name = 'OpenAI GPT-4o-mini';
  public readonly isConfigured: boolean;
  private apiKey?: string;
  private fallback: MockAIProvider;

  constructor() {
    this.fallback = new MockAIProvider();
    this.apiKey = process.env.OPENAI_API_KEY?.trim();
    this.isConfigured = Boolean(this.apiKey);
  }

  async analyze(input: AIPromptInput): Promise<AIAnalysisResponse> {
    if (!this.isConfigured || !this.apiKey) {
      return this.fallback.analyze(input);
    }

    const systemPrompt = `You are UPI Sentinel's Senior Cyber Threat Analyst specializing in UPI fraud, social engineering, and financial cybercrime.
Analyze the user's input and determine if it is a scam by understanding CONTEXT, INTENT, and SOCIAL ENGINEERING.
Respond strictly in JSON matching the exact schema:
{
  "riskScore": number (0-100),
  "classification": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "threatType": "Fake KYC" | "Phishing" | "Refund Scam" | "QR Scam" | "UPI Collect Scam" | "Bank Impersonation" | "Customer Support Scam" | "OTP Scam" | "Lottery / Prize Scam" | "Investment Scam" | "Job Scam" | "Remote Access Scam" | "Payment Redirection" | "Unknown",
  "confidence": number (0.0-1.0),
  "summary": string,
  "indicators": [{ "name": string, "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "explanation": string, "scoreContribution": number }],
  "recommendations": string[],
  "socialEngineeringTechniques": string[]
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Input type: ${input.type}\nContent: ${input.content}\nContext: ${JSON.stringify(input.additionalContext || {})}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed: AIAnalysisResponse = JSON.parse(content);
      parsed.riskScore = Math.max(0, Math.min(100, Math.round(parsed.riskScore || 0)));
      if (parsed.riskScore >= 70) parsed.classification = 'HIGH_RISK';
      else if (parsed.riskScore >= 30) parsed.classification = 'SUSPICIOUS';
      else parsed.classification = 'SAFE';

      return parsed;
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to local semantic engine:', err);
      return this.fallback.analyze(input);
    }
  }
}
