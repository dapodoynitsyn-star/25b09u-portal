// Демонстрационные данные для 25.Б09-ю юрфака СПбГУ.
// Используются только когда Firebase не настроен (см. isFirebaseConfigured в firebase.ts),
// чтобы сайт был живым и кликабельным сразу после установки зависимостей.
import type { Announcement, CalendarEvent, HomeworkItem, MaterialItem, ScheduleItem, Subject } from '@/types'

export const demoSubjects: Subject[] = [
  { id: 's1', name: 'Гражданское право', teacher: 'проф. Волкова Е. С.', color: '#7A1F2B' },
  { id: 's2', name: 'Уголовное право', teacher: 'доц. Сорокин П. И.', color: '#1F3A5F' },
  { id: 's3', name: 'Конституционное право', teacher: 'проф. Дмитриева А. Н.', color: '#B08D57' },
  { id: 's4', name: 'Римское право', teacher: 'доц. Егоров К. В.', color: '#4A6B4F' },
  { id: 's5', name: 'Международное право', teacher: 'проф. Ли Хосе М.', color: '#5B4B8A' },
  { id: 's6', name: 'Административное право', teacher: 'доц. Тарасова О. Д.', color: '#8A5B3A' },
]

const s = (name: string) => demoSubjects.find((x) => x.name === name)!

export const demoSchedule: ScheduleItem[] = [
  { id: 'sc1', day: 'Понедельник', timeStart: '09:30', timeEnd: '11:00', subjectId: s('Гражданское право').id, subjectName: 'Гражданское право', teacher: s('Гражданское право').teacher, room: '317', type: 'Лекция' },
  { id: 'sc2', day: 'Понедельник', timeStart: '11:10', timeEnd: '12:40', subjectId: s('Римское право').id, subjectName: 'Римское право', teacher: s('Римское право').teacher, room: '212', type: 'Семинар' },
  { id: 'sc3', day: 'Вторник', timeStart: '09:30', timeEnd: '11:00', subjectId: s('Уголовное право').id, subjectName: 'Уголовное право', teacher: s('Уголовное право').teacher, room: '404', type: 'Лекция' },
  { id: 'sc4', day: 'Вторник', timeStart: '13:00', timeEnd: '14:30', subjectId: s('Конституционное право').id, subjectName: 'Конституционное право', teacher: s('Конституционное право').teacher, room: '105', type: 'Практика' },
  { id: 'sc5', day: 'Среда', timeStart: '11:10', timeEnd: '12:40', subjectId: s('Международное право').id, subjectName: 'Международное право', teacher: s('Международное право').teacher, room: 'Ауд. Совета', type: 'Лекция' },
  { id: 'sc6', day: 'Четверг', timeStart: '09:30', timeEnd: '11:00', subjectId: s('Административное право').id, subjectName: 'Административное право', teacher: s('Административное право').teacher, room: '221', type: 'Семинар' },
  { id: 'sc7', day: 'Четверг', timeStart: '15:00', timeEnd: '16:30', subjectId: s('Гражданское право').id, subjectName: 'Гражданское право', teacher: s('Гражданское право').teacher, room: '317', type: 'Семинар' },
  { id: 'sc8', day: 'Пятница', timeStart: '11:10', timeEnd: '12:40', subjectId: s('Уголовное право').id, subjectName: 'Уголовное право', teacher: s('Уголовное право').teacher, room: '404', type: 'Практика' },
]

function iso(daysFromNow: number, hour = 12): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const demoHomework: HomeworkItem[] = [
  {
    id: 'h1', subjectId: s('Гражданское право').id, subjectName: 'Гражданское право',
    title: 'Казус по обязательственному праву №4',
    description: 'Решить казус в письменной форме, ссылаясь на статьи ГК РФ. Оформление — согласно методичке кафедры.',
    publishedAt: iso(-3), deadline: iso(4), attachments: [{ name: 'kazus_4.pdf', url: '#', size: 182_000, type: 'pdf' }], links: [], pinned: true,
  },
  {
    id: 'h2', subjectId: s('Римское право').id, subjectName: 'Римское право',
    title: 'Перевод фрагмента Дигест Юстиниана',
    description: 'Перевести и прокомментировать фрагмент D.1.1.10 согласно плану семинара.',
    publishedAt: iso(-5), deadline: iso(1), attachments: [], links: ['https://example.com/digest-fragment'],
  },
  {
    id: 'h3', subjectId: s('Уголовное право').id, subjectName: 'Уголовное право',
    title: 'Эссе: разграничение составов ст. 158 и ст. 159 УК РФ',
    description: 'Объём — 3–4 страницы. Обязательна судебная практика за последние 3 года.',
    publishedAt: iso(-1), deadline: iso(9), attachments: [{ name: 'metodichka_esse.docx', url: '#', size: 64_000, type: 'docx' }], links: [],
  },
  {
    id: 'h4', subjectId: s('Конституционное право').id, subjectName: 'Конституционное право',
    title: 'Сравнительный анализ моделей конституционного контроля',
    description: 'Таблица сравнения РФ, ФРГ и США — по образцу, разобранному на практике.',
    publishedAt: iso(-7), deadline: iso(-1), attachments: [], links: [],
  },
  {
    id: 'h5', subjectId: s('Международное право').id, subjectName: 'Международное право',
    title: 'Кейс Международного суда ООН',
    description: 'Подготовить краткое изложение позиции сторон и решения суда.',
    publishedAt: iso(0), deadline: iso(12), attachments: [], links: ['https://example.com/icj-case'],
  },
]

