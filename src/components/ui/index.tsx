import React from 'react'
import { Loader2, Inbox, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Loader({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-soft/60 dark:text-navy-soft/60">
      <Loader2 className="animate-spin" size={22} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center border border-dashed border-parchment-line dark:border-navy-line rounded-lg">
      <Inbox size={28} className="text-ink-soft/40 dark:text-navy-soft/40" />
      <p className="font-display text-base text-ink-soft dark:text-navy-soft">{title}</p>
      {hint && <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60 max-w-xs">{hint}</p>}
    </div>
  )
}

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'urgent' | 'brass' }) {
  const tones: Record<string, string> = {
    default: 'bg-parchment-line/60 text-ink-soft dark:bg-navy-line/60 dark:text-navy-soft',
    urgent: 'bg-seal/10 text-seal dark:bg-seal/20 dark:text-seal-light',
    brass: 'bg-brass/15 text-brass dark:bg-brass/20 dark:text-brass-light',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Поиск…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/40 dark:text-navy-soft/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink-soft"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 animate-[fade-up_0.18s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Закрыть" className="text-ink-soft/50 hover:text-ink-soft">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
