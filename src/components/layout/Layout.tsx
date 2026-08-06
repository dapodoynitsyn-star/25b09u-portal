import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, CalendarDays, ClipboardList, FolderOpen, Megaphone, ShieldCheck,
  Sun, Moon, ChevronUp, ChevronRight, LogOut, MoreHorizontal, X,
} from 'lucide-react'
import { Seal } from '@/components/ui/Seal'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// Основные разделы — видны в верхней навигации на ПК и в нижней панели на телефоне.
const PRIMARY_NAV = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/schedule', label: 'Расписание', icon: CalendarDays, end: false },
  { to: '/homework', label: 'Задания', icon: ClipboardList, end: false },
  { to: '/materials', label: 'Материалы', icon: FolderOpen, end: false },
]

// Второстепенные разделы — в верхнем меню на ПК, в шторке «Ещё» на телефоне.
const SECONDARY_NAV = [
  { to: '/calendar', label: 'Календарь', icon: CalendarDays, end: false },
  { to: '/announcements', label: 'Объявления', icon: Megaphone, end: false },
]

const LABELS: Record<string, string> = {
  '': 'Главная',
  schedule: 'Расписание',
  homework: 'Задания',
  materials: 'Материалы',
  calendar: 'Календарь',
  announcements: 'Объявления',
  admin: 'Админ-панель',
  login: 'Вход',
}

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => setMoreOpen(false), [location.pathname])

  useEffect(() => {
    function onScroll() { setShowTop(window.scrollY > 480) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const crumbs = location.pathname.split('/').filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Масштадный заголовок в духе газеты/официального бланка */}
      <header className="sticky top-0 z-40 bg-parchment-soft/90 dark:bg-navy/90 backdrop-blur-md">
        <div className="rule-line">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <Seal size={34} className="sm:hidden" />
              <Seal size={38} className="hidden sm:flex" />
              <div className="leading-tight min-w-0">
                <p className="eyebrow whitespace-nowrap">
                  <span className="hidden sm:inline">Юридический факультет СПбГУ</span>
                  <span className="sm:hidden">Юрфак СПбГУ</span>
                </p>
                <h1 className="font-display text-base sm:text-xl font-semibold -mt-0.5 whitespace-nowrap">25.Б09-ю</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'text-seal dark:text-brass-light bg-seal/5 dark:bg-brass/10'
                        : 'text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40',
                    )
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                aria-label="Переключить тему"
                className="p-2 rounded-md text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40 transition-colors"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {user ? (
                <>
                  <Link to="/admin" className="hidden sm:inline-flex btn-secondary !py-1.5 !px-3 text-xs">
                    <ShieldCheck size={14} /> Админ-панель
                  </Link>
                  <button
                    onClick={() => signOut()}
                    aria-label="Выйти"
                    className="hidden md:inline-flex p-2 rounded-md text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="hidden sm:inline-flex btn-secondary !py-1.5 !px-3 text-xs">
                  <ShieldCheck size={14} /> Вход для старосты
                </Link>
              )}

              {/* «Ещё» — открывает нижнюю шторку с разделами, которых нет в нижней панели */}
              <button
                onClick={() => setMoreOpen(true)}
                aria-label="Ещё"
                className="md:hidden p-2 rounded-md text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Хлебные крошки */}
        {crumbs.length > 0 && (
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center gap-1 text-xs text-ink-soft/60 dark:text-navy-soft/60 overflow-x-auto">
            <Link to="/" className="hover:text-seal dark:hover:text-brass-light shrink-0">Главная</Link>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} className="shrink-0" />
                <span className={cn('shrink-0', i === crumbs.length - 1 ? 'text-ink dark:text-parchment-soft font-medium' : '')}>
                  {LABELS[c] ?? c}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* Контент — с отступом снизу на телефоне под нижнюю панель навигации */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      <footer className="hidden md:block rule-line mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-soft/60 dark:text-navy-soft/60">
          <p>25.Б09-ю · Юридический факультет СПбГУ</p>
          <p>Портал группы — сделан студентами и для студентов</p>
        </div>
      </footer>

      {/* Нижняя панель навигации — основной способ перемещения по сайту на телефоне */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-parchment-soft/95 dark:bg-navy/95 backdrop-blur-md border-t border-parchment-line dark:border-navy-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-medium',
                  isActive ? 'text-seal dark:text-brass-light' : 'text-ink-soft/70 dark:text-navy-soft/70',
                )
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-medium',
              moreOpen || SECONDARY_NAV.some((n) => location.pathname.startsWith(n.to)) || location.pathname.startsWith('/admin')
                ? 'text-seal dark:text-brass-light' : 'text-ink-soft/70 dark:text-navy-soft/70',
            )}
          >
            <MoreHorizontal size={19} />
            Ещё
          </button>
        </div>
      </nav>

      {/* Шторка «Ещё» — календарь, объявления, вход/админ-панель, тема */}
      <AnimatePresence>
        {moreOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="absolute inset-0 bg-ink/40 dark:bg-black/60"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-parchment-soft dark:bg-navy-surface rounded-t-2xl border-t border-parchment-line dark:border-navy-line pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <p className="font-display font-semibold">Ещё</p>
                <button onClick={() => setMoreOpen(false)} aria-label="Закрыть" className="text-ink-soft/50 hover:text-ink-soft">
                  <X size={18} />
                </button>
              </div>
              <div className="px-2 pb-2">
                {SECONDARY_NAV.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to} to={to}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40"
                  >
                    <Icon size={18} /> {label}
                  </Link>
                ))}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                </button>
                {user ? (
                  <>
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40">
                      <ShieldCheck size={18} /> Админ-панель
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-seal dark:text-brass-light hover:bg-seal/5 dark:hover:bg-brass/10"
                    >
                      <LogOut size={18} /> Выйти
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-soft dark:text-navy-soft hover:bg-parchment-line/50 dark:hover:bg-navy-line/40">
                    <ShieldCheck size={18} /> Вход для старосты
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Наверх"
            className="fixed bottom-20 md:bottom-5 left-4 sm:left-5 z-40 p-2.5 rounded-full bg-seal text-parchment-soft shadow-card hover:bg-seal-dark transition-colors"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
