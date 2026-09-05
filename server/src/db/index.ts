import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { AnalysisResult, Classification, ThreatType } from '../types';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sentinel.db');
export const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    input_type TEXT NOT NULL,
    input_preview TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    classification TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    confidence REAL NOT NULL,
    summary TEXT NOT NULL,
    indicators_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    social_techniques_json TEXT NOT NULL,
    meta_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_analyses_timestamp ON analyses (timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_analyses_classification ON analyses (classification);
  CREATE INDEX IF NOT EXISTS idx_analyses_threat_type ON analyses (threat_type);
`);

// Seed realistic initial demo data if database is empty
const count = (db.prepare('SELECT COUNT(*) as count FROM analyses').get() as { count: number }).count;

if (count === 0) {
  const seedRecords = [
    {
      id: 'sentinel-seed-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      input_type: 'message',
      input_preview: 'Your SBI KYC has expired. Your account will be blocked today. Verify immediately at http://sbi-kyc-update-portal.xyz',
      risk_score: 94,
      classification: 'HIGH_RISK',
      threat_type: 'Fake KYC',
      confidence: 0.96,
      summary: 'High-urgency bank impersonation message simulating account suspension to coerce the victim into providing credentials on an unverified domain.',
      indicators: [
        { name: 'Authority Impersonation', severity: 'HIGH', explanation: 'Claims to represent State Bank of India without valid institutional origin.', scoreContribution: 25 },
        { name: 'Artificial Urgency & Threat', severity: 'HIGH', explanation: 'Creates panic by asserting that the bank account will be blocked today.', scoreContribution: 20 },
        { name: 'Suspicious External Link', severity: 'CRITICAL', explanation: 'Links to unauthorized .xyz domain mimicking bank infrastructure.', scoreContribution: 25 },
        { name: 'KYC Credential Harvest', severity: 'HIGH', explanation: 'Coerces user to enter sensitive personal and banking credentials under the guise of mandatory KYC.', scoreContribution: 24 }
      ],
      recommendations: [
        'Do not click the provided link or enter any banking credentials.',
        'Never submit Aadhaar, PAN, or UPI PIN on third-party websites.',
        'Verify your account status directly via the official YONO SBI app or official branch.'
      ],
      social_techniques: ['Authority Impersonation', 'Fear & Urgency', 'Pretexting (KYC)', 'Phishing Lures'],
      meta: {
        inputType: 'message',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    },
    {
      id: 'sentinel-seed-02',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      input_type: 'qr',
      input_preview: 'upi://pay?pa=amazon.refund.desk77@okhdfcbank&pn=Amazon%20Refund%20Officer&am=3499&cu=INR&tn=Refund%20Credit%20Enter%20PIN',
      risk_score: 96,
      classification: 'HIGH_RISK',
      threat_type: 'Refund Scam',
      confidence: 0.98,
      summary: 'Classic UPI Collect/Debit trap masquerading as an incoming refund credit. Scanning and entering a UPI PIN will debit ₹3,499 from your account instead of crediting it.',
      indicators: [
        { name: 'Reverse Payment Trap (Collect Scam)', severity: 'CRITICAL', explanation: 'The QR generates a payment instruction to debit the user, not credit funds.', scoreContribution: 35 },
        { name: 'Deceptive Transaction Note', severity: 'HIGH', explanation: 'Note falsely states "Refund Credit Enter PIN" to trick the user into thinking PIN receives funds.', scoreContribution: 25 },
        { name: 'Merchant Impersonation', severity: 'HIGH', explanation: 'Uses "Amazon Refund Officer" on a personal P2P VPA (@okhdfcbank).', scoreContribution: 20 },
        { name: 'Pre-filled Amount Manipulation', severity: 'MEDIUM', explanation: 'Forces exact amount debit under pretext of a pending claim.', scoreContribution: 16 }
      ],
      recommendations: [
        'NEVER enter your UPI PIN to receive money or refunds. UPI PIN is solely for paying out.',
        'Reject the collect request immediately on your UPI app.',
        'Contact Amazon directly through your official order history page.'
      ],
      social_techniques: ['Reverse Transaction Pretext', 'Authority Masking', 'Cognitive Overload'],
      meta: {
        inputType: 'qr',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    },
    {
      id: 'sentinel-seed-03',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      input_type: 'message',
      input_preview: 'Swiggy: Your order #SW-98212 has been delivered! Paid Rs 420.00 via Google Pay UPI (Ref 409182371928). Enjoy your meal!',
      risk_score: 8,
      classification: 'SAFE',
      threat_type: 'Unknown',
      confidence: 0.97,
      summary: 'Legitimate post-transaction confirmation from food delivery merchant. Contains standard transaction metadata with no manipulative links or credential requests.',
      indicators: [
        { name: 'Standard Transaction Notice', severity: 'LOW', explanation: 'Informational order delivery receipt with verified merchant syntax.', scoreContribution: 4 },
        { name: 'No Urgent Calls to Action', severity: 'LOW', explanation: 'Does not ask user to click external links, verify KYC, or dial unknown helplines.', scoreContribution: 4 }
      ],
      recommendations: [
        'Transaction appears normal. No action required.',
        'Retain receipt for standard order records.'
      ],
      social_techniques: [],
      meta: {
        inputType: 'message',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    },
    {
      id: 'sentinel-seed-04',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      input_type: 'url',
      input_preview: 'http://hdfc-netbanking-secure-login.top/auth/verify.php',
      risk_score: 92,
      classification: 'HIGH_RISK',
      threat_type: 'Phishing',
      confidence: 0.95,
      summary: 'Heuristic analysis detected brand impersonation of HDFC Bank hosted on an unencrypted HTTP connection with a high-risk .top top-level domain.',
      indicators: [
        { name: 'Insecure Plain HTTP Protocol', severity: 'HIGH', explanation: 'Legitimate financial portals exclusively mandate TLS/HTTPS encryption.', scoreContribution: 20 },
        { name: 'Brand Name Typosquatting / Misuse', severity: 'CRITICAL', explanation: 'Host contains "hdfc-netbanking-secure-login" on unverified third-party root domain.', scoreContribution: 30 },
        { name: 'High-Abuse TLD (.top)', severity: 'HIGH', explanation: 'Top-level domain frequently utilized in automated phishing campaigns.', scoreContribution: 22 },
        { name: 'Credential Harvesting Pattern', severity: 'HIGH', explanation: 'Path "/auth/verify.php" matches common credential interception kits.', scoreContribution: 20 }
      ],
      recommendations: [
        'Do not visit the URL or submit login passwords, customer IDs, or OTPs.',
        'Bookmark the official netbanking portal directly from hdfcbank.com.',
        'Report the URL to your bank and the national cyber crime portal.'
      ],
      social_techniques: ['Brand Impersonation', 'Fake Netbanking Portal'],
      meta: {
        inputType: 'url',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    },
    {
      id: 'sentinel-seed-05',
      timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      input_type: 'context',
      input_preview: 'Someone called claiming to be an Airtel executive stating my 5G SIM will be deactivated unless I download AnyDesk and make a ₹10 recharge test.',
      risk_score: 89,
      classification: 'HIGH_RISK',
      threat_type: 'Remote Access Scam',
      confidence: 0.94,
      summary: 'Combination of telecom operator impersonation, service disruption panic, and remote desktop application installation to siphon OTPs and takeover UPI sessions.',
      indicators: [
        { name: 'Remote Desktop Exploitation', severity: 'CRITICAL', explanation: 'Requesting AnyDesk/TeamViewer gives the attacker complete screen and device takeover.', scoreContribution: 35 },
        { name: 'Micro-Payment Bait', severity: 'HIGH', explanation: 'Instructing a ₹10 test payment allows the attacker to observe UPI PIN entry via screen sharing.', scoreContribution: 25 },
        { name: 'Service Disruption Threat', severity: 'HIGH', explanation: 'Fabricated claim of 5G SIM deactivation induces panic compliance.', scoreContribution: 20 },
        { name: 'Unsolicited Telecom Support', severity: 'MEDIUM', explanation: 'Telecoms never request remote screen sharing to configure network SIMs.', scoreContribution: 9 }
      ],
      recommendations: [
        'Immediately disconnect the call and NEVER install AnyDesk or screen sharing tools.',
        'If installed, uninstall the remote tool immediately and disconnect from Wi-Fi.',
        'Never perform UPI payments or enter your PIN while anyone is viewing your screen.'
      ],
      social_techniques: ['Remote Screen Siphoning', 'Artificial Telecom Panic', 'Micro-Transaction Trap'],
      meta: {
        inputType: 'context',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    },
    {
      id: 'sentinel-seed-06',
      timestamp: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
      input_type: 'transaction',
      input_preview: 'Payment of ₹18,500 to rawat-olx-seller@paytm for "Used iPhone 14 Advance Token". Unverified new recipient.',
      risk_score: 58,
      classification: 'SUSPICIOUS',
      threat_type: 'Payment Redirection',
      confidence: 0.86,
      summary: 'High-value advance payment to a newly introduced unverified peer handle for marketplace goods without escrow or delivery verification.',
      indicators: [
        { name: 'Marketplace Advance Payment Risk', severity: 'MEDIUM', explanation: 'Paying advance token amount before item inspection is high scam indicator on OLX/peer markets.', scoreContribution: 25 },
        { name: 'First-time Unknown Recipient', severity: 'MEDIUM', explanation: 'Transaction is initiated to an unverified individual handle with no prior history.', scoreContribution: 18 },
        { name: 'High Transaction Value Anomaly', severity: 'LOW', explanation: 'Significant non-merchant transaction value.', scoreContribution: 15 }
      ],
      recommendations: [
        'Avoid transferring upfront token advances on classifieds or OLX.',
        'Inspect the physical product in person in a safe public place before paying.',
        'Verify seller identity and insist on face-to-face settlement.'
      ],
      social_techniques: ['Advance Fee Fraud', 'Scarcity Pretext'],
      meta: {
        inputType: 'transaction',
        isAiGenerated: true,
        aiProvider: 'Sentinel Hybrid Engine',
        evaluatedAt: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
        analysisMode: 'Production Hybrid'
      }
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO analyses (
      id, timestamp, input_type, input_preview, risk_score,
      classification, threat_type, confidence, summary,
      indicators_json, recommendations_json, social_techniques_json, meta_json
    ) VALUES (
      @id, @timestamp, @input_type, @input_preview, @risk_score,
      @classification, @threat_type, @confidence, @summary,
      @indicators_json, @recommendations_json, @social_techniques_json, @meta_json
    )
  `);

  const insertMany = db.transaction((records) => {
    for (const rec of records) {
      insertStmt.run({
        id: rec.id,
        timestamp: rec.timestamp,
        input_type: rec.input_type,
        input_preview: rec.input_preview,
        risk_score: rec.risk_score,
        classification: rec.classification,
        threat_type: rec.threat_type,
        confidence: rec.confidence,
        summary: rec.summary,
        indicators_json: JSON.stringify(rec.indicators),
        recommendations_json: JSON.stringify(rec.recommendations),
        social_techniques_json: JSON.stringify(rec.social_techniques),
        meta_json: JSON.stringify(rec.meta)
      });
    }
  });

  insertMany(seedRecords);
}

