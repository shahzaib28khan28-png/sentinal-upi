import { Classification, ThreatType, Indicator } from '../types';

export interface AIAnalysisResponse {
  riskScore: number;
  classification: Classification;
  threatType: ThreatType;
  confidence: number;
  summary: string;
  indicators: Indicator[];
  recommendations: string[];
  socialEngineeringTechniques: string[];
}

export interface AIPromptInput {
  type: 'message' | 'url' | 'qr' | 'transaction' | 'context';
  content: string;
  additionalContext?: Record<string, any>;
}

export interface IAIProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  analyze(input: AIPromptInput): Promise<AIAnalysisResponse>;
}
