import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  ShieldCheck,
  QrCode,
  Globe,
  History,
  Sparkles,
  Info,
  Settings,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { theme, setTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Analyzer', icon: ShieldCheck },
    { id: 'qr', label: 'QR Scanner', icon: QrCode },
    { id: 'url', label: 'URL Scanner', icon: Globe },
    { id: 'history', label: 'History', icon: History },
    { id: 'demo', label: 'Demo Mode', icon: Sparkles, highlight: true },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-[var(--bg-surface)] border-[var(--border-subtle)]`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-base text-[var(--text-primary)]">
              UPI SENTINEL
            </h1>
            <p className="text-[11px] font-medium tracking-wide uppercase text-blue-600 dark:text-blue-400">
              Scam Shield v1.0
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-600'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Theme Switcher */}
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2 font-medium">
            <span>Appearance</span>
            <span className="capitalize">{theme}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-surface-elevated)] rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => setTheme('light')}
              title="Light Theme"
              className={`flex items-center justify-center py-1.5 rounded text-xs transition-all ${
                theme === 'light'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5 mr-1" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Theme"
              className={`flex items-center justify-center py-1.5 rounded text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 mr-1" /> Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Theme"
              className={`flex items-center justify-center py-1.5 rounded text-xs transition-all ${
                theme === 'system'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 mr-1" /> Auto
            </button>
          </div>
        </div>

        {/* Status indicator footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Engine Online
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">SOC Mode</span>
        </div>
      </aside>
    </>
  );
};
