import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCalendarEvents } from '@/hooks/useCollection'
import { dataService } from '@/services/dataService'
import { useToast } from '@/hooks/useToast'
import { Modal, EmptyState, Loader, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

const TYPES: CalendarEvent['type'][] = ['Семинар', 'Лекция', 'Дедлайн', 'Контрольная', 'Зачёт', 'Экзамен', 'Другое']
const empty = { title: '', date: '', time: '', type: 'Другое' as CalendarEvent['type'], description: '' }

export function AdminCalendar() {
  const { items, loading } = useCalendarEvents()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.title || !form.date) {
      notify('Заполните название и дату', 'error')
      return
    }
    setSaving(true)
    try {
      await dataService.addToCollection('calendar', {
        title: form.title, date: form.date, time: form.time || undefined, type: form.type, description: form.description || undefined,
      })
      notify('Событие добавлено в календарь')
      setForm(empty); setOpen(false)
    } catch {
      notify('Не удалось сохранить событие', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить событие?')) return
    await dataService.removeFromCollection('calendar', id)
    notify('Событие удалено', 'info')
  }

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary text-sm"><Plus size={15} /> Добавить событие</button>
      </div>

      {loading ? <Loader /> : sorted.length === 0 ? <EmptyState title="Событий нет" /> : (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {sorted.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{formatDate(e.date)}{e.time ? `, ${e.time}` : ''}</p>
                <p className="text-sm font-medium">{e.title}</p>
              </div>
              <Badge>{e.type}</Badge>
              <button onClick={() => handleDelete(e.id)} className="btn-secondary !p-2 hover:!bg-seal/10 hover:!text-seal"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Новое событие">
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Название</label><input className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Дата</label><input type="date" className="input mt-1" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Время (необязательно)</label><input type="time" className="input mt-1" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Тип</label>
            <select className="input mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Описание (необязательно)</label><textarea className="input mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </Modal>
    </div>
  )
}
