import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Analyzer } from './pages/Analyzer';
import { QRScannerPage } from './pages/QRScannerPage';
import { URLScannerPage } from './pages/URLScannerPage';
import { History } from './pages/History';
import { DemoMode } from './pages/DemoMode';
import { About } from './pages/About';
import { Settings } from './pages/Settings';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealthStatus(data))
      .catch((err) => console.warn('Could not fetch initial engine health:', err));
  }, []);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'analyzer':
        return <Analyzer />;
      case 'qr':
        return <QRScannerPage />;
      case 'url':
        return <URLScannerPage />;
      case 'history':
        return <History />;
      case 'demo':
        return <DemoMode />;
      case 'about':
        return <About />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          aiStatus={healthStatus}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {renderContent()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[var(--border-subtle)] py-4 px-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface-subtle)]">
          <p>
            UPI Sentinel — Problem Statement PS-03 • Hackathon Demonstration Prototype.
          </p>
          <p className="text-[11px] mt-0.5">
            Risk assessments are advisory heuristics and do not represent definitive proof of fraud. Never enter your UPI PIN to receive money.
          </p>
        </footer>

        {/* Mobile Navigation bar */}
        <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>
    </div>
  );
}

export default App;
