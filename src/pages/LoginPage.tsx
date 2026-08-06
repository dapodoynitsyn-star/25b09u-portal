import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isFirebaseConfigured } from '@/lib/firebase'
import { Seal } from '@/components/ui/Seal'

export function LoginPage() {
  const { signIn } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      notify('Вы вошли как староста', 'success')
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <div className="flex flex-col items-center text-center mb-6">
        <Seal size={48} />
        <h2 className="font-display text-2xl font-semibold mt-3">Вход для старосты</h2>
        <p className="text-sm text-ink-soft dark:text-navy-soft mt-1">
          Доступ к админ-панели группы. Студенты могут просматривать сайт без входа.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" placeholder="starosta@25b09u.law.spbu.ru" />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft dark:text-navy-soft">Пароль</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-seal">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
          <LogIn size={16} /> {submitting ? 'Входим…' : 'Войти'}
        </button>
      </form>

      {!isFirebaseConfigured && (
        <div className="mt-4 card p-4 flex gap-2.5 text-xs text-ink-soft dark:text-navy-soft">
          <ShieldCheck size={16} className="text-brass shrink-0 mt-0.5" />
          <p>
            Firebase ещё не настроен — сайт работает в демо-режиме. Используйте демо-логин старосты:{' '}
            <code className="font-mono">starosta@25b09u.law.spbu.ru</code> / <code className="font-mono">starosta9</code>.
            Инструкции по подключению Firebase — в README.md.
          </p>
        </div>
      )}
    </div>
  )
}
