import { cn } from '@/lib/utils'

// Фирменный знак — герб юридического факультета СПбГУ в кольце насечек (как гербовая печать).
export function Seal({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('relative shrink-0 rounded-full flex items-center justify-center text-seal dark:text-brass-light', className)}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-seal-ring opacity-70" />
      <div className="absolute inset-[3px] rounded-full border border-current" />
      <img
        src="/emblem.png"
        alt="Герб юридического факультета СПбГУ"
        draggable={false}
        className="relative select-none dark:invert"
        style={{ width: size * 0.62, height: size * 0.62 }}
      />
    </div>
  )
}
