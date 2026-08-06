import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User, ChevronLeft, ChevronRight, ExternalLink, WifiOff, Loader2 } from 'lucide-react'
import { useSchedule } from '@/hooks/useCollection'
import { useOfficialSchedule } from '@/hooks/useOfficialSchedule'
import { EmptyState, Badge } from '@/components/ui'
import { WEEKDAYS, todayWeekday, cn, formatDate } from '@/lib/utils'
import { mondayOf, officialTimetableUrl } from '@/services/officialSchedule'

const DAY_INDEX: Record<string, number> = { 'Понедельник': 0, 'Вторник': 1, 'Среда': 2, 'Четверг': 3, 'Пятница': 4, 'Суббота': 5, 'Воскресенье': 6 }

interface DisplayLesson {
  id: string
  timeStart: string
  timeEnd: string
  subject: string
  teacher: string
  room: string
  type: string
}

export function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); return d }, [weekStart])
  const { lessons, loading, failed } = useOfficialSchedule(weekStart, weekEnd)
  const { items: fallbackItems } = useSchedule()
  const [activeDay, setActiveDay] = useState(todayWeekday())

  const weekDates = useMemo(() => WEEKDAYS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  }), [weekStart])

  const usingOfficial = !loading && !failed

  const byDay = useMemo(() => {
    const map: Record<string, DisplayLesson[]> = {}
    for (const day of WEEKDAYS) map[day] = []

    if (usingOfficial) {
      for (const l of lessons) {
        const idx = weekDates.findIndex((d) => d.toISOString().slice(0, 10) === l.date)
        if (idx === -1 || idx > 5) continue // показываем Пн–Сб
        const day = WEEKDAYS[idx]
        map[day].push({ id: l.id, timeStart: l.timeStart, timeEnd: l.timeEnd, subject: l.subject, teacher: l.teacher, room: l.room, type: l.type })
      }
    } else {
      for (const item of fallbackItems) {
        map[item.day]?.push({ id: item.id, timeStart: item.timeStart, timeEnd: item.timeEnd, subject: item.subjectName, teacher: item.teacher, room: item.room, type: item.type })
      }
    }
    for (const day of WEEKDAYS) map[day].sort((a, b) => a.timeStart.localeCompare(b.timeStart))
    return map
  }, [usingOfficial, lessons, fallbackItems, weekDates])

  const today = todayWeekday()
  const activeDate = weekDates[DAY_INDEX[activeDay] ?? 0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow mb-2">25.Б09-ю · Юридический факультет</p>
          <h2 className="font-display text-3xl font-semibold">Расписание занятий</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })}
            className="btn-secondary !p-2" aria-label="Предыдущая неделя"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="font-mono text-sm w-36 text-center text-ink-soft dark:text-navy-soft">
            {formatDate(weekDates[0].toISOString())} – {formatDate(weekDates[5].toISOString())}
          </p>
          <button
            onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })}
            className="btn-secondary !p-2" aria-label="Следующая неделя"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Индикатор источника данных */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        {loading ? (
          <span className="flex items-center gap-1.5 text-ink-soft/60 dark:text-navy-soft/60">
            <Loader2 size={13} className="animate-spin" /> Загружаем расписание с сайта СПбГУ…
          </span>
        ) : usingOfficial ? (
          <Badge tone="brass">Официальное расписание СПбГУ</Badge>
        ) : (
          <span className="flex items-center gap-1.5 text-seal dark:text-brass-light">
            <WifiOff size={13} /> Сайт СПбГУ недоступен — показано резервное расписание (редактируется в админ-панели)
          </span>
        )}
        <a
          href={officialTimetableUrl(weekStart)}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-ink-soft/60 dark:text-navy-soft/60 hover:text-seal dark:hover:text-brass-light"
        >
          Открыть на timetable.spbu.ru <ExternalLink size={12} />
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {WEEKDAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-md text-sm font-medium border transition-colors',
              activeDay === day
                ? 'bg-seal text-parchment-soft border-seal'
                : 'border-parchment-line dark:border-navy-line text-ink-soft dark:text-navy-soft hover:bg-parchment-line/40 dark:hover:bg-navy-line/40',
            )}
          >
            {day.slice(0, 2)} <span className="font-mono opacity-70">{weekDates[i].getDate()}</span>
            {day === today && weekDates[i].toDateString() === new Date().toDateString() && <span className="opacity-70"> · сегодня</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center gap-6 animate-pulse">
              <div className="h-4 w-24 bg-parchment-line dark:bg-navy-line rounded" />
              <div className="h-4 flex-1 bg-parchment-line dark:bg-navy-line rounded" />
            </div>
          ))}
        </div>
      ) : byDay[activeDay].length === 0 ? (
        <EmptyState title={`${activeDay}, ${activeDate.getDate()} — пар нет`} hint="Хороший день для того, чтобы разобраться с заданиями." />
      ) : (
        <motion.div layout className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {byDay[activeDay].map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4"
            >
              <div className="font-mono text-sm text-seal dark:text-brass-light w-28 shrink-0">
                {item.timeStart} – {item.timeEnd}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium">{item.subject}</p>
                {item.teacher && (
                  <p className="text-xs text-ink-soft/70 dark:text-navy-soft/70 flex items-center gap-1 mt-0.5">
                    <User size={11} /> {item.teacher}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge>{item.type}</Badge>
                {item.room && (
                  <span className="flex items-center gap-1 text-xs text-ink-soft/60 dark:text-navy-soft/60 font-mono">
                    <MapPin size={12} /> {item.room}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
