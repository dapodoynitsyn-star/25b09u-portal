import type { ElementType } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, FolderOpen, Megaphone, ArrowRight, Clock, MapPin } from 'lucide-react'
import { useAnnouncements, useCalendarEvents, useHomework, useMaterials, useSchedule } from '@/hooks/useCollection'
import { Loader, EmptyState, Badge } from '@/components/ui'
import { deadlineLabel, formatDate, todayWeekday } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
}

export function HomePage() {
  const { items: schedule, loading: scheduleLoading } = useSchedule()
  const { items: homework, loading: hwLoading } = useHomework()
  const { items: materials, loading: matLoading } = useMaterials()
  const { items: events, loading: eventsLoading } = useCalendarEvents()
  const { items: announcements, loading: annLoading } = useAnnouncements()

  const today = todayWeekday()
  const todaysClasses = schedule.filter((s) => s.day === today).sort((a, b) => a.timeStart.localeCompare(b.timeStart))
  const upcomingHomework = [...homework].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4)
  const recentMaterials = [...materials].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 4)
  const upcomingEvents = [...events]
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
  const recentAnnouncements = [...announcements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="space-y-10">
      {/* Приветствие */}
      <motion.section initial="hidden" animate="show" custom={0} variants={fadeUp}>
        <p className="eyebrow mb-2">{formatDate(new Date().toISOString())} · {today}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold">{greeting}! Вот что сегодня по плану.</h2>
        <p className="mt-2 text-ink-soft dark:text-navy-soft max-w-2xl">
          Единое место группы: расписание, задания, материалы курсов, календарь сессии и объявления старосты.
        </p>
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ближайшие занятия */}
        <motion.section custom={1} initial="hidden" animate="show" variants={fadeUp} className="lg:col-span-2 card p-5">
          <SectionHeader icon={CalendarDays} title="Занятия сегодня" to="/schedule" />
          {scheduleLoading ? <Loader /> : todaysClasses.length === 0 ? (
            <EmptyState title="Сегодня пар нет" hint="Можно выдохнуть — или наверстать задания." />
          ) : (
            <ul className="divide-y divide-parchment-line dark:divide-navy-line">
              {todaysClasses.map((c) => (
                <li key={c.id} className="flex items-center gap-4 py-3">
                  <div className="font-mono text-sm text-seal dark:text-brass-light w-24 shrink-0">
                    {c.timeStart}–{c.timeEnd}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.subjectName}</p>
                    <p className="text-xs text-ink-soft/70 dark:text-navy-soft/70">{c.teacher}</p>
                  </div>
                  <Badge>{c.type}</Badge>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-ink-soft/60 dark:text-navy-soft/60 w-20 justify-end">
                    <MapPin size={12} /> {c.room}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Объявления */}
        <motion.section custom={2} initial="hidden" animate="show" variants={fadeUp} className="card p-5">
          <SectionHeader icon={Megaphone} title="Объявления" to="/announcements" />
          {annLoading ? <Loader /> : recentAnnouncements.length === 0 ? (
            <EmptyState title="Пока пусто" />
          ) : (
            <ul className="space-y-4">
              {recentAnnouncements.map((a) => (
                <li key={a.id}>
                  <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{formatDate(a.date)} · {a.author}</p>
                  <p className="font-medium text-sm mt-0.5">{a.title}</p>
                  <p className="text-sm text-ink-soft dark:text-navy-soft line-clamp-2 mt-0.5">{a.text}</p>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Домашние задания */}
        <motion.section custom={3} initial="hidden" animate="show" variants={fadeUp} className="card p-5">
          <SectionHeader icon={ClipboardList} title="Ближайшие дедлайны" to="/homework" />
          {hwLoading ? <Loader /> : upcomingHomework.length === 0 ? (
            <EmptyState title="Заданий нет" />
          ) : (
            <ul className="space-y-3">
              {upcomingHomework.map((h) => {
                const d = deadlineLabel(h.deadline)
                return (
                  <li key={h.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-seal dark:text-brass-light">{h.subjectName}</p>
                      <p className="text-sm font-medium truncate">{h.title}</p>
                    </div>
                    <Badge tone={d.urgent ? 'urgent' : 'default'}>{d.label}</Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </motion.section>

        {/* Материалы */}
        <motion.section custom={4} initial="hidden" animate="show" variants={fadeUp} className="card p-5">
          <SectionHeader icon={FolderOpen} title="Новые материалы" to="/materials" />
          {matLoading ? <Loader /> : recentMaterials.length === 0 ? (
            <EmptyState title="Материалов пока нет" />
          ) : (
            <ul className="space-y-3">
              {recentMaterials.map((m) => (
                <li key={m.id} className="min-w-0">
                  <p className="text-xs text-seal dark:text-brass-light">{m.subjectName}</p>
                  <p className="text-sm font-medium truncate">{m.fileName}</p>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Календарь */}
        <motion.section custom={5} initial="hidden" animate="show" variants={fadeUp} className="card p-5">
          <SectionHeader icon={CalendarDays} title="Ближайшие события" to="/calendar" />
          {eventsLoading ? <Loader /> : upcomingEvents.length === 0 ? (
            <EmptyState title="Событий не запланировано" />
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-md bg-parchment-line/50 dark:bg-navy-line/40 shrink-0 font-mono">
                    <span className="text-[10px] uppercase text-ink-soft/60 dark:text-navy-soft/60 -mb-0.5">
                      {new Date(e.date).toLocaleDateString('ru-RU', { month: 'short' })}
                    </span>
                    <span className="text-sm font-semibold">{new Date(e.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60 flex items-center gap-1">
                      {e.time && <><Clock size={11} /> {e.time} · </>}{e.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, to }: { icon: ElementType; title: string; to: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="flex items-center gap-2 font-display text-base font-semibold">
        <Icon size={17} className="text-seal dark:text-brass-light" /> {title}
      </h3>
      <Link to={to} className="text-xs text-ink-soft/60 dark:text-navy-soft/60 hover:text-seal dark:hover:text-brass-light flex items-center gap-0.5">
        Все <ArrowRight size={12} />
      </Link>
    </div>
  )
}
