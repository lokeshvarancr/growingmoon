'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/state/AppContext';
import { passportsApi, postsApi } from '@/lib/api/client';
import type { MediaAttachment } from '@/types';
import {
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  List,
  Image as ImageIcon,
  Video,
  Sparkles,
  Bookmark,
  Send,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export type PostEditData = {
  id: string;
  headline?: string;
  content: string;
  journeyTag?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  media?: MediaAttachment[];
};

type PostComposerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'text' | 'photo' | 'video' | 'milestone' | 'type' | 'journey';
  initialJourneyTitle?: string;
  editPost?: PostEditData | null;
  onPostUpdated?: (updated: PostEditData) => void;
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

export default function PostComposerModal({
  isOpen,
  onClose,
  initialType = 'text',
  initialJourneyTitle,
  editPost = null,
  onPostUpdated,
}: PostComposerModalProps) {
  const { addUpdate, addToast } = useApp();

  // Dropdown states with smart defaults
  const [updateTypes, setUpdateTypes] = useState<UpdateTypeOption[]>(INITIAL_UPDATE_TYPES);
  const [selectedUpdateType, setSelectedUpdateType] = useState<string>('Progress update');
  const [isUpdateTypeOpen, setIsUpdateTypeOpen] = useState(false);

  const [journeys, setJourneys] = useState<JourneyOption[]>(INITIAL_JOURNEYS);
  const [selectedJourney, setSelectedJourney] = useState<string>(
    initialJourneyTitle || 'Building my SaaS product'
  );
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const [heading, setHeading] = useState('');

  // Start Date and End Date for the update
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [isOngoing, setIsOngoing] = useState<boolean>(true);

  // "Add more details" is dropped up (collapsed) by default
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [detailedDescription, setDetailedDescription] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  // Direct video link state
  const [videoLink, setVideoLink] = useState('');
  const [videoLinkError, setVideoLinkError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for creating new type / journey
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [isNewJourneyModalOpen, setIsNewJourneyModalOpen] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');

  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialType or editPost when opened
  useEffect(() => {
    if (isOpen) {
      if (editPost) {
        setHeading(editPost.headline || '');
        setDetailedDescription(editPost.content || '');
        if (editPost.journeyTag) {
          setSelectedJourney(editPost.journeyTag);
        }
        if (editPost.category) {
          setSelectedUpdateType(editPost.category);
        }
        if (editPost.startDate) {
          setStartDate(editPost.startDate.includes('T') ? editPost.startDate.split('T')[0] : editPost.startDate);
        } else {
          setStartDate(new Date().toISOString().split('T')[0]);
        }
        if (editPost.endDate) {
          setEndDate(editPost.endDate.includes('T') ? editPost.endDate.split('T')[0] : editPost.endDate);
          setIsOngoing(false);
        } else {
          setEndDate('');
          setIsOngoing(true);
        }
        if (editPost.media && editPost.media.length > 0) {
          setAttachments(editPost.media);
        } else {
          setAttachments([]);
        }
        setIsDetailsExpanded(true);
      } else {
        setHeading('');
        setDetailedDescription('');
        setAttachments([]);
        setVideoLink('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setIsOngoing(true);
        if (initialJourneyTitle) {
          setSelectedJourney(initialJourneyTitle);
        }
      }

      passportsApi
        .getMyPassports()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((p, idx) => {
              const colors = ['bg-gm-accent', 'bg-[#10B981]', 'bg-[#06B6D4]', 'bg-[#F59E0B]'];
              return {
                id: p.id,
                label: p.title,
                dotColor: colors[idx % colors.length],
              };
            });
            setJourneys(mapped);
            if (!editPost && !initialJourneyTitle) {
              setSelectedJourney((prev) => (mapped.some((m) => m.label === prev) ? prev : mapped[0].label));
            }
          }
        })
        .catch(() => {});

      if (!editPost) {
        if (initialType === 'journey') {
          setIsJourneyOpen(true);
          setIsUpdateTypeOpen(false);
        } else if (initialType === 'type') {
          setIsUpdateTypeOpen(true);
          setIsJourneyOpen(false);
        } else if (initialType === 'milestone') {
          setSelectedUpdateType('Milestone achieved');
        } else if (initialType === 'photo') {
          setIsDetailsExpanded(true);
          setTimeout(() => triggerImagePicker(), 150);
        } else if (initialType === 'video') {
          setIsDetailsExpanded(true);
        }
      }
    }
  }, [isOpen, initialType, editPost, initialJourneyTitle]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Trigger file dialog: strictly image/* files
  const triggerImagePicker = () => {
    if (imageFileInputRef.current) {
      imageFileInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        addToast('Only image files are allowed.', 'warning');
        continue;
      }
      const objectUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newItems.push({
        id: Math.random().toString(36).slice(2),
        type: 'image',
        url: objectUrl,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        alt: file.name,
      });
    }

    setAttachments((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      addToast(`${newItems.length} image${newItems.length > 1 ? 's' : ''} added!`, 'info');
    }
    e.target.value = '';
  };

  // Video Link validation helper
  const handleVideoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVideoLink(val);
    setVideoLinkError(null);

    if (!val.trim()) return;

    const socialPattern = /(youtube\.com|youtu\.be|facebook\.com|fb\.watch|instagram\.com|discord\.(com|gg)|twitter\.com|x\.com|tiktok\.com|linkedin\.com)/i;
    if (socialPattern.test(val)) {
      setVideoLinkError(
        'Only Google Drive links are allowed for videos. Social media links (YouTube, Facebook, Instagram, Discord) are not permitted.'
      );
      return;
    }

    const googleDrivePattern = /^https?:\/\/(?:drive|docs)\.google\.com\//i;
    if (!googleDrivePattern.test(val.trim())) {
      setVideoLinkError('Please enter a valid Google Drive video link (e.g. https://drive.google.com/...)');
    }
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

  // Add new update type
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

  // Create new journey
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

  // Post & Save
  const handlePostAndSave = () => {
    if (!selectedUpdateType) {
      addToast('Please select the progress update type', 'warning');
      return;
    }
    if (!selectedJourney) {
      addToast('Please select the journey', 'warning');
      return;
    }
    const cleanHeading = heading.trim();
    if (!cleanHeading) {
      addToast('Please enter an update heading', 'warning');
      return;
    }

    // Validate video link if provided
    if (videoLink.trim()) {
      const socialPattern = /(youtube\.com|youtu\.be|facebook\.com|fb\.watch|instagram\.com|discord\.(com|gg)|twitter\.com|x\.com|tiktok\.com|linkedin\.com)/i;
      if (socialPattern.test(videoLink)) {
        addToast(
          'Social media links are not permitted. Only Google Drive links are allowed for videos.',
          'danger'
        );
        return;
      }
      const googleDrivePattern = /^https?:\/\/(?:drive|docs)\.google\.com\//i;
      if (!googleDrivePattern.test(videoLink.trim())) {
        addToast('Please enter a valid Google Drive video link.', 'warning');
        return;
      }
    }

    setIsSubmitting(true);

    const fullContent = detailedDescription.trim()
      ? `${cleanHeading}\n\n${detailedDescription.trim()}`
      : cleanHeading;

    // Prepare attachments: images + video link
    const finalAttachments = [...attachments];
    if (videoLink.trim()) {
      finalAttachments.push({
        id: 'drive-' + Date.now(),
        type: 'video',
        url: videoLink.trim(),
        fileName: 'Google Drive Video',
        fileSize: 'Drive Link',
        alt: 'Google Drive Video Attachment',
      });
    }

    if (editPost) {
      // ── Edit Mode Execution ─────────────────────────────────
      const isMock = editPost.id.startsWith('t-');
      const updatedPayload: PostEditData = {
        id: editPost.id,
        headline: cleanHeading,
        content: detailedDescription.trim() || cleanHeading,
        journeyTag: selectedJourney,
        category: selectedUpdateType,
        startDate: startDate || undefined,
        endDate: isOngoing ? undefined : (endDate || undefined),
        media: finalAttachments,
      };

      if (!isMock) {
        postsApi
          .updatePost(editPost.id, {
            headline: cleanHeading,
            content: detailedDescription.trim() || cleanHeading,
            journey_tag: selectedJourney,
            category: selectedUpdateType,
            start_date: startDate || undefined,
            end_date: isOngoing ? undefined : (endDate || undefined),
          })
          .then(() => {
            onPostUpdated?.(updatedPayload);
            addToast('Journey update saved successfully!', 'success');
            setIsSubmitting(false);
            onClose();
          })
          .catch((err) => {
            addToast(err?.message || 'Failed to update post.', 'danger');
            setIsSubmitting(false);
          });
      } else {
        onPostUpdated?.(updatedPayload);
        addToast('Journey update saved successfully!', 'success');
        setIsSubmitting(false);
        onClose();
      }
      return;
    }

    // ── Create Mode Execution ─────────────────────────────────
    setTimeout(() => {
      addUpdate({
        headline: cleanHeading,
        journeyTag: selectedJourney || 'Building my SaaS product',
        category: selectedUpdateType || 'Progress update',
        oneLineSummary: cleanHeading,
        content: fullContent,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: isOngoing ? undefined : (endDate || undefined),
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: isOngoing ? undefined : (endDate || undefined),
        media: finalAttachments,
      });

      setIsSubmitting(false);
      addToast('Journey update posted to your feed and timeline!', 'success');
      onClose();
    }, 300);
  };

  // Save as Draft
  const handleSaveDraft = () => {
    addToast('Journey update saved to your drafts!', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
      {/* ── Backdrop Overlay ────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* ── Modal Window ────────────────────────────────────────── */}
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-modal border border-gm-ink/5 flex flex-col max-h-[92vh] overflow-hidden z-10 animate-slide-up">
        
        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto scrollbar-thin">
          
          {/* ── 1. HEADER: Title, Subtitle & Close ─────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-[26px] sm:text-[22px] font-bold text-gm-ink tracking-tight">
                {editPost ? 'Edit journey update' : 'Share a journey update'}
              </h2>
              <p className="text-xs sm:text-[13px] text-gray-500 font-normal mt-0.5">
                {editPost
                  ? 'Update existing milestone details, media, and learnings'
                  : 'Document your next step'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer -mr-1 -mt-1"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-4.5">
            {/* ── 2. ROW 1: Update type & Select journey Dropdowns ───── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Left Column: Update type * */}
              <div className="relative">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Update type <span className="text-red-500">*</span>
                </label>
                
                {/* Trigger Box */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateTypeOpen(!isUpdateTypeOpen);
                    setIsJourneyOpen(false);
                  }}
                  className="w-full border border-gray-200/90 hover:border-gray-300 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between cursor-pointer bg-white transition-all shadow-2xs text-left"
                >
                  <span
                    className={`${
                      selectedUpdateType
                        ? 'bg-gm-accent-soft text-gm-accent'
                        : 'bg-gray-100 text-gray-500'
                    } text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 truncate max-w-[85%]`}
                  >
                    {selectedUpdateType || 'Select the progress update'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                      isUpdateTypeOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {isUpdateTypeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUpdateTypeOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-slide-up">
                      <div className="space-y-0.5 max-h-56 overflow-y-auto">
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

                      {/* + Add new update type */}
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

                {/* Trigger Box */}
                <button
                  type="button"
                  onClick={() => {
                    setIsJourneyOpen(!isJourneyOpen);
                    setIsUpdateTypeOpen(false);
                  }}
                  className="w-full border border-gray-200/90 hover:border-gray-300 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between cursor-pointer bg-white transition-all shadow-2xs text-left"
                >
                  <span
                    className={`${
                      selectedJourney
                        ? 'bg-gm-accent-soft text-gm-accent'
                        : 'bg-gray-100 text-gray-500'
                    } text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 truncate max-w-[85%]`}
                  >
                    {selectedJourney || 'Select the journey'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                      isJourneyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {isJourneyOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsJourneyOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-slide-up">
                      <div className="space-y-0.5 max-h-56 overflow-y-auto">
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

                      {/* + Create a new journey */}
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

            {/* ── 2B. Timeline Dates: Start Date & End Date ────────── */}
            <div className="bg-gm-paper rounded-2xl p-3 sm:p-3.5 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gm-accent" />
                  <span>Update Timeline (Dates)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={isOngoing}
                    onChange={(e) => {
                      setIsOngoing(e.target.checked);
                      if (e.target.checked) setEndDate('');
                    }}
                    className="w-3.5 h-3.5 rounded text-gm-accent focus:ring-gm-accent border-gray-300"
                  />
                  <span>Currently ongoing (To: Present)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Date */}
                <div>
                  <span className="text-[11px] font-medium text-gray-500 mb-1 block">
                    From Date <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-gm-accent focus:ring-1 focus:ring-gm-accent shadow-2xs font-medium"
                  />
                </div>

                {/* End Date */}
                <div>
                  <span className="text-[11px] font-medium text-gray-500 mb-1 block">
                    To Date {isOngoing ? '(Ongoing → Present)' : ''}
                  </span>
                  <input
                    type="date"
                    disabled={isOngoing}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-gm-accent focus:ring-1 focus:ring-gm-accent shadow-2xs font-medium ${
                      isOngoing ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* ── 3. ROW 2: Heading * ───────────────────────────────── */}
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
                  placeholder="e.g. Finally launched our first working prototype"
                  className="w-full px-4 py-3 pr-16 rounded-2xl border border-gray-200/90 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all shadow-2xs font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-normal pointer-events-none">
                  {heading.length}/100
                </span>
              </div>
            </div>

            {/* ── 4. ROW 3: Description ─────────────────────────────── */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Description
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Share a small description about what happened, what you learned, or what's next..."
                  className="w-full p-3.5 pb-6 rounded-2xl border border-gray-200/90 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 resize-none transition-all shadow-2xs"
                />
                <span className="absolute right-3.5 bottom-2.5 text-[10px] text-gray-400 font-normal pointer-events-none">
                  {detailedDescription.length}/1500
                </span>
              </div>
            </div>

            {/* ── 5. ROW 4: Collapsible "Add media attachments (optional)" ── */}
            {/* Dropped up (collapsed) by default, only drops down when clicking arrow */}
            <div className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-2xs transition-all">
              {/* Collapsible Header */}
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
                      Add media attachments (optional)
                    </span>
                    <span className="text-[11px] text-gray-500 font-normal mt-0.5 block">
                      Attach screenshots, images, or paste your Google Drive video link.
                    </span>
                  </div>
                </div>
                {isDetailsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {/* Collapsible Content - only displayed when expanded */}
              {isDetailsExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100 animate-fade-in">
                  {/* 1. Images attachment */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">
                        Images
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Attach screenshots, mockups, or photos
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={triggerImagePicker}
                      className="border border-gray-200/90 hover:border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50/80 transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gm-accent" />
                        <span>Add images</span>
                      </div>
                      <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-500 group-hover:border-gray-400">
                        +
                      </span>
                    </button>

                    {/* Attached Images Preview Row */}
                    {attachments.filter((a) => a.type === 'image').length > 0 && (
                      <div className="flex items-center gap-2.5 mt-2.5 overflow-x-auto pb-1 scrollbar-thin">
                        {attachments
                          .filter((a) => a.type === 'image')
                          .map((att) => (
                            <div
                              key={att.id}
                              className="relative flex-shrink-0 group rounded-xl overflow-hidden border border-gray-200 shadow-2xs bg-gray-50 w-20 h-14"
                            >
                              <img
                                src={att.url}
                                alt={att.alt || 'attachment'}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttachment(att.id)}
                                className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-[10px] transition-transform active:scale-90 cursor-pointer shadow-xs"
                                title="Remove image"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Direct Video Link input: "Please paste the video link if you have any" */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Video Link
                    </label>
                    <div className="relative">
                      <Video className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={videoLink}
                        onChange={handleVideoLinkChange}
                        placeholder="Please paste the video link if you have any"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all"
                      />
                    </div>
                    {videoLinkError ? (
                      <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1.5 leading-tight">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{videoLinkError}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Only Google Drive video links are supported. Social media links are not permitted.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 6. FOOTER ACTION BAR ──────────────────────────────── */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {/* Left Note */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
              <Sparkles className="w-4 h-4 text-gm-accent flex-shrink-0" />
              <span>This will be added to your journey timeline.</span>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* Save (Draft) Button */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-gm-accent" />
                <span>Save</span>
              </button>

              {/* Post & Save Button */}
              <button
                type="button"
                onClick={handlePostAndSave}
                disabled={isSubmitting}
                className="bg-gm-accent hover:bg-gm-accent-deep text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : editPost ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 rotate-45 -translate-y-0.5" />
                    <span>Post & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden File Input for STRICTLY images */}
      <input
        type="file"
        ref={imageFileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />

      {/* ── Sub-modal: Add New Update Type ─────────────────────── */}
      {isNewTypeModalOpen && (
        <div className="fixed inset-0 z-[60] !mt-0 flex items-center justify-center p-4">
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
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold cursor-pointer"
              >
                Add type
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Sub-modal: Create New Journey ──────────────────────── */}
      {isNewJourneyModalOpen && (
        <div className="fixed inset-0 z-[60] !mt-0 flex items-center justify-center p-4">
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
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold cursor-pointer"
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
