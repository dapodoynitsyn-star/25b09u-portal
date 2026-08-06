import { useState } from 'react'
import { Trash2, Pin, PinOff } from 'lucide-react'
import { useMaterials, useSubjects } from '@/hooks/useCollection'
import { dataService, uploadFile } from '@/services/dataService'
import { useToast } from '@/hooks/useToast'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { EmptyState, Loader } from '@/components/ui'
import { formatBytes, formatDate } from '@/lib/utils'
import type { MaterialItem } from '@/types'

function guessType(fileName: string): MaterialItem['fileType'] {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'docx'
  if (['ppt', 'pptx'].includes(ext)) return 'pptx'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive'
  return 'pdf'
}

export function AdminMaterials() {
  const { items, loading } = useMaterials()
  const { items: subjects } = useSubjects()
  const { notify } = useToast()
  const [subjectId, setSubjectId] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList) {
    if (!subjectId) {
      notify('Сначала выберите предмет', 'error')
      return
    }
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const { url, size } = await uploadFile(`materials/${subject.id}`, file)
        await dataService.addToCollection('materials', {
          subjectId: subject.id,
          subjectName: subject.name,
          fileName: file.name,
          fileType: guessType(file.name),
          url,
          size,
          uploadedAt: new Date().toISOString(),
        })
      }
      notify(`Загружено файлов: ${files.length}`, 'success')
    } catch {
      notify('Не удалось загрузить файлы', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот материал?')) return
    await dataService.removeFromCollection('materials', id)
    notify('Материал удалён', 'info')
  }

  async function togglePin(m: MaterialItem) {
    await dataService.updateInCollection('materials', m.id, { pinned: !m.pinned })
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Предмет для загрузки</label>
        <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Выберите предмет</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <FileDropzone onFiles={handleFiles} uploading={uploading} />
      </div>

      {loading ? <Loader /> : items.length === 0 ? <EmptyState title="Материалов пока нет" /> : (
        <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-seal dark:text-brass-light">{m.subjectName} · {formatBytes(m.size)} · {formatDate(m.uploadedAt)}</p>
                <p className="text-sm font-medium truncate">{m.fileName}</p>
              </div>
              <button onClick={() => togglePin(m)} className="btn-secondary !p-2" title={m.pinned ? 'Открепить' : 'Закрепить'}>
                {m.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
              <button onClick={() => handleDelete(m.id)} className="btn-secondary !p-2 hover:!bg-seal/10 hover:!text-seal"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
