export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 КБ'
  const units = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(iso)}, ${hh}:${mm}`
}

export function daysUntil(iso: string): number {
  const now = new Date()
  const target = new Date(iso)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / msPerDay)
}

export function deadlineLabel(iso: string): { label: string; urgent: boolean; overdue: boolean } {
  const d = daysUntil(iso)
  if (d < 0) return { label: `Просрочено на ${Math.abs(d)} дн.`, urgent: true, overdue: true }
  if (d === 0) return { label: 'Сегодня', urgent: true, overdue: false }
  if (d === 1) return { label: 'Завтра', urgent: true, overdue: false }
  if (d <= 3) return { label: `Через ${d} дн.`, urgent: true, overdue: false }
  return { label: `Через ${d} дн.`, urgent: false, overdue: false }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export const WEEKDAYS: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

export function todayWeekday(): string {
  const idx = new Date().getDay() // 0 = Sunday
  const map = [null, 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  return map[idx] ?? 'Понедельник'
}
