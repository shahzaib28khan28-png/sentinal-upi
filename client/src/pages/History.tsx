import React, { useEffect, useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { ResultScreen } from '../components/analysis/ResultScreen';

export const History: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    loadHistory();
  }, [classificationFilter, threatFilter]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.getHistory({
        search: search.trim() || undefined,
        classification: classificationFilter !== 'ALL' ? classificationFilter : undefined,
        threatType: threatFilter !== 'ALL' ? threatFilter : undefined
      });
      setAnalyses(res.analyses);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis record from the incident log?')) return;

    try {
      await api.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedAnalysis(null)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          ← Back to Analysis History
        </button>
        <ResultScreen result={selectedAnalysis} onReset={() => setSelectedAnalysis(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Analysis Audit Trail & Incident History
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Persisted in local database. {total} total scans recorded.
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search preview, summary, or threat type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Classification Filter */}
        <div className="flex items-center gap-2">
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none"
          >
            <option value="ALL">All Classifications</option>
            <option value="HIGH_RISK">High Risk Only</option>
            <option value="SUSPICIOUS">Suspicious Only</option>
            <option value="SAFE">Safe Only</option>
          </select>

          <select
            value={threatFilter}
            onChange={(e) => setThreatFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none max-w-[170px]"
          >
            <option value="ALL">All Threat Types</option>
            <option value="Fake KYC">Fake KYC</option>
            <option value="Refund Scam">Refund Scam</option>
            <option value="Phishing">Phishing</option>
            <option value="Bank Impersonation">Bank Impersonation</option>
            <option value="Customer Support Scam">Support Scam</option>
            <option value="Lottery / Prize Scam">Lottery Scam</option>
            <option value="Remote Access Scam">Remote Access</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden shadow-sm divide-y divide-[var(--border-subtle)]">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)]">
            Loading incident history...
          </div>
        ) : analyses.length > 0 ? (
          analyses.map((item) => {
            const isHigh = item.classification === 'HIGH_RISK';
            const isSusp = item.classification === 'SUSPICIOUS';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedAnalysis(item)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-surface-elevated)] cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                      isHigh
                        ? 'bg-red-500/10 text-red-500'
                        : isSusp
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {isHigh ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isSusp ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                            : isSusp
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.classification.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {item.threatType}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 max-w-2xl">
                      {item.summary}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
                      <span>Input: {item.meta?.inputType || 'generic'}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                      <span>•</span>
                      <span>{item.indicators?.length || 0} indicators</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Risk Score
                    </span>
                    <span
                      className={`text-lg font-mono font-black ${
                        isHigh
                          ? 'text-red-600 dark:text-red-400'
                          : isSusp
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.riskScore}/100
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, item.id!)}
                    title="Delete record"
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-[var(--text-muted)]">
            No analysis records match your search or filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
