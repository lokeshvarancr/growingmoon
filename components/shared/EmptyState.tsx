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

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-gm-white border border-gm-border rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto my-6 shadow-card">
      {icon && <div className="flex justify-center text-gm-lavender mb-4">{icon}</div>}
      <h3 className="text-base font-bold text-gm-midnight mb-1.5">{title}</h3>
      <p className="text-xs text-gm-text-secondary leading-relaxed mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center bg-gm-indigo text-gm-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gm-indigo-hover transition-colors shadow-card"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center bg-gm-indigo text-gm-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gm-indigo-hover transition-colors shadow-card"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
