import React, { useState } from 'react';
import { Globe, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { ResultScreen } from '../components/analysis/ResultScreen';
import { LoadingSteps } from '../components/common/LoadingSteps';

export const URLScannerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) {
      setError('Please provide a URL to inspect.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const data = await api.analyzeUrl(finalUrl.trim(), context.trim() || undefined);
      setResult(data);
    } catch (err: any) {
      console.error('URL inspection error:', err);
      setError(err.message || 'Failed to inspect URL.');
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
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Phishing & Malicious URL Cybersecurity Inspector
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Deterministic protocol validation, brand typosquatting, high-risk TLD abuse, and obfuscation heuristics
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimers & Info */}
      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-secondary)] space-y-1">
        <span className="font-bold text-[var(--text-primary)] block">Inspection Standard:</span>
        <p>
          Runs deterministic algorithmic heuristics locally on URL structure without sending your network traffic to arbitrary unverified domains (SSRF protection). Clearly labeled as <em>Prototype heuristic analysis</em>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* URL Input Form */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Target URL to Inspect:
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://sbi-kyc-update-portal.xyz/login.php"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Where was this link received? (Context):
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. SMS claiming my bank account will be blocked today"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Run Heuristic URL Security Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Preset Heuristic Test Vectors */}
      <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-3">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
          Preset Phishing Test Vectors
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              setUrl('http://sbi-kyc-update-portal.xyz/login');
              setContext('SMS claiming SBI YONO account block');
              handleInspect('http://sbi-kyc-update-portal.xyz/login');
            }}
            className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-left transition-colors"
          >
            <span className="font-bold text-red-600 dark:text-red-400 block">SBI Typosquatting (.xyz)</span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">http://sbi-kyc-update-portal.xyz</span>
          </button>

          <button
            onClick={() => {
              setUrl('http://hdfc-netbanking-secure-login.top/auth/verify.php');
              setContext('WhatsApp message for debit card security verification');
              handleInspect('http://hdfc-netbanking-secure-login.top/auth/verify.php');
            }}
            className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-left transition-colors"
          >
            <span className="font-bold text-red-600 dark:text-red-400 block">HDFC Phishing Kit (.top)</span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">http://hdfc-netbanking-secure-login.top</span>
          </button>

          <button
            onClick={() => {
              setUrl('http://185.220.101.5/pan-link.html');
              setContext('Message asking to link PAN immediately');
              handleInspect('http://185.220.101.5/pan-link.html');
            }}
            className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-left transition-colors"
          >
            <span className="font-bold text-red-600 dark:text-red-400 block">Raw IP Phishing Host</span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">http://185.220.101.5/pan-link.html</span>
          </button>

          <button
            onClick={() => {
              setUrl('https://www.onlinesbi.sbi/portal');
              setContext('Official State Bank of India netbanking portal');
              handleInspect('https://www.onlinesbi.sbi/portal');
            }}
            className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors"
          >
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Legitimate Bank Portal</span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">https://www.onlinesbi.sbi/portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
