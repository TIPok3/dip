// app/dashboard/organizer/exhibitions/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getExhibitions } from '@/lib/supabase/queries'

interface Exhibition {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  status: string
  visitor_count: number
  rating: number
  is_public: boolean
  tags: string[]
}

export default function OrganizerExhibitionsPage() {
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all')

  useEffect(() => {
    if (user) {
      loadExhibitions()
    }
  }, [user])

  const loadExhibitions = async () => {
    setLoading(true)
    const { data, error } = await getExhibitions({ organizer_id: user?.id })
    if (!error && data) {
      setExhibitions(data)
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  const filteredExhibitions = exhibitions.filter(ex => {
    if (filter === 'all') return true
    return ex.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Активна', color: '#10b981', bg: '#d1fae5' }
      case 'draft': return { text: 'Черновик', color: '#f59e0b', bg: '#fef3c7' }
      case 'completed': return { text: 'Завершена', color: '#6b7280', bg: '#f3f4f6' }
      default: return { text: status, color: '#6b7280', bg: '#f3f4f6' }
    }
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Мои выставки</h1>
        <p style={{ color: '#6b7280' }}>Управляйте созданными вами выставками</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        {(['all', 'active', 'draft', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filter === f ? '#2563eb' : '#f3f4f6',
              color: filter === f ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : f === 'draft' ? 'Черновики' : 'Завершённые'}
          </button>
        ))}
      </div>

      {filteredExhibitions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
          <p>У вас нет выставок в этом статусе</p>
          <Link href="/dashboard/organizer/exhibitions/new" style={{ color: '#2563eb' }}>Создать выставку</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredExhibitions.map(ex => {
            const badge = getStatusBadge(ex.status)
            return (
              <div key={ex.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{ex.title}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{ex.description?.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    <span>{ex.start_date} – {ex.end_date}</span>
                    <span>• {ex.category}</span>
                    <span>• 👥 {ex.visitor_count}</span>
                    <span>• ⭐ {ex.rating?.toFixed(1) || '0'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                    {badge.text}
                  </span>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link href={`/dashboard/organizer/exhibitions/${ex.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>Управлять →</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}