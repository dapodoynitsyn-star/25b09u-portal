import { useEffect, useState } from 'react'
import { dataService } from '@/services/dataService'
import type { Announcement, CalendarEvent, HomeworkItem, MaterialItem, ScheduleItem, Subject } from '@/types'

// Небольшой набор типизированных обёрток над dataService.subscribeCollection,
// чтобы страницы получали живые данные (реальное время из Firestore или
// локальное demo-хранилище) одной строкой.

export function useSubjects() {
  return useLive<Subject>('subjects', 'name')
}
export function useSchedule() {
  return useLive<ScheduleItem>('schedule', 'timeStart')
}
export function useHomework() {
  return useLive<HomeworkItem>('homework', 'deadline')
}
export function useMaterials() {
  return useLive<MaterialItem>('materials', 'uploadedAt')
}
export function useCalendarEvents() {
  return useLive<CalendarEvent>('calendar', 'date')
}
export function useAnnouncements() {
  return useLive<Announcement>('announcements', 'date')
}

function useLive<T>(name: Parameters<typeof dataService.subscribeCollection>[0], orderField: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // @ts-expect-error — тип элемента определяется вызывающей функцией
    const unsub = dataService.subscribeCollection(name, orderField, (data: T[]) => {
      setItems(data)
      setLoading(false)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  return { items, loading }
}
