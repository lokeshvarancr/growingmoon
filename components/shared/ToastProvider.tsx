'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/lib/state/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const tone: Record<string, string> = {
  success: 'bg-gm-moss',
  danger: 'bg-gm-danger',
  warning: 'bg-gm-warning',
  info: 'bg-gm-accent',
};

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

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            layout
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 pr-3 rounded-2xl bg-gm-ink text-gm-paper text-[13px] shadow-modal"
            data-testid="toast"
          >
            <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white ${tone[toast.type || 'info'] || tone.info}`}>
              {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {(toast.type === 'danger' || toast.type === 'warning') && <AlertCircle className="w-3.5 h-3.5" />}
              {(!toast.type || toast.type === 'info') && <Info className="w-3.5 h-3.5" />}
            </span>

            <span className="flex-1 font-medium leading-relaxed pt-0.5">{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gm-paper/50 hover:text-gm-paper p-1 rounded-full transition-colors"
              aria-label="Dismiss"
              data-testid="toast-dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
