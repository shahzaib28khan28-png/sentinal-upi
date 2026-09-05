import React, { useState } from 'react';
import { QrCode, AlertTriangle, ShieldCheck } from 'lucide-react';
import { QRScannerDropzone } from '../components/scanner/QRScannerDropzone';
import { ResultScreen } from '../components/analysis/ResultScreen';
import { LoadingSteps } from '../components/common/LoadingSteps';
import { api } from '../services/api';
import { AnalysisResult } from '../types';

export const QRScannerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [userContext, setUserContext] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (qrData: string) => {
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const data = await api.analyzeQr(qrData, userContext.trim() || undefined);
      setResult(data);
    } catch (err: any) {
      console.error('QR analysis error:', err);
      setError(err.message || 'Failed to inspect QR code.');
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
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fadeIn">
      {/* Header banner */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              UPI QR Code & Reverse Collect Scanner
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Scan or upload any QR code before making payments on Google Pay, PhonePe, or Paytm
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice Box */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">GOLDEN RULE OF UPI TRANSACTIONS:</p>
          <p>
            Scanning a QR code is strictly designed to <strong>SEND</strong> money from your account. You NEVER need to scan a QR code or enter your UPI PIN to receive money, refunds, or cashbacks.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* QR Upload & Camera Scanner Component */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <div className="mb-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Optional Context (e.g. "Buyer on OLX sent this QR claiming to pay me"):
          </label>
          <input
            type="text"
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="Tell us what the other person claims this QR will do..."
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <QRScannerDropzone onScanComplete={handleScan} isLoading={isLoading} />
      </div>

      {/* Quick Test Vectors */}
      <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-3">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
          Quick Demonstration Payloads
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              setUserContext('Caller claiming to be Amazon support said scanning this will refund my pending order');
              handleScan('upi://pay?pa=amazon.refund.desk77@okhdfcbank&pn=Amazon%20Refund%20Officer&am=3499&cu=INR&tn=Refund%20Credit%20Enter%20PIN');
            }}
            className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-left transition-colors"
          >
            <span className="font-bold text-red-600 dark:text-red-400 block">Refund Scam Trap QR</span>
            <span className="text-[11px] text-[var(--text-muted)]">Pretends to refund ₹3,499 but debits your account</span>
          </button>

          <button
            onClick={() => {
              setUserContext('Buying grocery at local supermarket counter');
              handleScan('upi://pay?pa=supermarket.retail@okaxis&pn=Daily%20Supermarket&am=450&cu=INR&mc=5411');
            }}
            className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors"
          >
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Legitimate Merchant QR</span>
            <span className="text-[11px] text-[var(--text-muted)]">Verified retail merchant with category code 5411</span>
          </button>
        </div>
      </div>
    </div>
  );
};
