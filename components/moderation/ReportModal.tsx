'use client';
import React, { useState } from 'react';
import { moderationApi } from '@/lib/api/client';
import type { ReportTargetType } from '@/lib/api/types';
import { useApp } from '@/lib/state/AppContext';
import {
  Flag,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
};

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam, advertising, or bot activity' },
  { id: 'harassment', label: 'Harassment, hate speech, or abuse' },
  { id: 'inappropriate', label: 'Inappropriate or explicit content' },
  { id: 'scam', label: 'Scam, fraud, or impersonation' },
  { id: 'misinformation', label: 'Misinformation or fake claims' },
  { id: 'other', label: 'Other violation' },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const { addToast } = useApp();
  const [reason, setReason] = useState<string>('spam');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await moderationApi.submitReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() || undefined,
      });

      addToast('Report submitted for review. Thank you for keeping Growing Moon safe.', 'success');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabel = () => {
    switch (targetType) {
      case 'post':
        return 'Report Post';
      case 'journey':
        return 'Report Journey';
      case 'user':
        return 'Report Member Account';
      default:
        return 'Report Content';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-black/[0.06] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#141724] tracking-tight">
                {getLabel()}
              </h3>
              {targetTitle && (
                <p className="text-xs text-gray-500 truncate max-w-[240px]">
                  {targetTitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#141724] mb-2">
              Why are you reporting this {targetType}?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r.id
                      ? 'bg-rose-50/60 border-rose-300 text-rose-900 font-semibold'
                      : 'bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-rose-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#141724] mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context to assist the moderation team..."
              rows={3}
              maxLength={500}
              className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-rose-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
