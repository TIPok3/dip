// app/dashboard/visitor/page.tsx
'use client'

import { useAuth } from '../../providers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getVisitorRegistrations, getExhibitions } from '@/lib/supabase/queries'

export default function VisitorDashboard() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [recommendedExhibitions, setRecommendedExhibitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      try {
        const { data: registrationsData } = await getVisitorRegistrations(user.id)
        setRegistrations(registrationsData || [])

        const { data: exhibitionsData } = await getExhibitions({
          status: 'active',
          is_public: true,
          limit: 5
        })
        setRecommendedExhibitions(exhibitionsData || [])
      } catch (error) {
        console.error('Error loading visitor data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [user])

  const visitedExhibitions = registrations.filter(r => r.status === 'attended').length
  const registeredExhibitions = registrations.length
  const savedExhibitions = registrations.slice(0, 2)
  const visitedBooths = 87 // временно

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><p>Загрузка данных...</p></div>
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Добро пожаловать, {user?.name}!</h1>
        <p style={{ color: '#6b7280' }}>Исследуйте виртуальные выставки и открывайте новые возможности</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <input type="text" placeholder="Поиск выставок по названию, категории или экспоненту..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{visitedExhibitions}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Посещенные выставки</p>
          <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{registeredExhibitions} зарегистрировано</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{visitedBooths}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Посещенные стенды</p>
          <p style={{ fontSize: '0.75rem', color: '#10b981' }}>+24 за неделю</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{savedExhibitions.length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Сохраненное</p>
          <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{savedExhibitions.length} выставок</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Левая колонка - Мои выставки */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Мои выставки</h2>
            {savedExhibitions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                <p style={{ marginBottom: '1rem' }}>Вы еще не зарегистрировались на выставки</p>
                <Link href="/exhibitions" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>Найти выставки</Link>
              </div>
            ) : (
              <>
                <div>
                  {savedExhibitions.map((reg: any, index: number) => (
                    <div key={reg.id} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                      <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{reg.exhibition?.title || 'Выставка'}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        <span>{reg.exhibition?.start_date} - {reg.exhibition?.end_date}</span><span>•</span><span>{reg.exhibition?.category || 'Категория'}</span><span>•</span>
                        <span style={{ color: reg.status === 'attended' ? '#10b981' : reg.status === 'registered' ? '#2563eb' : '#6b7280', fontWeight: '500' }}>{reg.status === 'attended' ? 'Посещена' : reg.status === 'registered' ? 'Зарегистрирован' : 'Отменена'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Link href={`/exhibitions/${reg.exhibition_id}`} style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none' }}>Перейти →</Link>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{reg.visited_booths?.length || 0} стендов посещено</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/visitor/my-exhibitions" style={{ display: 'block', width: '100%', padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>Все мои выставки</Link>
              </>
            )}
          </div>
        </div>

        {/* Правая колонка - Рекомендации */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Рекомендуем для вас</h2>
            {recommendedExhibitions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}><p>Нет доступных выставок</p></div>
            ) : (
              <>
                <div>
                  {recommendedExhibitions.map((expo: any, index: number) => (
                    <div key={expo.id} style={{ padding: '1rem', backgroundColor: index === 0 ? '#f0f9ff' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: '500' }}>{expo.title}</p>
                        <span style={{ fontSize: '0.75rem', color: expo.visitor_count > 1000 ? '#10b981' : '#2563eb', fontWeight: '500' }}>{expo.visitor_count} посетителей</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: '1.4' }}>{expo.description?.substring(0, 80)}...</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}><span>{expo.category}</span><span>•</span><span>{expo.start_date} - {expo.end_date}</span></div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Сохранить</button>
                          <Link href={`/exhibitions/${expo.id}`} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}>Подробнее</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/exhibitions" style={{ display: 'block', width: '100%', padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>Все выставки →</Link>
              </>
            )}
          </div>

          {/* Быстрые действия */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Быстрые действия</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/exhibitions" style={{ padding: '0.75rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', textAlign: 'center' }}>🔍 Найти выставки</Link>
              <Link href="/dashboard/visitor/saved" style={{ padding: '0.75rem 1rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', textAlign: 'center' }}>⭐ Избранное</Link>
              <Link href="/dashboard/visitor/history" style={{ padding: '0.75rem 1rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', textAlign: 'center' }}>📊 История посещений</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}