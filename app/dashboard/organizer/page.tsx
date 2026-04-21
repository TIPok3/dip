// app/dashboard/organizer/page.tsx
'use client'

import { useAuth } from '../../providers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExhibitions, getExhibitorsByExhibition } from '@/lib/supabase/queries'

interface Exhibition {
  id: string
  title: string
  description: string
  status: string
  visitor_count: number
  start_date: string
  end_date: string
  category: string
  rating: number
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [totalExhibitors, setTotalExhibitors] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        // 1. Загрузить выставки организатора
        const { data: exhibitionsData } = await getExhibitions({
          organizer_id: user.id,
        })
        const exhibitionsList = exhibitionsData || []
        setExhibitions(exhibitionsList)

        // 2. Посчитать общую статистику
        let visitors = 0
        let exhibitorsCount = 0

        if (exhibitionsList.length > 0) {
          visitors = exhibitionsList.reduce(
            (sum: number, expo: Exhibition) => sum + (expo.visitor_count || 0),
            0
          )

          // Суммируем экспонентов по всем выставкам
          for (const expo of exhibitionsList) {
            const { data: exhibitors } = await getExhibitorsByExhibition(expo.id)
            exhibitorsCount += exhibitors?.length || 0
          }
        }

        setTotalVisitors(visitors)
        setTotalExhibitors(exhibitorsCount)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const activeExhibitions = exhibitions.filter((e) => e.status === 'active').length
  const upcomingExhibitions = exhibitions.filter((e) => e.status === 'draft').length

  // Суммарное количество просмотров стендов (можно заменить на реальный запрос к booth_views)
  const totalBoothViews = exhibitions.reduce(
    (sum, expo) => sum + (expo.visitor_count || 0),
    0
  )

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <p>Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Заголовок */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Добро пожаловать, {user?.name}!
        </h1>
        <p style={{ color: '#6b7280' }}>Управляйте своими виртуальными выставками</p>
      </div>

      {/* Статистика */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Активные выставки
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{activeExhibitions}</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{upcomingExhibitions} в подготовке</p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Всего посетителей
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {totalVisitors.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>уникальных регистраций</p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Экспоненты</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{totalExhibitors}</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>участников</p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Просмотры</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {totalBoothViews.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>стендов</p>
        </div>
      </div>

      {/* Быстрые действия */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Быстрые действия</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard/organizer/exhibitions/new"
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            + Создать выставку
          </Link>
          <Link
            href="/dashboard/organizer/exhibitions"
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1px solid #d1d5db',
            }}
          >
            📊 Мои выставки ({exhibitions.length})
          </Link>
        </div>
      </div>

      {/* Мои выставки */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Мои выставки</h2>
          <Link
            href="/dashboard/organizer/exhibitions"
            style={{
              fontSize: '0.875rem',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Все выставки →
          </Link>
        </div>

        {exhibitions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
            }}
          >
            <p style={{ marginBottom: '1rem' }}>У вас пока нет выставок</p>
            <Link
              href="/dashboard/organizer/exhibitions/new"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Создать первую выставку
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {exhibitions.slice(0, 3).map((expo) => (
              <div
                key={expo.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ fontWeight: '600' }}>{expo.title}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor:
                        expo.status === 'active'
                          ? '#d1fae5'
                          : expo.status === 'draft'
                          ? '#fef3c7'
                          : '#f3f4f6',
                      color:
                        expo.status === 'active'
                          ? '#065f46'
                          : expo.status === 'draft'
                          ? '#92400e'
                          : '#374151',
                      borderRadius: '9999px',
                      fontWeight: '500',
                    }}
                  >
                    {expo.status === 'active'
                      ? 'Активная'
                      : expo.status === 'draft'
                      ? 'Черновик'
                      : 'Завершена'}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '1rem',
                  }}
                >
                  {expo.description?.substring(0, 100)}...
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  <span>
                    {expo.start_date} - {expo.end_date}
                  </span>
                  <span>{expo.visitor_count} посетителей</span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Link
                    href={`/dashboard/organizer/exhibitions/${expo.id}`}
                    style={{
                      fontSize: '0.875rem',
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Управлять →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}