import React, { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FileDropzone({ onFiles, uploading }: { onFiles: (files: FileList) => void; uploading?: boolean }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors',
        dragOver ? 'border-brass bg-brass/5' : 'border-parchment-line dark:border-navy-line hover:border-brass/60',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      {uploading ? (
        <Loader2 className="animate-spin text-brass" size={22} />
      ) : (
        <UploadCloud className="text-brass" size={22} />
      )}
      <p className="text-sm text-ink-soft dark:text-navy-soft">
        Перетащите файлы сюда или <span className="text-seal dark:text-brass-light underline">выберите на устройстве</span>
      </p>
    </div>
  )
}
