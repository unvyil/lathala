import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2Icon, SendIcon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button, DepartmentBadge, RolePill } from '../ui/Primitives'
import { useStudio } from '../../contexts/StudioContext'

export function DispatchModal({
  open,
  onClose,
  segmentId,
  title,
}: {
  open: boolean
  onClose: () => void
  segmentId: string
  title: string
}) {
  const { subscribers, departments, markSent } = useStudio()
  const [phase, setPhase] = useState<'review' | 'sending' | 'done'>('review')
  const [progress, setProgress] = useState(0)

  const recipients = useMemo(
    () =>
      subscribers.filter(
        (s) =>
          s.status === 'pending' &&
          (segmentId === 'all' || s.departmentId === segmentId),
      ),
    [subscribers, segmentId],
  )

  const [sentCount, setSentCount] = useState(0)

  useEffect(() => {
    if (!open) {
      setPhase('review')
      setProgress(0)
      setSentCount(0)
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'sending') return
    const ids = recipients.map((r) => r.id)
    const total = Math.max(ids.length, 1)
    let delivered = 0
    const timer = window.setInterval(() => {
      delivered += 1
      setProgress(Math.min(100, Math.round((delivered / total) * 100)))
      if (delivered >= total) {
        window.clearInterval(timer)
        markSent(ids)
        window.setTimeout(() => setPhase('done'), 260)
      }
    }, 420)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const segmentName =
    segmentId === 'all'
      ? 'Everyone'
      : departments.find((d) => d.id === segmentId)?.name ?? 'Unassigned'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send dispatch"
      description={`${title} \u2192 ${segmentName}`}
      footer={
        phase === 'review' ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={recipients.length === 0}
              onClick={() => {
                setSentCount(recipients.length)
                setPhase('sending')
              }}
            >
              <SendIcon size={14} strokeWidth={1.5} />
              Send to {recipients.length}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={onClose}
            disabled={phase === 'sending'}
          >
            Done
          </Button>
        )
      }
    >
      {phase === 'review' && (
        <>
          <p className="mb-4 text-[12px] text-espresso/70">
            {recipients.length === 0
              ? 'Everyone in this segment has already received a dispatch.'
              : `${recipients.length} pending ${
                  recipients.length === 1 ? 'recipient' : 'recipients'
                } in ${segmentName}. Sent records are skipped.`}
          </p>
          <ul className="divide-y divide-sandbar rounded-xl border border-sandbar">
            {recipients.map((r) => {
              const dept = departments.find((d) => d.id === r.departmentId)
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-onyx">
                    {r.name}
                    <span className="ml-2 font-normal text-espresso/60">
                      {r.email}
                    </span>
                  </span>
                  <RolePill role={r.role} />
                  {dept && (
                    <DepartmentBadge name={dept.name} color={dept.color} />
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {phase === 'sending' && (
        <div className="py-6">
          <p className="mb-3 text-[13px] font-medium text-onyx">
            Delivering to {sentCount} recipients\u2026
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sandbar">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-espresso/60">{progress}%</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2Icon
            size={28}
            strokeWidth={1.5}
            className="text-[#2F6F5E]"
          />
          <p className="text-[14px] font-semibold text-onyx">
            Dispatch sent to {sentCount} subscribers
          </p>
          <p className="max-w-sm text-[12px] text-espresso/65">
            Their status is now \u201cSent\u201d in the workspace audience directory.
          </p>
        </div>
      )}
    </Modal>
  )
}
