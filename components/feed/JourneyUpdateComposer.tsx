'use client';
import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/state/AppContext';
import type { MediaAttachment } from '@/types';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  Bookmark,
  Send,
} from 'lucide-react';

type JourneyUpdateComposerProps = {
  onSuccess?: () => void;
  isStandalonePage?: boolean;
  layout?: 'horizontal' | 'vertical';
};

type UpdateTypeOption = {
  id: string;
  label: string;
  dotColor: string;
};

type JourneyOption = {
  id: string;
  label: string;
  dotColor: string;
};

const INITIAL_UPDATE_TYPES: UpdateTypeOption[] = [
  { id: 'progress', label: 'Progress update', dotColor: 'bg-gm-accent' },
  { id: 'milestone', label: 'Milestone achieved', dotColor: 'bg-[#10B981]' },
  { id: 'challenge', label: 'Challenge', dotColor: 'bg-[#F59E0B]' },
  { id: 'lesson', label: 'Lesson learned', dotColor: 'bg-[#EF4444]' },
];

const INITIAL_JOURNEYS: JourneyOption[] = [
  { id: 'j-saas', label: 'Building my SaaS product', dotColor: 'bg-gm-accent' },
  { id: 'j-ai', label: 'Learning Artificial Intelligence', dotColor: 'bg-[#10B981]' },
  { id: 'j-marathon', label: 'Running my first half marathon', dotColor: 'bg-[#06B6D4]' },
  { id: 'j-finance', label: 'Personal finance journey', dotColor: 'bg-[#F59E0B]' },
];

const INITIAL_ATTACHMENTS: MediaAttachment[] = [
  {
    id: 'att-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80',
    alt: 'Whiteboard Prototype Sprint',
  },
  {
    id: 'att-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    alt: 'Dashboard UI Mockup',
  },
  {
    id: 'att-3',
    type: 'file',
    url: '#',
    fileName: 'MVP_Pitch_Deck.pptx',
    fileSize: '12 MB',
  },
];

