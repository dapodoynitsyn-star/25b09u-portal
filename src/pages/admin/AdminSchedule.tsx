import type { ReactNode } from 'react'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSchedule, useSubjects } from '@/hooks/useCollection'
import { dataService } from '@/services/dataService'
import { useToast } from '@/hooks/useToast'
import { Modal, EmptyState, Loader } from '@/components/ui'
import { WEEKDAYS } from '@/lib/utils'
import type { ScheduleItem } from '@/types'

const empty = { day: WEEKDAYS[0], timeStart: '', timeEnd: '', subjectId: '', room: '', type: 'Лекция' as ScheduleItem['type'] }

export function AdminSchedule() {
  const { items, loading } = useSchedule()
  const { items: subjects } = useSubjects()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const subject = subjects.find((s) => s.id === form.subjectId)
    if (!subject || !form.timeStart || !form.timeEnd || !form.room) {
      notify('Заполните все поля', 'error')
      return
    }
    setSaving(true)
    try {
      await dataService.addToCollection('schedule', {
        day: form.day as ScheduleItem['day'], timeStart: form.timeStart, timeEnd: form.timeEnd,
        subjectId: subject.id, subjectName: subject.name, teacher: subject.teacher, room: form.room, type: form.type,
      })
      notify('Пара добавлена в расписание')
      setForm(empty); setOpen(false)
    } catch {
      notify('Не удалось сохранить', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить пару из расписания?')) return
    await dataService.removeFromCollection('schedule', id)
    notify('Пара удалена', 'info')
  }

  const sorted = [...items].sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.timeStart.localeCompare(b.timeStart))

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-soft/70 dark:text-navy-soft/70 card p-3">
        На страницах «Расписание» и «Календарь» сайт в первую очередь показывает официальное расписание с timetable.spbu.ru.
        То, что вы редактируете здесь, используется только как резервный вариант, если сайт СПбГУ недоступен.
      </p>
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary text-sm"><Plus size={15} /> Добавить пару</button>
      </div>

      {loading ? <Loader /> : sorted.length === 0 ? <EmptyState title="Расписание пусто" /> : (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {sorted.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <div className="w-24 shrink-0 text-xs font-mono text-seal dark:text-brass-light">{item.day.slice(0, 2)}, {item.timeStart}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.subjectName}</p>
                <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{item.type} · ауд. {item.room}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="btn-secondary !p-2 hover:!bg-seal/10 hover:!text-seal"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Новая пара">
        <div className="space-y-3">
          <Row label="День">
            <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Начало"><input type="time" className="input" value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })} /></Row>
            <Row label="Конец"><input type="time" className="input" value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })} /></Row>
          </div>
          <Row label="Предмет">
            <select className="input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">Выберите предмет</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Аудитория"><input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Row>
            <Row label="Тип">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ScheduleItem['type'] })}>
                <option>Лекция</option><option>Семинар</option><option>Практика</option>
              </select>
            </Row>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="text-xs font-medium text-ink-soft dark:text-navy-soft">{label}</label><div className="mt-1">{children}</div></div>
}
