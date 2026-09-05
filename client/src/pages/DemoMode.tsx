import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  FileText,
  QrCode,
  Globe,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { DemoScenario, AnalysisResult } from '../types';
import { api } from '../services/api';
import { ResultScreen } from '../components/analysis/ResultScreen';
import { LoadingSteps } from '../components/common/LoadingSteps';

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-1-kyc',
    title: '1. Fake KYC SMS Scam',
    category: 'Message Analysis',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Fake KYC',
    description: 'Panic-inducing SMS alleging immediate bank account suspension unless user verifies KYC via third-party link.',
    inputType: 'message',
    payload: {
      text: 'Dear Customer, Your SBI account KYC has EXPIRED. Your netbanking and ATM services will be BLOCKED TODAY. Click here to verify immediately: http://sbi-kyc-update-portal.xyz/login to avoid suspension.',
      channel: 'sms'
    }
  },
  {
    id: 'demo-2-refund-qr',
    title: '2. Refund Collect QR Trap',
    category: 'QR Code Analysis',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Refund Scam',
    description: 'Scammer poses as merchant support and sends a QR to "receive" refund credit. In reality, scanning debits user ₹3,499.',
    inputType: 'qr',
    payload: {
      qrData: 'upi://pay?pa=amazon.refund.desk77@okhdfcbank&pn=Amazon%20Refund%20Officer&am=3499&cu=INR&tn=Refund%20Credit%20Enter%20PIN',
      userContext: 'Received call claiming Amazon refund of ₹3,499 is ready to be credited via this QR code.'
    }
  },
  {
    id: 'demo-3-bank-impersonation',
    title: '3. Bank Impersonation & Card Block',
    category: 'Message Analysis',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Bank Impersonation',
    description: 'Urgent notification impersonating ICICI Bank security team asking user to call a private mobile number to unlock card.',
    inputType: 'message',
    payload: {
      text: 'ICICI Bank Alert: Your Credit Card ending 8122 has been temporarily frozen due to suspicious activity. To unblock immediately, call Senior Officer Sharma at +91-9812984124 or share OTP.',
      channel: 'whatsapp'
    }
  },
  {
    id: 'demo-4-prize-scam',
    title: '4. KBC / Lottery Prize Scam',
    category: 'Message Analysis',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Lottery / Prize Scam',
    description: 'Classic advance-fee fraud claiming user won ₹25,00,000 cash in KBC WhatsApp lucky draw; asks for tax deposit.',
    inputType: 'message',
    payload: {
      text: 'CONGRATULATIONS!! Your mobile number has won ₹25,00,000 Cash in KBC All India WhatsApp Lucky Draw 2026. Contact KBC Manager at 919876543210 to claim. Deposit ₹12,500 government tax fee to release prize.',
      channel: 'whatsapp'
    }
  },
  {
    id: 'demo-5-support-scam',
    title: '5. Fake Google Pay Support Scam',
    category: 'AI Context Analysis',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Customer Support Scam',
    description: 'User searches online for customer care, dials a fraudulent helpline, and is told to install AnyDesk and pay ₹1 test charge.',
    inputType: 'context',
    payload: {
      scenarioDescription: 'My ₹1,200 payment failed on Google Pay. I searched on Google for Google Pay Customer Care and called 1800-FAKE-GPAY. The executive asked me to install AnyDesk so he could fix the server glitch, and instructed me to make a ₹10 test transfer to his UPI id gpay.desk.refund@okhdfcbank while on screen share.'
    }
  },
  {
    id: 'demo-6-suspicious-url',
    title: '6. Suspicious Netbanking URL',
    category: 'URL Inspection',
    expectedClassification: 'HIGH_RISK',
    expectedThreat: 'Phishing',
    description: 'Plain HTTP link with high-abuse .top TLD hosting typosquatted HDFC credential interception portal.',
    inputType: 'url',
    payload: {
      url: 'http://hdfc-netbanking-secure-login.top/auth/verify.php',
      contextText: 'Received link via SMS asking to update debit card security settings'
    }
  },
  {
    id: 'demo-7-legit-transaction',
    title: '7. Legitimate Merchant Transaction',
    category: 'Transaction Analysis',
    expectedClassification: 'SAFE',
    expectedThreat: 'Unknown',
    description: 'Normal user-initiated grocery payment to verified retail store with Merchant Category Code.',
    inputType: 'transaction',
    payload: {
      amount: 450,
      receiverUpi: 'dailyneeds.supermarket@okaxis',
      merchantCategory: 'E-Commerce / Grocery',
      transactionDescription: 'Weekly groceries bill #8912',
      isNewRecipient: false,
      isUserInitiated: true,
      suspiciousMessageReceived: false
    }
  },
  {
    id: 'demo-8-legit-bank-sms',
    title: '8. Legitimate Bank SMS Alert',
    category: 'Message Analysis',
    expectedClassification: 'SAFE',
    expectedThreat: 'Unknown',
    description: 'Standard HDFC Bank ATM debit receipt with balance summary, reference number, and no external links.',
    inputType: 'message',
    payload: {
      text: 'Dear Customer, your Acct XX4092 is debited for INR 2,000.00 on 05-SEP-26 at ATM HDFC001. Avail Bal: INR 34,810.22. Txn# 982172189. If not done by you, call 18002664332.',
      channel: 'sms'
    }
  }
];

