'use client';
import React, { useEffect } from 'react';
import { useApp } from '@/lib/state/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastProvider() {
  const { toasts, removeToast } = useApp();

  // Defensive patch for browser pointer emulation (Chrome DevTools / mobile touch releasePointerCapture race condition)
  useEffect(() => {
    if (typeof window !== 'undefined' && Element.prototype.releasePointerCapture) {
      const originalRelease = Element.prototype.releasePointerCapture;
      Element.prototype.releasePointerCapture = function (pointerId: number) {
        try {
          if (this.hasPointerCapture && this.hasPointerCapture(pointerId)) {
            originalRelease.call(this, pointerId);
          }
        } catch {
          // Gracefully ignore stale pointer release from browser touch emulation / fast unmount
        }
      };
    }
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-card bg-gm-white text-gm-midnight text-xs animate-slide-up transition-all ${
            toast.type === 'success'
              ? 'border-gm-success/30'
              : toast.type === 'danger'
              ? 'border-gm-danger/30'
              : toast.type === 'warning'
              ? 'border-gm-warning/30'
              : 'border-gm-border'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-gm-success flex-shrink-0 mt-0.5" />}
          {toast.type === 'danger' && <AlertCircle className="w-4 h-4 text-gm-danger flex-shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-gm-warning flex-shrink-0 mt-0.5" />}
          {(!toast.type || toast.type === 'info') && <Info className="w-4 h-4 text-gm-indigo flex-shrink-0 mt-0.5" />}

          <span className="flex-1 font-medium leading-relaxed">{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-gm-text-secondary hover:text-gm-midnight p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
