import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
          <div
            className="absolute inset-0 bg-onyx/45"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${width} overflow-hidden rounded-2xl bg-base shadow-artboard`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <header className="flex items-start justify-between gap-6 bg-onyx px-6 py-5">
              <div>
                <h2 className="text-[15px] font-semibold text-parchment">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-[12px] leading-relaxed text-parchment/60">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-parchment/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-parchment"
              >
                <XIcon size={16} strokeWidth={1.5} />
              </button>
            </header>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 lathala-scroll">
              {children}
            </div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-sandbar px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
