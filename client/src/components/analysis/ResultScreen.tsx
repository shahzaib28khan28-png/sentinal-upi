import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  QrCode,
  Globe,
  Share2,
  RotateCcw,
  Info,
  Check
} from 'lucide-react';
import { AnalysisResult, Indicator } from '../../types';

interface ResultScreenProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<number, boolean>>({
    0: true, // Expand first by default
    1: true
  });

  const toggleIndicator = (idx: number) => {
    setExpandedIndicators((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const isHighRisk = result.classification === 'HIGH_RISK';
  const isSuspicious = result.classification === 'SUSPICIOUS';
  const isSafe = result.classification === 'SAFE';

  const riskColor = isHighRisk
    ? 'text-red-500 border-red-500/30 bg-red-500/10 dark:bg-red-500/15'
    : isSuspicious
    ? 'text-amber-500 border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15'
    : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15';

  const badgeBg = isHighRisk
    ? 'bg-red-600 text-white'
    : isSuspicious
    ? 'bg-amber-600 text-white'
    : 'bg-emerald-600 text-white';

  const classificationText = isHighRisk
    ? 'HIGH RISK'
    : isSuspicious
    ? 'SUSPICIOUS'
    : 'SAFE';

  const ClassificationIcon = isHighRisk
    ? ShieldAlert
    : isSuspicious
    ? AlertTriangle
    : ShieldCheck;

  const handleShare = () => {
    const text = `UPI Sentinel Threat Report: ${result.classification} (${result.riskScore}/100) - Threat: ${result.threatType}\nSummary: ${result.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner Card */}
      <div
        className={`p-6 md:p-8 rounded-2xl border ${riskColor} relative overflow-hidden transition-all shadow-md`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shadow-sm ${
                isHighRisk
                  ? 'bg-red-500 text-white'
                  : isSuspicious
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              <ClassificationIcon className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${badgeBg}`}>
                  {classificationText}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {result.threatType !== 'Unknown' ? result.threatType : 'No Threat Detected'}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {isHighRisk
                  ? 'High Cyber Fraud Risk Detected'
                  : isSuspicious
                  ? 'Elevated Risk Signals Observed'
                  : 'Transaction Appears Safe'}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Risk Score Circle / Badge */}
          <div className="flex md:flex-col items-center justify-between md:justify-center p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] md:min-w-[140px] shadow-sm">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-4xl md:text-5xl font-black font-mono tracking-tight ${
                isHighRisk ? 'text-red-600 dark:text-red-400' : isSuspicious ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {result.riskScore}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/100</span>
            </div>
            <div className="w-full bg-[var(--bg-surface-elevated)] h-2 rounded-full overflow-hidden mt-1 hidden md:block">
              <div
                className={`h-full transition-all duration-1000 ${
                  isHighRisk ? 'bg-red-500' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, result.riskScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Social Engineering Techniques Tags */}
        {result.socialEngineeringTechniques && result.socialEngineeringTechniques.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Tactics Identified:
            </span>
            {result.socialEngineeringTechniques.map((technique, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
              >
                {technique}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* UPI Safety Golden Rule for QR / Payment Input */}
      {result.meta?.mandatorySafetyNotice && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 dark:bg-red-500/15 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <span className="font-bold">CRITICAL UPI PROTOCOL RULE: </span>
            <span>{result.meta.mandatorySafetyNotice}</span>
          </div>
        </div>
      )}

      {/* Parsed UPI Details Panel (If QR or UPI was inspected) */}
      {result.meta?.upiDetails && (
        <div className="p-5 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <QrCode className="w-4 h-4 text-blue-500" />
            <span>Decoded UPI Payload Parameters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Payee VPA (pa):</span>
              <span className="font-mono font-bold text-[var(--text-primary)] break-all">
                {result.meta.upiDetails.pa || 'Not specified'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Payee Name (pn):</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {result.meta.upiDetails.pn || 'Unknown / Unnamed'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Amount (am):</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {result.meta.upiDetails.am ? `₹${result.meta.upiDetails.am}` : 'User enters amount'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Transaction Note (tn):</span>
              <span className="font-medium text-[var(--text-secondary)] italic">
                {result.meta.upiDetails.tn || 'No note'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Merchant Code (mc):</span>
              <span className="font-mono text-[var(--text-secondary)]">
                {result.meta.upiDetails.mc || 'None (Peer-to-Peer)'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">Direction Intent:</span>
              <span className={`font-bold ${result.meta.upiDetails.isCollectRequest ? 'text-red-500' : 'text-blue-500'}`}>
                {result.meta.upiDetails.isCollectRequest ? 'Collect / Debit Request' : 'Standard Payment Pay'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* URL Security Heuristics Panel (If URL was inspected) */}
      {result.meta?.urlDetails && (
        <div className="p-5 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Deterministic URL Security Breakdown</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              {result.meta.urlDetails.prototypeNote}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block">Protocol</span>
              <span className={`font-mono font-bold ${result.meta.urlDetails.isHttps ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.meta.urlDetails.protocol.toUpperCase()} {result.meta.urlDetails.isHttps ? '✓' : '⚠️ Insecure'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block">Host Domain</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] truncate block">
                {result.meta.urlDetails.domain}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block">TLD Risk</span>
              <span className="font-mono font-semibold text-[var(--text-secondary)]">
                .{result.meta.urlDetails.tld || 'none'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block">Typosquatting</span>
              <span className={`font-semibold ${result.meta.urlDetails.typosquattingSuspected ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>
                {result.meta.urlDetails.typosquattingSuspected ? `Yes (${result.meta.urlDetails.impersonatedBrand})` : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* WHY IS THIS RISKY? (Evidence Section) */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {isSafe ? 'VERIFIED SAFETY INDICATORS' : 'WHY IS THIS RISKY? (EVIDENCE & EXPLANATION)'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Multi-layered factor breakdown with technical evidence and risk contributions
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {result.indicators.length} factors evaluated
          </span>
        </div>

        <div className="space-y-2.5">
          {result.indicators.map((indicator, idx) => {
            const isExpanded = expandedIndicators[idx] ?? false;
            const isCrit = indicator.severity === 'CRITICAL';
            const isHigh = indicator.severity === 'HIGH';
            const isMed = indicator.severity === 'MEDIUM';

            const sevBadge = isCrit
              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
              : isHigh
              ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
              : isMed
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleIndicator(idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[var(--bg-surface-elevated)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded border ${sevBadge}`}>
                      {indicator.severity}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {indicator.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      +{indicator.scoreContribution}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <p>{indicator.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDED ACTIONS */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          RECOMMENDED DEFENSIVE ACTIONS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {result.recommendations.map((rec, idx) => {
            const isNegative = rec.includes('🚫') || rec.toLowerCase().includes('do not') || rec.toLowerCase().includes('never');
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
                  isNegative
                    ? 'border-red-500/25 bg-red-500/5 text-red-700 dark:text-red-300'
                    : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isNegative ? (
                  <XCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                )}
                <span>{rec.replace(/^[🚫✅⚠️]\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-strong)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze Another Input</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Summary Copied!' : 'Copy Report Summary'}</span>
        </button>
      </div>
    </div>
  );
};
