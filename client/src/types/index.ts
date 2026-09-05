export type Classification = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';

export type ThreatType =
  | 'Fake KYC'
  | 'Phishing'
  | 'Refund Scam'
  | 'QR Scam'
  | 'UPI Collect Scam'
  | 'Bank Impersonation'
  | 'Customer Support Scam'
  | 'OTP Scam'
  | 'Lottery / Prize Scam'
  | 'Investment Scam'
  | 'Job Scam'
  | 'Remote Access Scam'
  | 'Payment Redirection'
  | 'Unknown';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Indicator {
  name: string;
  severity: Severity;
  explanation: string;
  scoreContribution: number;
}

export interface ParsedUpiDetails {
  raw: string;
  pa?: string;
  pn?: string;
  am?: string;
  cu?: string;
  tn?: string;
  tr?: string;
  mc?: string;
  mode?: string;
  sign?: string;
  isCollectRequest: boolean;
  isSuspiciousHandle: boolean;
  warnings: string[];
}

export interface UrlSecurityDetails {
  url: string;
  protocol: string;
  isHttps: boolean;
  hostname: string;
  domain: string;
  subdomain: string;
  tld: string;
  isIpAddress: boolean;
  isShortener: boolean;
  isExcessiveSubdomains: boolean;
  suspiciousKeywordsFound: string[];
  impersonatedBrand?: string;
  typosquattingSuspected: boolean;
  heuristicsTriggered: string[];
  prototypeNote: string;
}

export interface AnalysisResult {
  id?: string;
  timestamp?: string;
  riskScore: number;
  classification: Classification;
  threatType: ThreatType;
  confidence: number;
  summary: string;
  indicators: Indicator[];
  recommendations: string[];
  socialEngineeringTechniques: string[];
  meta?: {
    inputType: 'message' | 'url' | 'qr' | 'transaction' | 'context';
    isAiGenerated: boolean;
    aiProvider: string;
    evaluatedAt: string;
    analysisMode: string;
    upiDetails?: ParsedUpiDetails;
    urlDetails?: UrlSecurityDetails;
    mandatorySafetyNotice?: string;
    transactionDetails?: any;
    extractedUrls?: UrlSecurityDetails[];
    extractedUpis?: ParsedUpiDetails[];
  };
}

export interface DashboardStats {
  total: number;
  highRisk: number;
  suspicious: number;
  safe: number;
  threatBreakdown: { threat_type: string; count: number }[];
  riskDistribution: { name: string; count: number; fill: string }[];
  recentAnalyses: {
    id: string;
    timestamp: string;
    inputType: string;
    inputPreview: string;
    riskScore: number;
    classification: Classification;
    threatType: ThreatType;
    confidence: number;
  }[];
}

export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  expectedClassification: Classification;
  expectedThreat: ThreatType;
  description: string;
  inputType: 'message' | 'url' | 'qr' | 'transaction' | 'context';
  payload: any;
}
