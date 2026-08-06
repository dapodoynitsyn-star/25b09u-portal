// Локальный demo-движок хранения данных (на базе localStorage).
// Повторяет простой API «коллекции» из Firestore (list/subscribe/add/update/remove),
// чтобы весь сайт работал сразу после установки зависимостей — без настройки Firebase.
// Как только вы заполните .env реальными ключами Firebase, сервисы в src/services
// начнут использовать Firestore напрямую, а этот файл можно будет не использовать.

type Listener<T> = (items: T[]) => void

class LocalCollection<T extends { id: string }> {
  private key: string
  private listeners = new Set<Listener<T>>()

  constructor(key: string, seed: T[]) {
    this.key = `law-portal:${key}`
    if (typeof window !== 'undefined' && localStorage.getItem(this.key) === null) {
      localStorage.setItem(this.key, JSON.stringify(seed))
    }
  }

  private read(): T[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? '[]') as T[]
    } catch {
      return []
    }
  }

  private write(items: T[]) {
    localStorage.setItem(this.key, JSON.stringify(items))
    this.listeners.forEach((l) => l(items))
  }

  list(): T[] {
    return this.read()
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener)
    listener(this.read())
    return () => this.listeners.delete(listener)
  }

  add(item: T) {
    const items = this.read()
    items.push(item)
    this.write(items)
  }

  update(id: string, patch: Partial<T>) {
    const items = this.read().map((i) => (i.id === id ? { ...i, ...patch } : i))
    this.write(items)
  }

  remove(id: string) {
    this.write(this.read().filter((i) => i.id !== id))
  }
}

import { demoAnnouncements, demoCalendar, demoHomework, demoMaterials, demoSchedule, demoSubjects } from './demoData'
import type { Announcement, CalendarEvent, HomeworkItem, MaterialItem, ScheduleItem, Subject } from '@/types'

export const localSubjects = new LocalCollection<Subject>('subjects', demoSubjects)
export const localSchedule = new LocalCollection<ScheduleItem>('schedule', demoSchedule)
export const localHomework = new LocalCollection<HomeworkItem>('homework', demoHomework)
export const localMaterials = new LocalCollection<MaterialItem>('materials', demoMaterials)
export const localCalendar = new LocalCollection<CalendarEvent>('calendar', demoCalendar)
export const localAnnouncements = new LocalCollection<Announcement>('announcements', demoAnnouncements)
