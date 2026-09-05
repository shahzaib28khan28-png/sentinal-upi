import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      setIsLoadingHealth(true);
      const data = await api.getHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to query health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all historical analysis records? This cannot be undone.')) {
      return;
    }
    try {
      await api.clearHistory();
      setMessage('All historical analysis records cleared from SQLite database.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Failed to clear history:', err);
      alert('Failed to clear history');
    }
  };

  const handleClearLocal = () => {
    if (!window.confirm('Reset all locally cached settings and preferences?')) {
      return;
    }
    localStorage.clear();
    setTheme('system');
    setMessage('Local preferences and theme reset to system default.');
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            System & Engine Settings
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage appearance themes, AI provider telemetry, and security database records
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Appearance / Theme Configuration */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Interface Appearance Theme
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Select manual Light, Dark, or System mode that dynamically follows your operating system.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-bold shadow-sm'
                : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold shadow-sm'
                : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            <Moon className="w-6 h-6 text-blue-400" />
            <span className="text-xs">Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-500/10 text-emerald-500 font-bold shadow-sm'
                : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            <Laptop className="w-6 h-6 text-emerald-500" />
            <span className="text-xs">System (Auto)</span>
          </button>
        </div>

        <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between pt-1">
          <span>Currently resolved color scheme:</span>
          <span className="font-mono font-bold capitalize text-[var(--text-primary)]">
            {resolvedTheme} mode active
          </span>
        </div>
      </div>

      {/* 2. AI Provider Configuration Status */}
      <div className="p-6 rounded-2xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>AI Provider Telemetry</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live status of LLM connection and fallback semantic reasoning engine
            </p>
          </div>
          <button
            onClick={loadHealth}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block">Configured Provider:</span>
            <span className="font-mono font-bold text-[var(--text-primary)] capitalize">
              {healthData?.ai?.configuredProvider || 'mock'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block">Active Engine:</span>
            <span className="font-bold text-[var(--text-primary)] truncate block">
              {healthData?.ai?.activeProviderName || 'Semantic AI Heuristic'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)] block">API Mode:</span>
            <span
              className={`font-mono font-bold ${
                healthData?.ai?.isLiveAPI ? 'text-emerald-500' : 'text-blue-500'
              }`}
            >
              {healthData?.ai?.isLiveAPI ? 'Live Cloud API' : 'Local Offline Heuristic'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          <p>{healthData?.ai?.disclaimer}</p>
        </div>

        <div className="text-[11px] text-[var(--text-muted)]">
          <p>
            * Note: API keys are securely read from backend environment variables (<code>.env</code>) and are never transmitted to or exposed in the frontend client.
          </p>
        </div>
      </div>

      {/* 3. Security & Data Management */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-[var(--bg-surface)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Security & Data Management</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Permanently erase recorded incident evaluations and wipe local cached states
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleClearHistory}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Analysis Database History</span>
          </button>

          <button
            onClick={handleClearLocal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] text-xs font-semibold transition-all"
          >
            <span>Reset Local Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
