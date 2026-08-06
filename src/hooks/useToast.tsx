import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import type { ToastMessage } from '@/types'
import { uid } from '@/lib/utils'

interface ToastContextValue {
  notify: (text: string, type?: ToastMessage['type']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = uid()
    setToasts((t) => [...t, { id, text, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  function dismiss(id: string) {
    setToasts((t) => t.filter((x) => x.id !== id))
  }

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card flex items-start gap-2.5 px-4 py-3 text-sm"
              >
                <Icon
                  size={18}
                  className={cnColor(t.type)}
                />
                <span className="flex-1 text-ink dark:text-parchment-soft">{t.text}</span>
                <button onClick={() => dismiss(t.id)} aria-label="Закрыть" className="text-ink-soft/50 hover:text-ink-soft">
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function cnColor(type: ToastMessage['type']) {
  if (type === 'success') return 'text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5'
  if (type === 'error') return 'text-seal shrink-0 mt-0.5'
  return 'text-brass shrink-0 mt-0.5'
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast должен использоваться внутри ToastProvider')
  return ctx
}
