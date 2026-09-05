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
    transactionDetails?: any;
  };
}

export interface ParsedUpiDetails {
  raw: string;
  pa?: string; // Payee VPA / UPI ID
  pn?: string; // Payee Name
  am?: string; // Amount
  cu?: string; // Currency (INR)
  tn?: string; // Transaction Note
  tr?: string; // Transaction Reference ID
  mc?: string; // Merchant Code
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

export interface MessageAnalysisInput {
  text: string;
  sender?: string;
  channel?: 'sms' | 'whatsapp' | 'email' | 'other';
}

export interface UrlAnalysisInput {
  url: string;
  contextText?: string;
}

export interface QrAnalysisInput {
  qrData: string;
  userContext?: string;
}

export interface TransactionAnalysisInput {
  amount: number;
  receiverUpi: string;
  merchantCategory?: string;
  transactionDescription?: string;
  isNewRecipient: boolean;
  isUserInitiated: boolean;
  suspiciousMessageReceived: boolean;
}

export interface ContextAnalysisInput {
  scenarioDescription: string;
  supportingData?: string;
}
