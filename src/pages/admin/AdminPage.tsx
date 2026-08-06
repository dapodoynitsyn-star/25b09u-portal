import { useState } from 'react'
import { CalendarDays, ClipboardList, FolderOpen, Megaphone, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { AdminSchedule } from './AdminSchedule'
import { AdminHomework } from './AdminHomework'
import { AdminMaterials } from './AdminMaterials'
import { AdminAnnouncements } from './AdminAnnouncements'
import { AdminCalendar } from './AdminCalendar'

const TABS = [
  { key: 'homework', label: 'Задания', icon: ClipboardList },
  { key: 'materials', label: 'Материалы', icon: FolderOpen },
  { key: 'announcements', label: 'Объявления', icon: Megaphone },
  { key: 'schedule', label: 'Расписание', icon: CalendarDays },
  { key: 'calendar', label: 'Календарь', icon: CalendarDays },
] as const

type TabKey = typeof TABS[number]['key']

export function AdminPage() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>('homework')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5"><ShieldCheck size={13} /> Панель старосты</p>
          <h2 className="font-display text-3xl font-semibold">Здравствуйте, {user?.displayName ?? 'Староста'}</h2>
        </div>
        <button onClick={() => signOut()} className="btn-secondary text-sm"><LogOut size={15} /> Выйти</button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition-colors',
              tab === key
                ? 'bg-seal text-parchment-soft border-seal'
                : 'border-parchment-line dark:border-navy-line text-ink-soft dark:text-navy-soft hover:bg-parchment-line/40 dark:hover:bg-navy-line/40',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'homework' && <AdminHomework />}
      {tab === 'materials' && <AdminMaterials />}
      {tab === 'announcements' && <AdminAnnouncements />}
      {tab === 'schedule' && <AdminSchedule />}
      {tab === 'calendar' && <AdminCalendar />}
    </div>
  )
}
