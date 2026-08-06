import type { ReactNode } from 'react'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useHomework, useSubjects } from '@/hooks/useCollection'
import { dataService } from '@/services/dataService'
import { useToast } from '@/hooks/useToast'
import { Modal, EmptyState, Loader } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { HomeworkItem } from '@/types'

const empty = { subjectId: '', title: '', description: '', deadline: '', links: '' }

export function AdminHomework() {
  const { items, loading } = useHomework()
  const { items: subjects } = useSubjects()
  const { notify } = useToast()
  const [editing, setEditing] = useState<HomeworkItem | null>(null)
  const [form, setForm] = useState(empty)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }
  function openEdit(h: HomeworkItem) {
    setEditing(h)
    setForm({ subjectId: h.subjectId, title: h.title, description: h.description, deadline: h.deadline.slice(0, 10), links: h.links.join(', ') })
    setOpen(true)
  }

  async function handleSave() {
    const subject = subjects.find((s) => s.id === form.subjectId)
    if (!subject || !form.title || !form.deadline) {
      notify('Заполните предмет, название и дедлайн', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        subjectId: subject.id,
        subjectName: subject.name,
        title: form.title,
        description: form.description,
        deadline: new Date(form.deadline).toISOString(),
        links: form.links.split(',').map((l) => l.trim()).filter(Boolean),
      }
      if (editing) {
        await dataService.updateInCollection('homework', editing.id, payload)
        notify('Задание обновлено')
      } else {
        await dataService.addToCollection('homework', { ...payload, publishedAt: new Date().toISOString(), attachments: [] })
        notify('Задание добавлено')
      }
      setOpen(false)
    } catch {
      notify('Не удалось сохранить задание', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить это задание?')) return
    await dataService.removeFromCollection('homework', id)
    notify('Задание удалено', 'info')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={15} /> Добавить задание</button>
      </div>

      {loading ? <Loader /> : items.length === 0 ? <EmptyState title="Заданий пока нет" /> : (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {items.map((h) => (
            <div key={h.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-seal dark:text-brass-light">{h.subjectName} · срок {formatDate(h.deadline)}</p>
                <p className="text-sm font-medium truncate">{h.title}</p>
              </div>
              <button onClick={() => openEdit(h)} className="btn-secondary !p-2"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(h.id)} className="btn-secondary !p-2 hover:!bg-seal/10 hover:!text-seal"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Редактировать задание' : 'Новое задание'}>
        <div className="space-y-3">
          <Field label="Предмет">
            <select className="input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">Выберите предмет</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Название"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Текст задания"><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Дедлайн"><input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
          <Field label="Ссылки (через запятую)"><input className="input" value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} /></Field>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
