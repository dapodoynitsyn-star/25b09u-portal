import { motion } from 'framer-motion'
import { Megaphone, Paperclip } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useCollection'
import { Loader, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export function AnnouncementsPage() {
  const { items, loading } = useAnnouncements()
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="eyebrow mb-2">От старосты и деканата</p>
        <h2 className="font-display text-3xl font-semibold">Объявления</h2>
      </div>

      {loading ? <Loader /> : sorted.length === 0 ? (
        <EmptyState title="Объявлений пока нет" />
      ) : (
        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-parchment-line dark:before:bg-navy-line">
          {sorted.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative"
            >
              <span className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-seal/10 dark:bg-brass/15 flex items-center justify-center">
                <Megaphone size={12} className="text-seal dark:text-brass-light" />
              </span>
              <div className="card p-5">
                <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{formatDateTime(a.date)} · {a.author}</p>
                <h3 className="font-display font-semibold text-lg mt-1">{a.title}</h3>
                <p className="text-sm text-ink-soft dark:text-navy-soft mt-1.5 whitespace-pre-line">{a.text}</p>
                {a.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-parchment-line dark:border-navy-line">
                    {a.attachments.map((att) => (
                      <a key={att.name} href={att.url} className="flex items-center gap-1 text-xs text-seal dark:text-brass-light hover:underline">
                        <Paperclip size={12} /> {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