export const DemoMode: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      let res: AnalysisResult;
      if (scenario.inputType === 'message') {
        res = await api.analyzeMessage(scenario.payload.text, scenario.payload.channel);
      } else if (scenario.inputType === 'url') {
        res = await api.analyzeUrl(scenario.payload.url, scenario.payload.contextText);
      } else if (scenario.inputType === 'qr') {
        res = await api.analyzeQr(scenario.payload.qrData, scenario.payload.userContext);
      } else if (scenario.inputType === 'transaction') {
        res = await api.analyzeTransaction(scenario.payload);
      } else {
        res = await api.analyzeContext(scenario.payload.scenarioDescription);
      }
      setResult(res);
    } catch (err: any) {
      console.error('Demo execution error:', err);
      setError(err.message || 'Demo scenario execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSteps />;
  }

  if (result) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div>
            <span className="text-xs text-[var(--text-muted)] font-semibold block">
              Executed Demo Scenario:
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {selectedScenario?.title}
            </span>
          </div>
          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            ← Back to All Demos
          </button>
        </div>

        <ResultScreen result={result} onReset={() => setResult(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-transparent border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Hackathon Evaluation</span>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Interactive Threat Vector Demonstrations
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Experience UPI Sentinel’s hybrid detection engine across 8 real-world cyber fraud test cases. Works completely offline with zero external API dependencies.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_SCENARIOS.map((scenario) => {
          const isHigh = scenario.expectedClassification === 'HIGH_RISK';
          const isSafe = scenario.expectedClassification === 'SAFE';

          return (
            <div
              key={scenario.id}
              className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-medium text-[var(--text-muted)]">
                    {scenario.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                        : isSafe
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    Expected: {scenario.expectedClassification.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {scenario.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Input snippet preview */}
                <div className="mt-3 p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] line-clamp-2">
                  {scenario.inputType === 'message' && scenario.payload.text}
                  {scenario.inputType === 'qr' && scenario.payload.qrData}
                  {scenario.inputType === 'url' && scenario.payload.url}
                  {scenario.inputType === 'transaction' &&
                    `₹${scenario.payload.amount} to ${scenario.payload.receiverUpi} (${scenario.payload.transactionDescription})`}
                  {scenario.inputType === 'context' && scenario.payload.scenarioDescription}
                </div>
              </div>

              <button
                onClick={() => runScenario(scenario)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm group"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Analysis</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
