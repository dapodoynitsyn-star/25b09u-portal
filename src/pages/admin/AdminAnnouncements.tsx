import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useCollection'
import { dataService } from '@/services/dataService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { Modal, EmptyState, Loader } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export function AdminAnnouncements() {
  const { items, loading } = useAnnouncements()
  const { user } = useAuth()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title || !text) {
      notify('Заполните заголовок и текст', 'error')
      return
    }
    setSaving(true)
    try {
      await dataService.addToCollection('announcements', {
        title, text, date: new Date().toISOString(), attachments: [], author: user?.displayName ?? 'Староста группы',
      })
      notify('Объявление опубликовано')
      setTitle(''); setText(''); setOpen(false)
    } catch {
      notify('Не удалось опубликовать', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить объявление?')) return
    await dataService.removeFromCollection('announcements', id)
    notify('Объявление удалено', 'info')
  }

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary text-sm"><Plus size={15} /> Новое объявление</button>
      </div>

      {loading ? <Loader /> : sorted.length === 0 ? <EmptyState title="Объявлений нет" /> : (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {sorted.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{formatDateTime(a.date)}</p>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-sm text-ink-soft dark:text-navy-soft line-clamp-2 mt-0.5">{a.text}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="btn-secondary !p-2 hover:!bg-seal/10 hover:!text-seal shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Новое объявление">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Заголовок</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Текст</label>
            <textarea className="input mt-1 min-h-28" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">{saving ? 'Публикуем…' : 'Опубликовать'}</button>
        </div>
      </Modal>
    </div>
  )
}
