import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Loader2 } from 'lucide-react'
import { useCalendarEvents } from '@/hooks/useCollection'
import { useOfficialSchedule } from '@/hooks/useOfficialSchedule'
import { Loader, Modal, Badge, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const TYPE_TONE: Record<CalendarEvent['type'], 'default' | 'urgent' | 'brass'> = {
  'Семинар': 'default', 'Лекция': 'default',
  'Дедлайн': 'urgent', 'Контрольная': 'urgent', 'Зачёт': 'brass', 'Экзамен': 'urgent', 'Другое': 'default',
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Единая карточка для дня: и «настоящее» событие календаря (дедлайн, зачёт…),
// и занятие из официального расписания СПбГУ — приведены к одному виду.
interface DayItem {
  id: string
  kind: 'event' | 'lesson'
  title: string
  type: CalendarEvent['type'] | string
  time?: string
  subtitle?: string
  room?: string
  description?: string
}

export function CalendarPage() {
  const { items, loading } = useCalendarEvents()
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selected, setSelected] = useState<string | null>(null)

  const grid = useMemo(() => {
    const year = cursor.getFullYear(), month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // понедельник = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [cursor])

  const gridStart = grid.find((d) => d) ?? cursor
  const gridEnd = useMemo(() => {
    const last = [...grid].reverse().find((d) => d) ?? cursor
    const d = new Date(last)
    d.setDate(d.getDate() + 1)
    return d
  }, [grid, cursor])

  const { lessons, loading: lessonsLoading, failed: lessonsFailed } = useOfficialSchedule(gridStart as Date, gridEnd)

  const itemsByDate = useMemo(() => {
    const map: Record<string, DayItem[]> = {}
    for (const e of items) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push({ id: e.id, kind: 'event', title: e.title, type: e.type, time: e.time, subtitle: e.subjectName, description: e.description })
    }
    if (!lessonsFailed) {
      for (const l of lessons) {
        if (!map[l.date]) map[l.date] = []
        map[l.date].push({ id: l.id, kind: 'lesson', title: l.subject, type: l.type, time: l.timeStart, subtitle: l.teacher, room: l.room })
      }
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
    }
    return map
  }, [items, lessons, lessonsFailed])

  const todayKey = toKey(new Date())
  const selectedItems = selected ? itemsByDate[selected] ?? [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow mb-2">Сессия, занятия и учебные события</p>
          <h2 className="font-display text-3xl font-semibold">Календарь</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} className="btn-secondary !p-2"><ChevronLeft size={16} /></button>
          <p className="font-display font-medium w-40 text-center">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</p>
          <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} className="btn-secondary !p-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {lessonsLoading ? (
          <span className="flex items-center gap-1.5 text-ink-soft/60 dark:text-navy-soft/60">
            <Loader2 size={13} className="animate-spin" /> Подгружаем занятия с сайта СПбГУ…
          </span>
        ) : !lessonsFailed ? (
          <Badge tone="brass">Занятия — с официального расписания СПбГУ</Badge>
        ) : (
          <span className="text-ink-soft/50 dark:text-navy-soft/50">Показаны только события из раздела «Календарь» — занятия СПбГУ сейчас недоступны</span>
        )}
      </div>

      {loading ? <Loader /> : (
        <div className="card p-3 sm:p-5">
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="text-center text-xs font-medium text-ink-soft/50 dark:text-navy-soft/50 py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((date, i) => {
              if (!date) return <div key={i} />
              const key = toKey(date)
              const dayItems = itemsByDate[key] ?? []
              const isToday = key === todayKey
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => dayItems.length && setSelected(key)}
                  className={cn(
                    'aspect-square rounded-md p-1.5 flex flex-col items-start gap-0.5 text-left border transition-colors',
                    isToday ? 'border-seal dark:border-brass-light' : 'border-transparent',
                    dayItems.length ? 'hover:bg-parchment-line/50 dark:hover:bg-navy-line/40 cursor-pointer' : 'cursor-default',
                  )}
                >
                  <span className={cn('text-xs font-mono', isToday && 'text-seal dark:text-brass-light font-bold')}>{date.getDate()}</span>
                  <div className="flex flex-wrap gap-0.5">
                    {dayItems.slice(0, 4).map((it) => (
                      <span
                        key={it.id}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          it.kind === 'lesson'
                            ? 'bg-brass'
                            : (it.type === 'Дедлайн' || it.type === 'Экзамен' || it.type === 'Контрольная') ? 'bg-seal' : 'bg-ink-soft/40 dark:bg-navy-soft/40',
                        )}
                      />
                    ))}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? new Date(selected).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}>
        {selectedItems.length === 0 ? <EmptyState title="Событий нет" /> : (
          <ul className="space-y-3">
            {selectedItems.map((it) => (
              <li key={it.id} className="flex items-start gap-3">
                <Badge tone={it.kind === 'lesson' ? 'brass' : TYPE_TONE[it.type as CalendarEvent['type']] ?? 'default'}>{it.type}</Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{it.title}</p>
                  {it.subtitle && (
                    <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60 flex items-center gap-1">
                      {it.kind === 'lesson' && <User size={11} />} {it.subtitle}
                    </p>
                  )}
                  {(it.time || it.room) && (
                    <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60 flex items-center gap-3 mt-0.5">
                      {it.time && <span className="flex items-center gap-1"><Clock size={11} /> {it.time}</span>}
                      {it.room && <span className="flex items-center gap-1"><MapPin size={11} /> {it.room}</span>}
                    </p>
                  )}
                  {it.description && <p className="text-sm text-ink-soft dark:text-navy-soft mt-1">{it.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
