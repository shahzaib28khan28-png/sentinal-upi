import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  'Analyzing input...',
  'Extracting indicators...',
  'Evaluating fraud patterns...',
  'Generating risk assessment...',
  'Preparing explanation...'
];

export const LoadingSteps: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-6 max-w-md mx-auto text-center">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
        <Shield className="w-8 h-8 animate-pulse" />
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/30 animate-ping"></div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          UPI Sentinel Engine Evaluating
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Hybrid AI semantic analysis & deterministic cyber heuristics
        </p>
      </div>

      <div className="w-full space-y-2.5 text-left text-xs">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : isDone
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-[var(--text-muted)] opacity-50'
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-blue-500" />
              ) : (
                <div className="w-4 h-4 flex-shrink-0 rounded-full border border-[var(--border-strong)]" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
