import React from 'react';
import { LayoutDashboard, ShieldCheck, QrCode, Globe, Sparkles } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Analyzer', icon: ShieldCheck },
    { id: 'qr', label: 'QR Scan', icon: QrCode },
    { id: 'url', label: 'URL', icon: Globe },
    { id: 'demo', label: 'Demo', icon: Sparkles }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 border-t bg-[var(--bg-surface)] border-[var(--border-subtle)] lg:hidden px-2 shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
