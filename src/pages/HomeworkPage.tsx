import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Paperclip, Link2, Pin, ArrowDownUp } from 'lucide-react'
import { useHomework, useSubjects } from '@/hooks/useCollection'
import { Loader, EmptyState, Badge, SearchInput } from '@/components/ui'
import { deadlineLabel, formatDate, cn } from '@/lib/utils'

type SortKey = 'deadline' | 'subject' | 'date'

export function HomeworkPage() {
  const { items, loading } = useHomework()
  const { items: subjects } = useSubjects()
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('deadline')

  const filtered = useMemo(() => {
    let list = items.filter((h) =>
      (subjectFilter === 'all' || h.subjectId === subjectFilter) &&
      (h.title.toLowerCase().includes(query.toLowerCase()) || h.subjectName.toLowerCase().includes(query.toLowerCase())),
    )
    list = [...list].sort((a, b) => {
      if (sortKey === 'deadline') return a.deadline.localeCompare(b.deadline)
      if (sortKey === 'date') return b.publishedAt.localeCompare(a.publishedAt)
      return a.subjectName.localeCompare(b.subjectName, 'ru')
    })
    list.sort((a, b) => Number(b.pinned) - Number(a.pinned))
    return list
  }, [items, query, subjectFilter, sortKey])

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Учебный процесс</p>
        <h2 className="font-display text-3xl font-semibold">Домашние задания</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={query} onChange={setQuery} placeholder="Поиск по заданиям…" /></div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">Все предметы</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowDownUp size={14} className="text-ink-soft/50 dark:text-navy-soft/50" />
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="input !w-auto">
            <option value="deadline">По дедлайну</option>
            <option value="date">По дате публикации</option>
            <option value="subject">По предмету</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="Ничего не найдено" hint="Попробуйте изменить фильтр или поисковый запрос." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((h, i) => {
            const d = deadlineLabel(h.deadline)
            return (
              <motion.article
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn('card p-5 flex flex-col gap-3', d.overdue && 'opacity-70')}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="eyebrow">{h.subjectName}</p>
                  {h.pinned && <Pin size={14} className="text-brass shrink-0" />}
                </div>
                <h3 className="font-display font-semibold leading-snug">{h.title}</h3>
                <p className="text-sm text-ink-soft dark:text-navy-soft line-clamp-3">{h.description}</p>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge tone={d.urgent ? 'urgent' : 'default'}>{d.label}</Badge>
                  <span className="text-xs text-ink-soft/50 dark:text-navy-soft/50">опубл. {formatDate(h.publishedAt)}</span>
                </div>

                {(h.attachments.length > 0 || h.links.length > 0) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-parchment-line dark:border-navy-line">
                    {h.attachments.map((a) => (
                      <a key={a.name} href={a.url} className="flex items-center gap-1 text-xs text-seal dark:text-brass-light hover:underline">
                        <Paperclip size={12} /> {a.name}
                      </a>
                    ))}
                    {h.links.map((l) => (
                      <a key={l} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-seal dark:text-brass-light hover:underline">
                        <Link2 size={12} /> Ссылка
                      </a>
                    ))}
                  </div>
                )}
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
