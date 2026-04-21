// app/dashboard/visitor/exhibitions/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function VisitorExhibitionsPage() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    const { data } = await supabase
      .from('exhibition_visitors')
      .select('*, exhibition:exhibition_id(*)')
      .eq('user_id', user?.id)
    setRegistrations(data || [])
    setLoading(false)
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Мои выставки</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Выставки, на которые вы зарегистрировались</p>

      {registrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
          <p>Вы ещё не зарегистрировались ни на одну выставку</p>
          <Link href="/exhibitions" style={{ color: '#2563eb' }}>Найти выставки</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {registrations.map(reg => {
            const ex = reg.exhibition
            return (
              <div key={reg.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{ex?.title}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{ex?.start_date} – {ex?.end_date}</p>
                  <p style={{ fontSize: '0.875rem' }}>Статус: <span style={{ fontWeight: '500' }}>{reg.status === 'registered' ? 'Зарегистрирован' : reg.status === 'attended' ? 'Посещено' : 'Отменено'}</span></p>
                </div>
                <div>
                  <Link href={`/exhibitions/${ex?.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>Перейти →</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}