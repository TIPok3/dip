// app/dashboard/exhibitor/exhibitions/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'
import Link from 'next/link'
import { getExhibitorsByUser } from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'

interface ExhibitorItem {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  company_name: string
  description: string
  contact_email: string
  contact_phone?: string
  website?: string
  exhibition: {
    id: string
    title: string
    start_date: string
    end_date: string
    status: string
  } | null
  booths: {
    id: string
    number: string
    name: string
    status: string
  }[] | null
}

export default function ExhibitorExhibitionsPage() {
  const { user } = useAuth()
  const [exhibitors, setExhibitors] = useState<ExhibitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [boothIds, setBoothIds] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    const { data } = (await getExhibitorsByUser(user?.id!)) as { data: ExhibitorItem[] | null }
    setExhibitors(data || [])

    // Для всех одобренных заявок получаем ID стенда отдельным запросом
    if (data) {
      const boothIdPromises = data
        .filter(item => item.status === 'approved')
        .map(async item => {
          const { data: booth } = await supabase
            .from('booths')
            .select('id')
            .eq('exhibitor_id', item.id)
            .maybeSingle()
          return [item.id, booth?.id || null] as [string, string | null]
        })
      const resolved = await Promise.all(boothIdPromises)
      setBoothIds(Object.fromEntries(resolved))
    }

    setLoading(false)
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Мои выставки</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Выставки, в которых вы участвуете как экспонент</p>

      {exhibitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
          <p>Вы ещё не участвуете ни в одной выставке</p>
          <Link href="/exhibitions" style={{ color: '#2563eb' }}>Найти выставки</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exhibitors.map((item: ExhibitorItem) => {
            const exhibition = item.exhibition
            const booth = item.booths?.[0]
            const isApproved = item.status === 'approved'
            // Используем booth.id из fallback-запроса, если в данных нет
            const boothId = booth?.id || boothIds[item.id]

            return (
              <div key={item.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{exhibition?.title}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{exhibition?.start_date} – {exhibition?.end_date}</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Статус заявки: <span style={{ fontWeight: '500' }}>
                      {item.status === 'approved' ? 'Одобрена' : item.status === 'pending' ? 'На рассмотрении' : 'Отклонена'}
                    </span>
                  </p>
                  {booth && <p style={{ fontSize: '0.875rem' }}>Стенд: {booth.number}</p>}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Link href={`/exhibitions/${exhibition?.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                    Перейти →
                  </Link>
                  {isApproved && boothId && (
                    <Link
                      href={`/dashboard/exhibitor/booth/${boothId}/edit`}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none',
                        fontWeight: '500',
                      }}
                    >
                      Редактировать стенд
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}