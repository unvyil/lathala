import React, { useState, useEffect, useMemo } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { interpolateMergeTags } from '../../services/exportHtml';
import {
  SendIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  UsersIcon,
  ClockIcon,
  XIcon,
  MailCheckIcon,
} from 'lucide-react';

interface DispatchModalProps {
  open: boolean;
  onClose: () => void;
}

export function DispatchModal({ open, onClose }: DispatchModalProps) {
  const {
    activeProject,
    subscribers,
    departments,
    markSent,
    integrations,
    addToast,
  } = useStudio();

  const [phase, setPhase] = useState<'review' | 'sending' | 'complete'>('review');
  const [progress, setProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const segmentId = activeProject?.segmentId || 'all';

  // Eligible pending recipients for this target segment
  const recipients = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesDept = segmentId === 'all' || s.departmentId === segmentId;
      return matchesDept && s.status === 'pending';
    });
  }, [subscribers, segmentId]);

  useEffect(() => {
    if (!open) {
      setPhase('review');
      setProgress(0);
      setSentCount(0);
    }
  }, [open]);

  if (!open || !activeProject) return null;

  const targetDept = departments.find((d) => d.id === segmentId);
  const segmentLabel = targetDept ? targetDept.name : 'All Workspace Subscribers';

  const handleStartDispatch = () => {
    if (recipients.length === 0) return;
    setPhase('sending');
    setProgress(10);

    const ids = recipients.map((r) => r.id);
    const total = ids.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      const pct = Math.min(100, Math.round((current / total) * 100));
      setProgress(pct);

      if (current >= total) {
        clearInterval(interval);
        markSent(ids);
        setSentCount(total);
        setTimeout(() => {
          setPhase('complete');
          addToast(`Dispatched ${total} emails successfully!`, 'success');
        }, 300);
      }
    }, Math.max(120, 1600 / total));
  };

  return (
    <div className="fixed inset-0 bg-onyx/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-lg shadow-artboard overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-onyx text-parchment px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SendIcon size={16} className="text-accent" />
            <h3 className="font-serif text-base font-semibold">Dispatch Newsletter</h3>
          </div>
          <button
            onClick={onClose}
            className="text-parchment/60 hover:text-parchment transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {phase === 'review' && (
            <div className="space-y-4">
              <div className="bg-white border border-sandbar rounded-xl p-4">
                <div className="text-[11px] font-mono uppercase tracking-widest text-espresso/50 mb-1">
                  Target Campaign
                </div>
                <div className="font-serif text-base font-bold text-onyx">
                  {activeProject.title}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-espresso/70">
                  <span className="font-medium text-onyx">Segment:</span>
                  <span className="px-2 py-0.5 rounded-full bg-sandbar/40 font-semibold text-[11px]">
                    {segmentLabel}
                  </span>
                </div>
              </div>

              {recipients.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-espresso/70 mb-2">
                    <span className="font-medium text-onyx">
                      {recipients.length} Pending Recipient{recipients.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Already sent will be skipped
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto lathala-scroll border border-sandbar rounded-xl divide-y divide-sandbar/60 bg-white">
                    {recipients.map((sub) => {
                      const dept = departments.find((d) => d.id === sub.departmentId);
                      return (
                        <div
                          key={sub.id}
                          className="px-3.5 py-2 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-medium text-onyx">{sub.name}</div>
                            <div className="text-[11px] text-espresso/60">{sub.email}</div>
                          </div>
                          {dept && (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${dept.color}1F`, color: dept.color }}
                            >
                              {dept.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-sandbar/20 rounded-xl border border-sandbar/50">
                  <CheckCircle2Icon size={28} className="mx-auto text-emerald-700 mb-2" />
                  <p className="text-sm font-semibold text-onyx">All caught up!</p>
                  <p className="text-xs text-espresso/70 mt-1 max-w-xs mx-auto">
                    All subscribers in the "{segmentLabel}" segment have already received this edition.
                  </p>
                </div>
              )}
            </div>
          )}

          {phase === 'sending' && (
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto animate-pulse">
                <SendIcon size={22} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-onyx">Dispatched in Progress</h4>
                <p className="text-xs text-espresso/60 mt-1">
                  Generating email payloads with custom merge tags & dispatching...
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-sandbar/50 rounded-full h-3 overflow-hidden border border-sandbar">
                <div
                  className="bg-accent h-full transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-espresso/60">{progress}% complete</span>
            </div>
          )}

          {phase === 'complete' && (
            <div className="py-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto">
                <MailCheckIcon size={28} />
              </div>
              <h4 className="font-serif text-xl font-bold text-onyx">Dispatch Delivered!</h4>
              <p className="text-xs text-espresso/70 max-w-sm mx-auto leading-relaxed">
                Successfully dispatched to <strong>{sentCount} subscribers</strong>. Their CRM audience status has been updated to <strong>Sent</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sandbar/20 px-6 py-3.5 border-t border-sandbar flex items-center justify-end gap-2">
          {phase === 'review' && (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-sandbar bg-white text-xs font-medium text-espresso hover:bg-sandbar/40"
              >
                Cancel
              </button>
              <button
                onClick={handleStartDispatch}
                disabled={recipients.length === 0}
                className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <SendIcon size={13} />
                <span>Dispatch to {recipients.length} Recipients</span>
              </button>
            </>
          )}

          {phase === 'complete' && (
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-lg bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
