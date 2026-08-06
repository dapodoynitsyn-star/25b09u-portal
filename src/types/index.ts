export type UserRole = 'admin' | 'student'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
}

export interface Subject {
  id: string
  name: string
  teacher: string
  color: string
}

export interface ScheduleItem {
  id: string
  day: 'Понедельник' | 'Вторник' | 'Среда' | 'Четверг' | 'Пятница' | 'Суббота'
  timeStart: string
  timeEnd: string
  subjectId: string
  subjectName: string
  teacher: string
  room: string
  type: 'Лекция' | 'Семинар' | 'Практика'
}

export interface FileAttachment {
  name: string
  url: string
  size: number
  type: string
}

export interface HomeworkItem {
  id: string
  subjectId: string
  subjectName: string
  title: string
  description: string
  publishedAt: string
  deadline: string
  attachments: FileAttachment[]
  links: string[]
  pinned?: boolean
}

export interface MaterialItem {
  id: string
  subjectId: string
  subjectName: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'archive' | 'link'
  url: string
  size: number
  uploadedAt: string
  pinned?: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  type: 'Семинар' | 'Лекция' | 'Дедлайн' | 'Контрольная' | 'Зачёт' | 'Экзамен' | 'Другое'
  subjectName?: string
  description?: string
}

export interface Announcement {
  id: string
  title: string
  text: string
  date: string
  attachments: FileAttachment[]
  author: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}
