import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Sparkles,
  QrCode,
  Globe,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats, AnalysisResult } from '../types';
import { ResultScreen } from '../components/analysis/ResultScreen';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = async (id: string) => {
    try {
      const full = await api.getAnalysisById(id);
      setSelectedAnalysis(full);
    } catch (err) {
      console.error('Failed to fetch analysis details:', err);
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedAnalysis(null)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          ← Back to Operations Dashboard
        </button>
        <ResultScreen result={selectedAnalysis} onReset={() => setSelectedAnalysis(null)} />
      </div>
    );
  }

  const pieData = stats?.riskDistribution || [
    { name: 'Safe (0-29)', count: 0, fill: '#10B981' },
    { name: 'Suspicious (30-69)', count: 0, fill: '#F59E0B' },
    { name: 'High Risk (70-100)', count: 0, fill: '#EF4444' }
  ];

  const barData = stats?.threatBreakdown?.map((t: any) => ({
    name: t.threat_type.replace(' Scam', '').replace(' / Prize', ''),
    count: t.count
  })) || [];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-transparent border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            UPI Threat Intelligence
          </span>
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mt-2 tracking-tight">
            UPI Sentinel Scam Prevention System
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Real-time hybrid analysis combining AI semantic intent detection with deterministic cybersecurity rules to intercept financial fraud before payment initiation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('analyzer')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
          <button
            onClick={() => onNavigate('demo')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Launch Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Total Evaluated</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-[var(--text-primary)]">
              {stats?.total ?? 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Live Log</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Deterministic & AI telemetry
          </p>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-red-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-semibold">
            <span>High Risk Intercepts</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-red-600 dark:text-red-400">
              {stats?.highRisk ?? 0}
            </span>
            <span className="text-[11px] text-red-500 font-medium">Critical</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Score 70–100 (Immediate alert)
          </p>
        </div>

        {/* Suspicious */}
        <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>Suspicious Contexts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats?.suspicious ?? 0}
            </span>
            <span className="text-[11px] text-amber-500 font-medium">Elevated</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Score 30–69 (Caution needed)
          </p>
        </div>

        {/* Safe */}
        <div className="p-5 rounded-2xl border bg-[var(--bg-surface)] border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Safe Transactions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats?.safe ?? 0}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Verified</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Score 0–29 (Standard protocol)
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Threat Classification Distribution
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Proportion of safe, suspicious, and high-risk scans
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">Real-time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-strong)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Categories Breakdown */}
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Top Detected Scam Vectors
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Frequency by social engineering category
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">PS-03 Taxonomy</span>
          </div>

          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-strong)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                No threat patterns logged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards for Key Channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('analyzer')}
          className="p-4 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] transition-all text-left flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">SMS & Chat</span>
            <span className="text-[11px] text-[var(--text-muted)]">Analyze SMS, WhatsApp</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('qr')}
          className="p-4 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] transition-all text-left flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">QR Scanner</span>
            <span className="text-[11px] text-[var(--text-muted)]">Detect reverse collect</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('url')}
          className="p-4 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] transition-all text-left flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">URL Phishing</span>
            <span className="text-[11px] text-[var(--text-muted)]">Domain heuristics</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('analyzer')}
          className="p-4 rounded-xl border bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] transition-all text-left flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">Transactions</span>
            <span className="text-[11px] text-[var(--text-muted)]">VPA anomaly scoring</span>
          </div>
        </button>
      </div>

      {/* Recent Analyses Activity Feed */}
      <div className="rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Recent Threat Evaluations
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Click any item to review complete explainable indicators
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
            stats.recentAnalyses.map((item: any) => {
              const isHigh = item.classification === 'HIGH_RISK';
              const isSusp = item.classification === 'SUSPICIOUS';
              return (
                <div
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-surface-elevated)] cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex-shrink-0 ${
                        isHigh
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                          : isSusp
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.classification.replace('_', ' ')}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-[var(--text-primary)] block line-clamp-1">
                        {item.inputPreview}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)] font-mono">
                        <span className="capitalize">{item.inputType}</span>
                        <span>•</span>
                        <span>{item.threatType}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-[var(--text-muted)] block">Score</span>
                      <span className={`text-sm font-mono font-bold ${
                        isHigh ? 'text-red-600 dark:text-red-400' : isSusp ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.riskScore}/100
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No recent analyses recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
