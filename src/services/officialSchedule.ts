// Интеграция с официальным расписанием СПбГУ (timetable.spbu.ru).
//
// Публичный API университета (используется его собственным сайтом и
// сторонними приложениями вроде «SPBU Timetable»):
//   https://timetable.spbu.ru/api/v1/groups/{groupId}/events/{from}/{to}?timetable=Primary
// где from/to — даты в формате YYYYMMDDHHmm.
//
// Идентификатор группы 25.Б09-ю взят из ссылки, которой поделился староста:
// https://timetable.spbu.ru/LAWS/StudentGroupEvents/Primary/429104/2026-09-07
//
// У API СПбГУ нет заголовков CORS для сторонних сайтов, поэтому прямой запрос
// из браузера обычно блокируется. Чтобы расписание подгружалось само и в
// разработке, и после публикации сайта, используем свой относительный адрес
// /api/schedule, который работает по-разному в зависимости от окружения, но
// с точки зрения браузера выглядит одинаково — без CORS:
//   • при `npm run dev` — Vite сам проксирует /api/schedule на timetable.spbu.ru
//     (см. vite.config.ts, секция server.proxy);
//   • при деплое на Vercel — тот же путь обслуживает serverless-функция
//     /api/schedule.js, которая делает запрос на сервере;
//   • на статическом хостинге без сервера (например, GitHub Pages) такого
//     пути нет, поэтому дальше пробуем прямой запрос, а затем — запасной
//     публичный CORS-прокси.
// Если ни один вариант не сработал — сайт показывает резервное расписание
// (админ-панель, вкладка «Расписание») и не падает.

export const SPBU_GROUP_ID = '429104'
export const SPBU_TIMETABLE_TYPE = 'Primary'
export const SPBU_FACULTY_CODE = 'LAWS'
const API_BASE = 'https://timetable.spbu.ru/api/v1'
const PUBLIC_CORS_PROXY = 'https://api.allorigins.win/raw?url='

