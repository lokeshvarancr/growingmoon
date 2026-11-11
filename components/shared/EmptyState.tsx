import React from 'react';
import Link from 'next/link';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

const actionClass =
  'inline-flex items-center justify-center bg-gm-ink hover:bg-gm-accent text-gm-paper text-[13px] font-semibold px-5 h-11 rounded-full transition-colors';

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="relative text-center max-w-md mx-auto my-8 px-8 py-12 sm:py-14 animate-slide-up" data-testid="empty-state">
      <div aria-hidden className="absolute inset-x-10 top-6 h-32 rounded-full bg-gm-accent/[0.08] blur-3xl" />
      {icon && (
        <div className="relative mx-auto mb-6 w-16 h-16 rounded-full bg-gm-surface border border-gm-ink/[0.06] shadow-card flex items-center justify-center text-gm-accent">
          {icon}
        </div>
      )}
      <h3 className="relative font-display text-2xl font-medium text-gm-ink mb-2 tracking-tight">{title}</h3>
      <p className="relative text-sm text-gray-500 leading-relaxed mb-7">{description}</p>
      {actionLabel &&
        (actionHref ? (
          <Link href={actionHref} className={actionClass} data-testid="empty-state-action">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className={actionClass} data-testid="empty-state-action">
            {actionLabel}
          </button>
        ))}
    </div>
  );
}