export const demoMaterials: MaterialItem[] = [
  { id: 'm1', subjectId: s('Гражданское право').id, subjectName: 'Гражданское право', fileName: 'Лекция 1. Понятие обязательства.pdf', fileType: 'pdf', url: '#', size: 2_400_000, uploadedAt: iso(-20), pinned: true },
  { id: 'm2', subjectId: s('Гражданское право').id, subjectName: 'Гражданское право', fileName: 'Презентация. Договор купли-продажи.pptx', fileType: 'pptx', url: '#', size: 5_100_000, uploadedAt: iso(-12) },
  { id: 'm3', subjectId: s('Римское право').id, subjectName: 'Римское право', fileName: 'Хрестоматия. Институции Гая.pdf', fileType: 'pdf', url: '#', size: 3_800_000, uploadedAt: iso(-30) },
  { id: 'm4', subjectId: s('Уголовное право').id, subjectName: 'Уголовное право', fileName: 'Методичка по Особенной части.docx', fileType: 'docx', url: '#', size: 900_000, uploadedAt: iso(-9) },
  { id: 'm5', subjectId: s('Конституционное право').id, subjectName: 'Конституционное право', fileName: 'Схема органов власти РФ.png', fileType: 'image', url: '#', size: 420_000, uploadedAt: iso(-15) },
  { id: 'm6', subjectId: s('Международное право').id, subjectName: 'Международное право', fileName: 'Сборник конвенций (архив).zip', fileType: 'archive', url: '#', size: 12_300_000, uploadedAt: iso(-40) },
]

export const demoCalendar: CalendarEvent[] = [
  { id: 'c1', title: 'Семинар: Обязательственное право', date: iso(1).slice(0, 10), time: '11:10', type: 'Семинар', subjectName: 'Гражданское право' },
  { id: 'c2', title: 'Дедлайн: казус №4', date: iso(4).slice(0, 10), type: 'Дедлайн', subjectName: 'Гражданское право' },
  { id: 'c3', title: 'Контрольная работа', date: iso(6).slice(0, 10), time: '09:30', type: 'Контрольная', subjectName: 'Уголовное право' },
  { id: 'c4', title: 'Зачёт по римскому праву', date: iso(14).slice(0, 10), time: '10:00', type: 'Зачёт', subjectName: 'Римское право' },
  { id: 'c5', title: 'Экзамен: Конституционное право', date: iso(28).slice(0, 10), time: '09:00', type: 'Экзамен', subjectName: 'Конституционное право' },
  { id: 'c6', title: 'Собрание старост факультета', date: iso(2).slice(0, 10), time: '17:00', type: 'Другое' },
]

export const demoAnnouncements: Announcement[] = [
  {
    id: 'a1', title: 'Перенос семинара по международному праву',
    text: 'Семинар в среду переносится на пятницу, 13:00, ауд. 212. Просьба всех предупредить.',
    date: iso(-1), attachments: [], author: 'Староста группы',
  },
  {
    id: 'a2', title: 'Сбор на методички',
    text: 'Собираем по 400 ₽ на печать методичек по римскому праву. Перевод — старосте до пятницы.',
    date: iso(-4), attachments: [], author: 'Староста группы',
  },
  {
    id: 'a3', title: 'Расписание сессии опубликовано',
    text: 'Ознакомьтесь с расписанием зачётов и экзаменов в разделе «Календарь». При коллизиях — писать старосте.',
    date: iso(-8), attachments: [{ name: 'sessiya_raspisanie.pdf', url: '#', size: 210_000, type: 'pdf' }], author: 'Деканат',
  },
]