export interface OfficialLesson {
  id: string
  date: string // ISO yyyy-mm-dd
  timeStart: string
  timeEnd: string
  subject: string
  teacher: string
  room: string
  type: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Формат даты, который ожидает API СПбГУ: YYYYMMDDHHmm
function toApiDateTime(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}0000`
}

export function mondayOf(date: Date): Date {
  const d = new Date(date)
  const offset = (d.getDay() + 6) % 7 // понедельник = 0
  d.setDate(d.getDate() - offset)
  d.setHours(0, 0, 0, 0)
  return d
}

// Ссылка на официальную страницу расписания для конкретной недели — показываем
// как «источник» и запасной вариант, если пользователь хочет свериться сам.
export function officialTimetableUrl(date: Date): string {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  return `https://timetable.spbu.ru/${SPBU_FACULTY_CODE}/StudentGroupEvents/${SPBU_TIMETABLE_TYPE}/${SPBU_GROUP_ID}/${y}-${m}-${d}`
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} для ${url}`)
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) {
    // allorigins и некоторые прокси иногда отдают text/plain с тем же телом
    const text = await res.text()
    return JSON.parse(text)
  }
  return res.json()
}

// Универсальный загрузчик — принимает произвольный диапазон дат, поэтому
// подходит и для недельного расписания, и для месячной сетки календаря.
export async function fetchOfficialRange(from: Date, to: Date): Promise<OfficialLesson[]> {
  const fromStr = toApiDateTime(from)
  const toStr = toApiDateTime(to)
  const upstreamPath = `/groups/${SPBU_GROUP_ID}/events/${fromStr}/${toStr}?timetable=${SPBU_TIMETABLE_TYPE}`
  const upstreamUrl = `${API_BASE}${upstreamPath}`

  const strategies: Array<() => Promise<unknown>> = [
    () => fetchJson(`/api/schedule?from=${fromStr}&to=${toStr}`),
    () => fetchJson(upstreamUrl),
    () => fetchJson(`${PUBLIC_CORS_PROXY}${encodeURIComponent(upstreamUrl)}`),
  ]

  let lastError: unknown = null
  for (const run of strategies) {
    try {
      const data = await run()
      const lessons = normalize(data)
      if (lessons.length > 0) return lessons
      // Ответ пришёл, но распознать в нём занятия не получилось — сохраним
      // сырые данные в консоль, чтобы можно было поправить normalize().
      if (data && (import.meta as any).env?.DEV) {
        console.info('[officialSchedule] Пустой результат разбора. Сырой ответ:', data)
      }
    } catch (err) {
      lastError = err
    }
  }
  if (lastError) {
    console.warn(
      '[officialSchedule] Не удалось получить расписание с timetable.spbu.ru — показано резервное расписание. ' +
      'Подробности ошибки ниже, инструкции по устранению — в README.md.',
      lastError,
    )
  }
  return []
}

export function fetchOfficialWeek(weekStart: Date): Promise<OfficialLesson[]> {
  const to = new Date(weekStart)
  to.setDate(to.getDate() + 7)
  return fetchOfficialRange(weekStart, to)
}

// Ответ API СПбГУ группирует занятия по дням; названия полей — стандартные
// для .NET-бэкенда университета (PascalCase). На случай отличий проверяем
// несколько вариантов названий полей, прежде чем сдаться.
function normalize(raw: unknown): OfficialLesson[] {
  const data = raw as Record<string, unknown>
  const days = (data?.Days ?? data?.days ?? (Array.isArray(raw) ? raw : [])) as Record<string, unknown>[]
  const lessons: OfficialLesson[] = []

  for (const day of days ?? []) {
    const dayEvents = (day?.DayEvents ?? day?.dayEvents ?? day?.Events ?? day?.events ?? []) as Record<string, unknown>[]
    const dayDateRaw = (day?.DayString ?? day?.Date ?? day?.date ?? '') as string

    for (const ev of dayEvents ?? []) {
      if (ev?.IsBan || ev?.isBan || ev?.IsCancelled || ev?.isCancelled) continue

      const timeStart = firstString(ev, ['TimeIntervalStringFrom', 'TimeStart', 'timeStart', 'Start']) ?? ''
      const timeEnd = firstString(ev, ['TimeIntervalStringTo', 'TimeEnd', 'timeEnd', 'Finish', 'End']) ?? ''
      const subject = firstString(ev, ['Subject', 'SubjectName', 'Discipline', 'subject', 'Name']) ?? 'Занятие'
      const type = firstString(ev, ['LoadKindShortName', 'LoadKind', 'KindOfWork', 'EventType', 'type']) ?? 'Занятие'
      const dateRaw = firstString(ev, ['Date', 'date']) ?? dayDateRaw

      const teacher =
        firstString(ev, ['EducatorsDisplayText', 'TeacherDisplayText', 'teacher']) ??
        joinNames(ev, ['Educators', 'Teachers', 'educators']) ??
        ''

      const room =
        firstString(ev, ['ClassroomsDisplayText', 'RoomDisplayText', 'room']) ??
        joinNames(ev, ['Classrooms', 'Rooms', 'classrooms']) ??
        ''

      lessons.push({
        id: `${dateRaw}-${timeStart}-${subject}`,
        date: normalizeDate(dateRaw),
        timeStart: normalizeTime(timeStart),
        timeEnd: normalizeTime(timeEnd),
        subject,
        teacher,
        room,
        type,
      })
    }
  }

  return lessons.sort((a, b) => (a.date + a.timeStart).localeCompare(b.date + b.timeStart))
}

function firstString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function joinNames(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k]
    if (Array.isArray(v) && v.length) {
      const names = v
        .map((item) => (typeof item === 'string' ? item : item?.DisplayName ?? item?.Fio ?? item?.Name ?? item?.name))
        .filter(Boolean)
      if (names.length) return names.join(', ')
    }
  }
  return undefined
}

function normalizeDate(raw: string): string {
  if (!raw) return ''
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return raw.slice(0, 10)
}

function normalizeTime(raw: string): string {
  if (!raw) return ''
  const match = raw.match(/(\d{1,2}:\d{2})/)
  if (match) return match[1]
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return raw
}