export function saveAnalysis(analysis: AnalysisResult, inputType: string, inputPreview: string): string {
  const id = analysis.id || `sentinel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = analysis.timestamp || new Date().toISOString();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO analyses (
      id, timestamp, input_type, input_preview, risk_score,
      classification, threat_type, confidence, summary,
      indicators_json, recommendations_json, social_techniques_json, meta_json
    ) VALUES (
      @id, @timestamp, @input_type, @input_preview, @risk_score,
      @classification, @threat_type, @confidence, @summary,
      @indicators_json, @recommendations_json, @social_techniques_json, @meta_json
    )
  `);

  stmt.run({
    id,
    timestamp,
    input_type: inputType,
    input_preview: inputPreview.slice(0, 300),
    risk_score: analysis.riskScore,
    classification: analysis.classification,
    threat_type: analysis.threatType,
    confidence: analysis.confidence,
    summary: analysis.summary,
    indicators_json: JSON.stringify(analysis.indicators || []),
    recommendations_json: JSON.stringify(analysis.recommendations || []),
    social_techniques_json: JSON.stringify(analysis.socialEngineeringTechniques || []),
    meta_json: JSON.stringify(analysis.meta || {})
  });

  return id;
}

export function getAnalyses(options: {
  search?: string;
  classification?: string;
  threatType?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  const whereClauses: string[] = [];
  const params: any = {};

  if (options.search && options.search.trim() !== '') {
    whereClauses.push('(input_preview LIKE @search OR summary LIKE @search OR threat_type LIKE @search)');
    params.search = `%${options.search.trim()}%`;
  }

  if (options.classification && options.classification !== 'ALL') {
    whereClauses.push('classification = @classification');
    params.classification = options.classification;
  }

  if (options.threatType && options.threatType !== 'ALL') {
    whereClauses.push('threat_type = @threatType');
    params.threatType = options.threatType;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM analyses ${whereSql}`;
  const total = (db.prepare(countQuery).get(params) as { total: number }).total;

  const dataQuery = `
    SELECT * FROM analyses
    ${whereSql}
    ORDER BY timestamp DESC
    LIMIT @limit OFFSET @offset
  `;

  const rows = db.prepare(dataQuery).all({ ...params, limit, offset }) as any[];

  const analyses = rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    inputType: r.input_type,
    inputPreview: r.input_preview,
    riskScore: r.risk_score,
    classification: r.classification,
    threatType: r.threat_type,
    confidence: r.confidence,
    summary: r.summary,
    indicators: JSON.parse(r.indicators_json || '[]'),
    recommendations: JSON.parse(r.recommendations_json || '[]'),
    socialEngineeringTechniques: JSON.parse(r.social_techniques_json || '[]'),
    meta: JSON.parse(r.meta_json || '{}')
  }));

  return { analyses, total };
}

export function getAnalysisById(id: string) {
  const r = db.prepare('SELECT * FROM analyses WHERE id = ?').get(id) as any;
  if (!r) return null;

  return {
    id: r.id,
    timestamp: r.timestamp,
    inputType: r.input_type,
    inputPreview: r.input_preview,
    riskScore: r.risk_score,
    classification: r.classification,
    threatType: r.threat_type,
    confidence: r.confidence,
    summary: r.summary,
    indicators: JSON.parse(r.indicators_json || '[]'),
    recommendations: JSON.parse(r.recommendations_json || '[]'),
    socialEngineeringTechniques: JSON.parse(r.social_techniques_json || '[]'),
    meta: JSON.parse(r.meta_json || '{}')
  };
}

export function deleteAnalysis(id: string): boolean {
  const res = db.prepare('DELETE FROM analyses WHERE id = ?').run(id);
  return res.changes > 0;
}

export function clearAnalyses(): boolean {
  db.prepare('DELETE FROM analyses').run();
  return true;
}

export function getStats() {
  const total = (db.prepare('SELECT COUNT(*) as count FROM analyses').get() as { count: number }).count;
  const highRisk = (db.prepare("SELECT COUNT(*) as count FROM analyses WHERE classification = 'HIGH_RISK'").get() as { count: number }).count;
  const suspicious = (db.prepare("SELECT COUNT(*) as count FROM analyses WHERE classification = 'SUSPICIOUS'").get() as { count: number }).count;
  const safe = (db.prepare("SELECT COUNT(*) as count FROM analyses WHERE classification = 'SAFE'").get() as { count: number }).count;

  // Breakdown by threat type
  const threatRows = db.prepare(`
    SELECT threat_type, COUNT(*) as count
    FROM analyses
    WHERE threat_type != 'Unknown'
    GROUP BY threat_type
    ORDER BY count DESC
    LIMIT 6
  `).all() as { threat_type: string; count: number }[];

  // Distribution buckets
  const distribution = [
    { name: 'Safe (0-29)', count: safe, fill: '#10B981' },
    { name: 'Suspicious (30-69)', count: suspicious, fill: '#F59E0B' },
    { name: 'High Risk (70-100)', count: highRisk, fill: '#EF4444' }
  ];

  // Activity trend (last 7 days or mock points)
  const recentAnalyses = db.prepare(`
    SELECT id, timestamp, input_type as inputType, input_preview as inputPreview,
           risk_score as riskScore, classification, threat_type as threatType, confidence
    FROM analyses
    ORDER BY timestamp DESC
    LIMIT 6
  `).all();

  return {
    total,
    highRisk,
    suspicious,
    safe,
    threatBreakdown: threatRows,
    riskDistribution: distribution,
    recentAnalyses
  };
}
