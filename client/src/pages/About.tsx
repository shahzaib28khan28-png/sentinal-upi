import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  FileCheck,
  AlertTriangle,
  Lock,
  GitBranch,
  Info
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-transparent border border-blue-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            Problem Statement PS-03
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          UPI Sentinel — "Detect UPI Scams Before You Pay"
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          An explainable, multi-vector cybersecurity intelligence platform built to protect digital payment users in India against fake KYC messages, refund collect traps, QR impersonation, and multi-stage social engineering schemes.
        </p>
      </div>

      {/* Problem & Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>The UPI Fraud Epidemic</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            With over 14 billion monthly UPI transactions, malicious actors exploit human psychology rather than software vulnerabilities. Fraudsters use reverse payment collect requests, SMS account-suspension threats, and fake customer helplines to manipulate victims into transferring funds or revealing PINs.
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>The PS-03 Challenge</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Develop an intelligent system that analyzes suspicious messages, links, QR content, or transaction descriptions and classifies them into <strong>SAFE (0–29)</strong>, <strong>SUSPICIOUS (30–69)</strong>, and <strong>HIGH RISK (70–100)</strong> with clear, explainable technical evidence.
          </p>
        </div>
      </div>

      {/* Hybrid Detection Architecture */}
      <div className="p-6 md:p-8 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <span>Hybrid Multi-Tier Detection Architecture</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          UPI Sentinel does not rely solely on an LLM or keyword search. It synthesizes deterministic cybersecurity rules with semantic contextual AI.
        </p>

        {/* ASCII / Visual Flow */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] overflow-x-auto">
          <pre className="leading-relaxed">
{`                  [ USER INPUT ]
     (SMS, WhatsApp, Phishing URL, QR Code, Transaction Context)
                         │
                         ▼
             [ INPUT PREPROCESSOR & SANITIZER ]
                         │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
 [ AI SEMANTIC ANALYSIS ]         [ DETERMINISTIC ANALYSIS ]
  • Intent & Urgency               • URL Security Heuristics
  • Authority Impersonation        • QR / UPI Protocol Parser
  • Social Engineering Markers     • Collect Scam Traps
  • Context Incongruity            • Recipient Novelty Checks
       │                                   │
       └─────────────────┬─────────────────┘
                         ▼
             [ HYBRID RISK SYNTHESIS ENGINE ]
            (Calibrated 0–100 Risk Score)
                         │
                         ▼
      [ EXPLAINABLE CYBERSECURITY REPORT & ADVISORY ]
  (Risk Score + Threat Type + Itemized Evidence + Actionable Guidance)`}
          </pre>
        </div>
      </div>

      {/* Threat Taxonomy */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          PS-03 Cyber Threat Taxonomy
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {[
            'Fake KYC',
            'Phishing',
            'Refund Scam',
            'QR Scam',
            'UPI Collect Scam',
            'Bank Impersonation',
            'Customer Support Scam',
            'OTP Scam',
            'Lottery / Prize Scam',
            'Investment Scam',
            'Job Scam',
            'Remote Access Scam',
            'Payment Redirection'
          ].map((threat, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium"
            >
              • {threat}
            </div>
          ))}
        </div>
      </div>

      {/* Transparency & Realism Disclosure */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Ethics, Accuracy & Realism Notice</span>
        </div>
        <div className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
          <p>
            <strong>Advisory Disclaimer:</strong> UPI Sentinel is a hackathon demonstration prototype. Risk assessments are advisory heuristics generated by algorithmic pattern analysis and AI evaluation, and must not be treated as definitive legal proof of criminal intent.
          </p>
          <p>
            <strong>Zero False Database Claims:</strong> UPI Sentinel does NOT claim to query private NPCI internal switches, bank databases, police registries, or live bank balance APIs. All URL scans are performed via algorithmic structure inspection and clearly designated as <em>Prototype Heuristic Analysis</em>.
          </p>
          <p>
            <strong>Data Privacy:</strong> No user passwords, bank PINs, or sensitive authentication secrets are logged or retained.
          </p>
        </div>
      </div>
    </div>
  );
};
