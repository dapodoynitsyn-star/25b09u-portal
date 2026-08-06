// Vercel Serverless Function — прокси к официальному API расписания СПбГУ.
// Нужна, чтобы обойти отсутствие CORS-заголовков у timetable.spbu.ru:
// запрос идёт с сервера Vercel к серверу СПбГУ (это не подчиняется CORS),
// а браузер обращается уже к своему домену (/api/schedule) — без проблем.
//
// Работает автоматически при деплое на Vercel, ничего дополнительно
// настраивать не нужно. При деплое на GitHub Pages серверных функций нет —
// сайт в этом случае использует запасной публичный CORS-прокси
// (см. src/services/officialSchedule.ts).

const GROUP_ID = '429104'
const TIMETABLE_TYPE = 'Primary'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { from, to } = req.query
  if (!from || !to) {
    res.status(400).json({ error: 'missing_from_to' })
    return
  }

  const upstreamUrl = `https://timetable.spbu.ru/api/v1/groups/${GROUP_ID}/events/${from}/${to}?timetable=${TIMETABLE_TYPE}`

  try {
    const upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } })
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'upstream_error', status: upstream.status })
      return
    }
    const data = await upstream.json()
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (err) {
    res.status(502).json({ error: 'fetch_failed', message: String(err) })
  }
}
