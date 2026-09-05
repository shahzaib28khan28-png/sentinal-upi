import React, { useState } from 'react';
import {
  MessageSquare,
  Globe,
  QrCode,
  CreditCard,
  FileText,
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { ResultScreen } from '../components/analysis/ResultScreen';
import { LoadingSteps } from '../components/common/LoadingSteps';
import { QRScannerDropzone } from '../components/scanner/QRScannerDropzone';

interface AnalyzerProps {
  initialTab?: 'message' | 'url' | 'qr' | 'transaction' | 'context';
}

export const Analyzer: React.FC<AnalyzerProps> = ({ initialTab = 'message' }) => {
  const [activeMode, setActiveMode] = useState<'message' | 'url' | 'qr' | 'transaction' | 'context'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Form states
  const [messageText, setMessageText] = useState('');
  const [messageChannel, setMessageChannel] = useState<'sms' | 'whatsapp' | 'email' | 'other'>('sms');

  const [urlInput, setUrlInput] = useState('');
  const [urlContext, setUrlContext] = useState('');

  const [qrPayload, setQrPayload] = useState('');
  const [qrContext, setQrContext] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txReceiver, setTxReceiver] = useState('');
  const [txCategory, setTxCategory] = useState('Personal / Peer');
  const [txDescription, setTxDescription] = useState('');
  const [txIsNewRecipient, setTxIsNewRecipient] = useState(true);
  const [txIsUserInitiated, setTxIsUserInitiated] = useState(true);
  const [txSuspiciousMsg, setTxSuspiciousMsg] = useState(false);

  const [contextScenario, setContextScenario] = useState('');

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please enter a message to evaluate.');
      return;
    }
    runAnalysis(() => api.analyzeMessage(messageText.trim(), messageChannel));
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please provide a URL to inspect.');
      return;
    }
    runAnalysis(() => api.analyzeUrl(urlInput.trim(), urlContext.trim() || undefined));
  };

  const handleQrSubmit = async (qrDataToUse?: string) => {
    const data = qrDataToUse || qrPayload;
    if (!data.trim()) {
      setError('Please provide or scan a QR code payload.');
      return;
    }
    runAnalysis(() => api.analyzeQr(data.trim(), qrContext.trim() || undefined));
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txReceiver.trim()) {
      setError('Receiver UPI ID is required.');
      return;
    }
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt < 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    runAnalysis(() =>
      api.analyzeTransaction({
        amount: amt,
        receiverUpi: txReceiver.trim(),
        merchantCategory: txCategory,
        transactionDescription: txDescription.trim(),
        isNewRecipient: txIsNewRecipient,
        isUserInitiated: txIsUserInitiated,
        suspiciousMessageReceived: txSuspiciousMsg
      })
    );
  };

  const handleContextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextScenario.trim()) {
      setError('Please describe the situation or incident.');
      return;
    }
    runAnalysis(() => api.analyzeContext(contextScenario.trim()));
  };

  const runAnalysis = async (action: () => Promise<AnalysisResult>) => {
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await action();
      setResult(res);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis could not be completed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSteps />;
  }

  if (result) {
    return <ResultScreen result={result} onReset={() => setResult(null)} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <button
          onClick={() => {
            setActiveMode('message');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'message'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('url');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'url'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>URL</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('qr');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'qr'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('transaction');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'transaction'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Transaction</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('context');
            setError(null);
          }}
          className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'context'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Context</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Message Analysis */}
      {activeMode === 'message' && (
        <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Suspicious Message & Communication Analysis
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Evaluates artificial urgency, authority impersonation, account blocking threats, and embedded credential traps.
            </p>
          </div>

          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Origin Channel:
              </label>
              <select
                value={messageChannel}
                onChange={(e: any) => setMessageChannel(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="sms">SMS Text</option>
                <option value="whatsapp">WhatsApp / Telegram</option>
                <option value="email">Email</option>
                <option value="other">Payment App In-App Message</option>
              </select>
            </div>

            <div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                placeholder="Paste suspicious SMS, WhatsApp message, email or payment request...&#10;&#10;Example: Your SBI KYC has expired. Your account will be blocked today. Verify immediately using this link: http://sbi-kyc.xyz"
                className="w-full p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setMessageText(
                    'Dear SBI Customer, your YONO account has been blocked due to incomplete KYC. Please click http://sbi-kyc-update-portal.xyz to complete verification immediately to avoid account closure.'
                  )
                }
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Insert Sample Fake KYC Message
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Run Threat Analysis</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode 2: URL Analysis */}
      {activeMode === 'url' && (
        <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Deterministic & Semantic URL Phishing Inspector
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Inspects protocol security, brand typosquatting, high-risk TLDs, IP hosting, and credential interception paths.
            </p>
          </div>

          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Paste Suspicious URL:
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://sbi-kyc-update-portal.xyz/login or bit.ly/claim-refund-upi"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Optional Context (Where was this link encountered?):
              </label>
              <input
                type="text"
                value={urlContext}
                onChange={(e) => setUrlContext(e.target.value)}
                placeholder="e.g. Received via SMS claiming my electricity bill is pending"
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUrlInput('http://hdfc-netbanking-secure-login.top/auth/verify.php');
                  setUrlContext('Received WhatsApp message stating my debit card is locked');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Insert Sample Phishing URL
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Inspect URL</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode 3: QR Analysis */}
      {activeMode === 'qr' && (
        <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              UPI QR Code & Collect Request Scam Detector
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Decodes UPI strings, verifies Payee VPA credibility, and intercepts "reverse payment" traps where victims are asked to scan QR to receive refunds.
            </p>
          </div>

          <QRScannerDropzone
            isLoading={isLoading}
            onScanComplete={(decodedData: string) => {
              setQrPayload(decodedData);
              handleQrSubmit(decodedData);
            }}
          />

          <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Context Behind This QR Code:
            </label>
            <input
              type="text"
              value={qrContext}
              onChange={(e) => setQrContext(e.target.value)}
              placeholder="e.g. Scammer told me scanning this QR will credit ₹3,500 refund to my bank"
              className="w-full px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setQrPayload('upi://pay?pa=amazon.refund.desk77@okhdfcbank&pn=Amazon%20Refund%20Officer&am=3499&cu=INR&tn=Refund%20Credit%20Enter%20PIN');
                  setQrContext('Caller claiming to be Amazon support sent this to refund my failed delivery');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Insert Sample Refund Collect Scam QR
              </button>

              {qrPayload && (
                <button
                  type="button"
                  onClick={() => handleQrSubmit()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Analyze Decoded Payload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Transaction Analysis */}
      {activeMode === 'transaction' && (
        <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Pre-Payment Transaction Risk Analyzer
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Analyzes transfer amount anomaly, recipient VPA novelty, and inbound collect traps before you confirm payment.
            </p>
          </div>

          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Amount (₹): *
                </label>
                <input
                  type="number"
                  step="any"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Receiver UPI ID / VPA: *
                </label>
                <input
                  type="text"
                  value={txReceiver}
                  onChange={(e) => setTxReceiver(e.target.value)}
                  placeholder="e.g. olx-token-seller@paytm"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Merchant / Purpose Category:
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Personal / Peer">Personal / Peer Transfer</option>
                  <option value="Marketplace (OLX/Quikr)">Classifieds / Marketplace (OLX)</option>
                  <option value="Utility Bill">Electricity / Utility Bill</option>
                  <option value="Customer Care">Customer Support / Refund</option>
                  <option value="Investment / Job">Part-Time Task / Investment</option>
                  <option value="E-Commerce">Verified E-Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Transaction Note / Description:
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Advance Token for iPhone 14"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Checkbox Security Flags */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={txIsNewRecipient}
                  onChange={(e) => setTxIsNewRecipient(e.target.checked)}
                  className="rounded border-[var(--border-strong)] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Is this a new recipient you have never transferred money to before?</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={!txIsUserInitiated}
                  onChange={(e) => setTxIsUserInitiated(!e.target.checked)}
                  className="rounded border-[var(--border-strong)] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Was this transaction initiated via an incoming collect request popup on your UPI app?</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={txSuspiciousMsg}
                  onChange={(e) => setTxSuspiciousMsg(e.target.checked)}
                  className="rounded border-[var(--border-strong)] text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Did you receive an urgent call, SMS, or WhatsApp message directing you to make this payment?</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => {
                  setTxAmount('15000');
                  setTxReceiver('olx-seller-advance@paytm');
                  setTxCategory('Marketplace (OLX/Quikr)');
                  setTxDescription('Advance deposit for camera');
                  setTxIsNewRecipient(true);
                  setTxIsUserInitiated(true);
                  setTxSuspiciousMsg(true);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Insert Sample OLX Advance Scam
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Evaluate Transaction</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode 5: AI Context Analysis */}
      {activeMode === 'context' && (
        <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                AI Semantic Incident Context Analysis
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Describe the full real-life situation in your own words. The AI reasons about social engineering intent, multi-stage pretexts, and hidden fraud mechanics.
            </p>
          </div>

          <form onSubmit={handleContextSubmit} className="space-y-4">
            <div>
              <textarea
                value={contextScenario}
                onChange={(e) => setContextScenario(e.target.value)}
                rows={5}
                placeholder="Describe the complete situation...&#10;&#10;Example: I received a call from someone claiming to be Amazon support. They said my order refund of ₹2,500 is pending and sent me a QR code to scan. They told me I need to enter my UPI PIN to receive the credit into my bank account."
                className="w-full p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setContextScenario(
                    'I received a call from an executive claiming to be from Airtel Customer Support. He said my 5G SIM will be permanently deactivated within 1 hour unless I install AnyDesk so he can verify my network settings, and told me to do a ₹10 test transaction via Google Pay.'
                  )
                }
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Insert Sample Multi-Vector Telecom Scenario
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Evaluate Semantic Context</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
