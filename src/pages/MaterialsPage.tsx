import type { ElementType } from 'react'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, FileImage, FileArchive, Link2, Presentation, Download, Folder, ChevronLeft, Pin } from 'lucide-react'
import { useMaterials, useSubjects } from '@/hooks/useCollection'
import { Loader, EmptyState, SearchInput, Badge } from '@/components/ui'
import { formatBytes, formatDate } from '@/lib/utils'
import type { MaterialItem } from '@/types'

const ICONS: Record<MaterialItem['fileType'], ElementType> = {
  pdf: FileText, docx: FileText, pptx: Presentation, image: FileImage, archive: FileArchive, link: Link2,
}

export function MaterialsPage() {
  const { items, loading } = useMaterials()
  const { items: subjects } = useSubjects()
  const [openSubject, setOpenSubject] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const bySubject = useMemo(() => {
    const map: Record<string, MaterialItem[]> = {}
    for (const m of items) {
      if (!map[m.subjectId]) map[m.subjectId] = []
      map[m.subjectId].push(m)
    }
    return map
  }, [items])

  const searchResults = useMemo(() => {
    if (!query) return null
    return items.filter((m) => m.fileName.toLowerCase().includes(query.toLowerCase()))
  }, [items, query])

  const activeSubject = subjects.find((s) => s.id === openSubject)

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Библиотека курса</p>
        <h2 className="font-display text-3xl font-semibold">Материалы</h2>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Поиск по названию файла…" />

      {loading ? (
        <Loader />
      ) : searchResults ? (
        <MaterialList items={searchResults} emptyHint="Файлов с таким названием не найдено." />
      ) : openSubject && activeSubject ? (
        <div className="space-y-4">
          <button onClick={() => setOpenSubject(null)} className="flex items-center gap-1 text-sm text-ink-soft dark:text-navy-soft hover:text-seal dark:hover:text-brass-light">
            <ChevronLeft size={16} /> Все папки
          </button>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold">{activeSubject.name}</h3>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="btn-secondary text-xs !py-1.5"
            >
              <Download size={13} /> Скачать все материалы предмета
            </a>
          </div>
          <MaterialList items={bySubject[openSubject] ?? []} emptyHint="В этой папке пока нет материалов." />
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const count = (bySubject[s.id] ?? []).length
            return (
              <motion.button
                layout
                key={s.id}
                onClick={() => setOpenSubject(s.id)}
                className="card p-5 text-left flex items-start gap-3 hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}1A`, color: s.color }}>
                  <Folder size={19} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-medium truncate">{s.name}</p>
                  <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60 mt-0.5">{count} {pluralFiles(count)}</p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

function MaterialList({ items, emptyHint }: { items: MaterialItem[]; emptyHint: string }) {
  if (items.length === 0) return <EmptyState title="Пусто" hint={emptyHint} />
  const sorted = [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned))
  return (
    <div className="card divide-y divide-parchment-line dark:divide-navy-line overflow-hidden">
      <AnimatePresence>
        {sorted.map((m) => {
          const Icon = ICONS[m.fileType]
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4"
            >
              <Icon size={18} className="text-seal dark:text-brass-light shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate flex items-center gap-1.5">
                  {m.pinned && <Pin size={12} className="text-brass shrink-0" />} {m.fileName}
                </p>
                <p className="text-xs text-ink-soft/60 dark:text-navy-soft/60">{m.subjectName} · {formatBytes(m.size)} · {formatDate(m.uploadedAt)}</p>
              </div>
              <a href={m.url} download className="btn-secondary !py-1.5 !px-2.5 text-xs shrink-0">
                <Download size={13} />
              </a>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function pluralFiles(n: number): string {
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'файл'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'файла'
  return 'файлов'
}
