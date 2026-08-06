// Единая точка доступа к данным.
// Если Firebase настроен (заполнен .env) — читаем/пишем в Firestore в реальном времени.
// Если нет — используем локальный demo-движок (src/lib/localStore.ts), чтобы сайт
// был полностью рабочим сразу после установки зависимостей.
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { COLLECTIONS, db, isFirebaseConfigured, storage } from '@/lib/firebase'
import {
  localAnnouncements, localCalendar, localHomework, localMaterials, localSchedule, localSubjects,
} from '@/lib/localStore'
import { uid } from '@/lib/utils'
import type {
  Announcement, CalendarEvent, HomeworkItem, MaterialItem, ScheduleItem, Subject,
} from '@/types'

type Collections = {
  subjects: Subject
  schedule: ScheduleItem
  homework: HomeworkItem
  materials: MaterialItem
  calendar: CalendarEvent
  announcements: Announcement
}

const localMap = {
  subjects: localSubjects,
  schedule: localSchedule,
  homework: localHomework,
  materials: localMaterials,
  calendar: localCalendar,
  announcements: localAnnouncements,
} as const

function subscribeCollection<K extends keyof Collections>(
  name: K,
  orderField: string,
  cb: (items: Collections[K][]) => void,
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, COLLECTIONS[name]), orderBy(orderField))
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Collections[K][]
      cb(items)
    })
  }
  // @ts-expect-error — сопоставление коллекции и типа гарантировано через `name`
  return localMap[name].subscribe(cb)
}

async function addToCollection<K extends keyof Collections>(
  name: K,
  item: Omit<Collections[K], 'id'>,
): Promise<string> {
  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, COLLECTIONS[name]), item)
    return docRef.id
  }
  const id = uid()
  // @ts-expect-error — сопоставление коллекции и типа гарантировано через `name`
  localMap[name].add({ ...item, id })
  return id
}

async function updateInCollection<K extends keyof Collections>(
  name: K,
  id: string,
  patch: Partial<Collections[K]>,
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, COLLECTIONS[name], id), patch as Record<string, unknown>)
    return
  }
  // @ts-expect-error — сопоставление коллекции и типа гарантировано через `name`
  localMap[name].update(id, patch)
}

async function removeFromCollection<K extends keyof Collections>(name: K, id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, COLLECTIONS[name], id))
    return
  }
  // @ts-expect-error — сопоставление коллекции и типа гарантировано через `name`
  localMap[name].remove(id)
}

export async function uploadFile(path: string, file: File): Promise<{ url: string; size: number }> {
  if (isFirebaseConfigured && storage) {
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`)
    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)
    return { url, size: file.size }
  }
  // Демо-режим: файл не загружается физически, но UI ведёт себя как при реальной загрузке.
  return { url: '#', size: file.size }
}

export const dataService = {
  subscribeCollection,
  addToCollection,
  updateInCollection,
  removeFromCollection,
}
