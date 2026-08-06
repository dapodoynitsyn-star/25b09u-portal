import { useEffect, useState } from 'react'
import { fetchOfficialRange, type OfficialLesson } from '@/services/officialSchedule'

interface State {
  lessons: OfficialLesson[]
  loading: boolean
  failed: boolean
}

// from/to задают диапазон дат, за который нужно расписание — неделя для
// страницы «Расписание», видимая сетка месяца для «Календаря».
export function useOfficialSchedule(from: Date, to: Date) {
  const key = `${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}`
  const [state, setState] = useState<State>({ lessons: [], loading: true, failed: false })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    fetchOfficialRange(from, to).then((lessons) => {
      if (!active) return
      setState({ lessons, loading: false, failed: lessons.length === 0 })
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
