import React from 'react';
import { Menu, ShieldAlert, Sun, Moon, Laptop, Cpu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
  aiStatus?: any;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Security Operations Dashboard', subtitle: 'Real-time telemetry, risk distribution, and threat patterns' },
  analyzer: { title: 'Multi-Vector Threat Analyzer', subtitle: 'Analyze messages, payment links, and suspicious transaction contexts' },
  qr: { title: 'UPI QR Code Security Inspector', subtitle: 'Decode UPI payloads and intercept reverse collect scams' },
  url: { title: 'URL & Phishing Heuristic Scanner', subtitle: 'Domain typosquatting, TLD abuse, and credential interception checks' },
  history: { title: 'Analysis Incident Log', subtitle: 'Search, review, and audit previous threat assessments' },
  demo: { title: 'Hackathon Interactive Demo Suite', subtitle: 'Instant one-click evaluation of real-world UPI scam vectors' },
  about: { title: 'Problem Statement & Architecture', subtitle: 'PS-03 UPI Scam Detection & Hybrid Risk Engine Specifications' },
  settings: { title: 'System Configuration', subtitle: 'Appearance themes, AI provider telemetry, and security data management' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  aiStatus
}) => {
  const { theme, setTheme } = useTheme();
  const info = TAB_TITLES[currentTab] || { title: 'UPI Sentinel', subtitle: 'Detect UPI Scams Before You Pay' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b bg-[var(--header-blur)] backdrop-blur-md border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation"
          className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {info.title}
          </h2>
          <p className="hidden sm:block text-xs text-[var(--text-muted)]">
            {info.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* AI Provider Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>{aiStatus?.ai?.isLiveAPI ? 'Live AI' : 'Semantic Heuristic'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* Theme quick toggles */}
        <div className="flex items-center p-0.5 rounded-lg border bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)]">
          <button
            onClick={() => setTheme('light')}
            aria-label="Light mode"
            title="Light Theme"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'light'
                ? 'bg-[var(--bg-surface)] text-amber-500 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
            title="Dark Theme"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-[var(--bg-surface)] text-blue-400 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            aria-label="System mode"
            title="System / Auto Theme"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'system'
                ? 'bg-[var(--bg-surface)] text-emerald-500 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