export default function JourneyUpdateComposer({
  onSuccess,
  isStandalonePage = false,
}: JourneyUpdateComposerProps) {
  const { addUpdate, addToast } = useApp();

  const [updateTypes, setUpdateTypes] = useState<UpdateTypeOption[]>(INITIAL_UPDATE_TYPES);
  const [selectedUpdateType, setSelectedUpdateType] = useState<string>('Progress update');
  const [isUpdateTypeOpen, setIsUpdateTypeOpen] = useState(false);

  const [journeys, setJourneys] = useState<JourneyOption[]>(INITIAL_JOURNEYS);
  const [selectedJourney, setSelectedJourney] = useState<string>('Building my SaaS product');
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const [heading, setHeading] = useState('Finally launched our first prototype');
  const [summary, setSummary] = useState(
    'After three weeks of development, our first working prototype is ready for customer testing.'
  );

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [detailedDescription, setDetailedDescription] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>(INITIAL_ATTACHMENTS);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for creating new type / journey
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [isNewJourneyModalOpen, setIsNewJourneyModalOpen] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileTypeToUpload, setFileTypeToUpload] = useState<'image' | 'video' | 'file'>('image');

  const triggerFileInput = (type: 'image' | 'video' | 'file') => {
    setFileTypeToUpload(type);
    if (fileInputRef.current) {
      if (type === 'image') {
        fileInputRef.current.accept = 'image/*';
      } else if (type === 'video') {
        fileInputRef.current.accept = 'video/*';
      } else {
        fileInputRef.current.accept = '.pdf,.ppt,.pptx,.doc,.docx,.txt,.zip';
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newItems.push({
        id: Math.random().toString(36).slice(2),
        type: fileTypeToUpload,
        url: objectUrl,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        alt: file.name,
      });
    }

    setAttachments((prev) => [...prev, ...newItems]);
    addToast(`${fileTypeToUpload === 'image' ? 'Image' : fileTypeToUpload === 'video' ? 'Video' : 'File'} added!`, 'info');
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && target.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleAddNewType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const newOption: UpdateTypeOption = {
      id: 'custom-' + Date.now(),
      label: newTypeName.trim(),
      dotColor: 'bg-purple-600',
    };
    setUpdateTypes((prev) => [...prev, newOption]);
    setSelectedUpdateType(newOption.label);
    setNewTypeName('');
    setIsNewTypeModalOpen(false);
    setIsUpdateTypeOpen(false);
    addToast(`Added "${newOption.label}" to update types`, 'success');
  };

  const handleAddNewJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJourneyName.trim()) return;
    const newOption: JourneyOption = {
      id: 'journey-' + Date.now(),
      label: newJourneyName.trim(),
      dotColor: 'bg-gm-accent',
    };
    setJourneys((prev) => [...prev, newOption]);
    setSelectedJourney(newOption.label);
    setNewJourneyName('');
    setIsNewJourneyModalOpen(false);
    setIsJourneyOpen(false);
    addToast(`Created new journey: "${newOption.label}"`, 'success');
  };

  const handlePostAndSave = () => {
    if (!heading.trim() && !summary.trim()) {
      addToast('Please enter a heading or summary for your update', 'warning');
      return;
    }

    setIsSubmitting(true);

    const fullContent = detailedDescription.trim()
      ? `${summary.trim()}\n\n${detailedDescription.trim()}`
      : summary.trim();

    setTimeout(() => {
      addUpdate({
        headline: heading.trim(),
        journeyTag: selectedJourney,
        category: selectedUpdateType,
        oneLineSummary: summary.trim(),
        content: fullContent,
        media: attachments,
      });

      setIsSubmitting(false);
      addToast('Journey update posted to your feed and timeline!', 'success');
      if (onSuccess) onSuccess();
    }, 350);
  };

  const handleSaveDraft = () => {
    addToast('Journey update saved to your drafts!', 'info');
    if (onSuccess) onSuccess();
  };

  return (
    <div className={`bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-gray-100 ${isStandalonePage ? 'shadow-xl' : 'shadow-2xl'}`}>
      
      {/* ── 1. HEADER: Title & Subtitle ──────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[26px] sm:text-[22px] font-bold text-gm-ink tracking-tight">
            Share a journey update
          </h2>
          <p className="text-xs sm:text-[13px] text-gray-500 font-normal mt-0.5">
            Document your next step
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-4.5">
        {/* ── 2. ROW 1: Update type & Select journey Dropdowns ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Left Column: Update type * */}
          <div className="relative">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Update type <span className="text-red-500">*</span>
            </label>
            
            <button
              type="button"
              onClick={() => {
                setIsUpdateTypeOpen(!isUpdateTypeOpen);
                setIsJourneyOpen(false);
              }}
              className="w-full border border-gray-200/90 hover:border-gray-300 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between cursor-pointer bg-white transition-all shadow-2xs text-left"
            >
              <span className="bg-gm-accent-soft text-gm-accent text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                {selectedUpdateType}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isUpdateTypeOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUpdateTypeOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUpdateTypeOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-slide-up">
                  <div className="space-y-0.5">
                    {updateTypes.map((type) => {
                      const isSelected = selectedUpdateType === type.label;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setSelectedUpdateType(type.label);
                            setIsUpdateTypeOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-gm-accent-soft text-gm-ink font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${type.dotColor} flex-shrink-0`} />
                            <span>{type.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-gm-accent flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewTypeModalOpen(true);
                      setIsUpdateTypeOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-gm-accent hover:bg-purple-50/60 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add new update type</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Select journey * */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Select journey <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewJourneyModalOpen(true)}
                className="w-6 h-6 rounded-lg bg-purple-50 hover:bg-purple-100 text-gm-accent flex items-center justify-center transition-colors cursor-pointer"
                title="Create a new journey"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsJourneyOpen(!isJourneyOpen);
                setIsUpdateTypeOpen(false);
              }}
              className="w-full border border-gray-200/90 hover:border-gray-300 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between cursor-pointer bg-white transition-all shadow-2xs text-left"
            >
              <span className="bg-gm-accent-soft text-gm-accent text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 truncate max-w-[85%]">
                {selectedJourney}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isJourneyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isJourneyOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsJourneyOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-slide-up">
                  <div className="space-y-0.5">
                    {journeys.map((j) => {
                      const isSelected = selectedJourney === j.label;
                      return (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => {
                            setSelectedJourney(j.label);
                            setIsJourneyOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-gm-accent-soft text-gm-ink font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${j.dotColor} flex-shrink-0`} />
                            <span className="truncate">{j.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-gm-accent flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewJourneyModalOpen(true);
                      setIsJourneyOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-gm-accent hover:bg-purple-50/60 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create a new journey</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── 3. ROW 2: Heading * ─────────────────────────────── */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Heading <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={100}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Finally launched our first prototype"
              className="w-full px-4 py-3 pr-16 rounded-2xl border border-gray-200/90 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all shadow-2xs"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-normal pointer-events-none">
              {heading.length}/100
            </span>
          </div>
        </div>

        {/* ── 4. ROW 3: One line summary * ───────────────────── */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            One line summary <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={150}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="After three weeks of development, our first working prototype is ready for customer testing."
              className="w-full px-4 py-3 pr-16 rounded-2xl border border-gray-200/90 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all shadow-2xs"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-normal pointer-events-none">
              {summary.length}/150
            </span>
          </div>
        </div>

        {/* ── 5. ROW 4: Collapsible "Add more details (optional)" */}
        <div className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-2xs transition-all">
          <button
            type="button"
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-gray-50/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gm-accent-soft flex items-center justify-center text-gm-accent flex-shrink-0">
                <List className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-gm-ink block">
                  Add more details (optional)
                </span>
                <span className="text-[11px] text-gray-500 font-normal mt-0.5 block">
                  Write a detailed description and add attachments.
                </span>
              </div>
            </div>
            {isDetailsExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
          </button>

          {isDetailsExpanded && (
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100 animate-fade-in">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Detailed description
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={detailedDescription}
                    onChange={(e) => setDetailedDescription(e.target.value)}
                    placeholder="Share what happened, what you learned, challenges, or what comes next..."
                    className="w-full p-3.5 pb-6 rounded-2xl border border-gray-200/90 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 resize-none transition-all shadow-2xs"
                  />
                  <span className="absolute right-3.5 bottom-2.5 text-[10px] text-gray-400 font-normal pointer-events-none">
                    {detailedDescription.length}/2000
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  Attachments
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => triggerFileInput('image')}
                    className="border border-gray-200/90 hover:border-gray-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50/80 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      <span>Add images</span>
                    </div>
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-500 group-hover:border-gray-400">
                      +
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerFileInput('video')}
                    className="border border-gray-200/90 hover:border-gray-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50/80 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      <span>Add videos</span>
                    </div>
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-500 group-hover:border-gray-400">
                      +
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerFileInput('file')}
                    className="border border-gray-200/90 hover:border-gray-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50/80 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                      <span className="truncate">Add files (PDF, PPT, etc.)</span>
                    </div>
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-500 group-hover:border-gray-400 flex-shrink-0 ml-1">
                      +
                    </span>
                  </button>
                </div>

                {attachments.length > 0 && (
                  <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative flex-shrink-0 group rounded-xl overflow-hidden border border-gray-200 shadow-2xs bg-gray-50"
                      >
                        {att.type === 'file' ? (
                          <div className="flex items-center gap-2.5 p-2 bg-[#FFF6EE] border border-[#FDE0C5] rounded-xl pr-8 min-w-[190px]">
                            <div className="w-8 h-8 rounded-lg bg-[#FFEDE0] text-[#E06414] flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 stroke-[2]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-bold text-gm-ink block truncate">
                                {att.fileName || 'MVP_Pitch_Deck.pptx'}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                {att.fileSize || '12 MB'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-14 relative bg-gray-100">
                            <img
                              src={att.url}
                              alt={att.alt || 'attachment'}
                              className="w-full h-full object-cover"
                            />
                            {att.type === 'video' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                                <Video className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-[10px] transition-transform active:scale-90 cursor-pointer shadow-xs"
                          title="Remove attachment"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. FOOTER ACTION BAR ──────────────────────────────── */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
          <Sparkles className="w-4 h-4 text-gm-accent flex-shrink-0" />
          <span>This will be added to your journey timeline.</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-gm-accent" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={handlePostAndSave}
            disabled={isSubmitting}
            className="bg-gm-accent hover:bg-gm-accent-deep text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 rotate-45 -translate-y-0.5" />
            <span>Post & Save</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* ── Sub-modal: Add New Update Type ─────────────────────── */}
      {isNewTypeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md"
            onClick={() => setIsNewTypeModalOpen(false)}
          />
          <form
            onSubmit={handleAddNewType}
            className="relative bg-white rounded-[28px] p-6 shadow-modal border border-gm-ink/5 max-w-sm w-full z-10 space-y-3 animate-slide-up"
          >
            <h3 className="text-sm font-bold text-gm-ink">
              Add new update type
            </h3>
            <p className="text-xs text-gray-500">
              Create a custom status type for your journey check-ins:
            </p>
            <input
              type="text"
              required
              autoFocus
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. Experiment, Metric sprint..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewTypeModalOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold"
              >
                Add type
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Sub-modal: Create New Journey ──────────────────────── */}
      {isNewJourneyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md"
            onClick={() => setIsNewJourneyModalOpen(false)}
          />
          <form
            onSubmit={handleAddNewJourney}
            className="relative bg-white rounded-[28px] p-6 shadow-modal border border-gm-ink/5 max-w-sm w-full z-10 space-y-3 animate-slide-up"
          >
            <h3 className="text-sm font-bold text-gm-ink">
              Create a new journey
            </h3>
            <p className="text-xs text-gray-500">
              Give your new startup, project, or habit journey a name:
            </p>
            <input
              type="text"
              required
              autoFocus
              value={newJourneyName}
              onChange={(e) => setNewJourneyName(e.target.value)}
              placeholder="e.g. AI Workflow Engine, First Angel Round..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewJourneyModalOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold"
              >
                Create journey
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
