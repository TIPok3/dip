// app/dashboard/exhibitor/page.tsx
'use client'

import { useAuth } from '../../providers'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getExhibitorsByUser } from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'

export default function ExhibitorDashboard() {
  const { user } = useAuth()
  const [exhibitorData, setExhibitorData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [boothId, setBoothId] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      try {
        const { data: exhibitorInfo } = await getExhibitorsByUser(user.id)
        setExhibitorData(exhibitorInfo || [])
        
        // Если есть основной стенд, пытаемся получить ID стенда
        if (exhibitorInfo && exhibitorInfo.length > 0) {
          const main = exhibitorInfo[0]
          // Сначала проверяем, пришли ли booths через связь
          if (main.booths && main.booths.length > 0) {
            setBoothId(main.booths[0].id)
          } else if (main.booth_number) {
            // Если нет, ищем стенд по номеру в этой выставке
            const { data: booth } = await supabase
              .from('booths')
              .select('id')
              .eq('exhibition_id', main.exhibition_id)
              .eq('number', main.booth_number)
              .maybeSingle()
            if (booth) setBoothId(booth.id)
          }
        }
      } catch (error) {
        console.error('Error loading exhibitor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const mainBooth = exhibitorData.length > 0 ? exhibitorData[0] : null

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Заголовок */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Мои стенды
        </h1>
        <p style={{ color: '#6b7280' }}>
          Управляйте своими виртуальными стендами и взаимодействуйте с посетителями
        </p>
      </div>

      {/* Основной контент */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Левый столбец - Основной стенд */}
        <div>
          {mainBooth ? (
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {mainBooth.company_name}
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {mainBooth.exhibition?.title || 'Выставка'}
                {mainBooth.booth_number && ` • Стенд ${mainBooth.booth_number}`}
              </p>

              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                Описание
              </h3>
              <p style={{
                color: '#6b7280', 
                marginBottom: '2rem',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                {mainBooth.description || 'Описание компании отсутствует'}
              </p>

              {/* Контактная информация */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Контактная информация
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Email: {mainBooth.contact_email}
                </p>
                {mainBooth.contact_phone && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Телефон: {mainBooth.contact_phone}
                  </p>
                )}
                {mainBooth.website && (
                  <p style={{ fontSize: '0.875rem', color: '#2563eb' }}>
                    Сайт: {mainBooth.website}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {boothId ? (
                  <Link
                    href={`/dashboard/exhibitor/booth/${boothId}/edit`}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Редактировать стенд
                  </Link>
                ) : (
                  <button
                    disabled
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#d1d5db',
                      color: '#6b7280',
                      borderRadius: '0.5rem',
                      cursor: 'not-allowed',
                      border: 'none'
                    }}
                  >
                    Редактирование недоступно
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              padding: '3rem 2rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                У вас пока нет стендов
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Зарегистрируйтесь на выставку, чтобы создать свой стенд
              </p>
              <Link
                href="/exhibitions"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                Найти выставки
              </Link>
            </div>
          )}
        </div>

        {/* Правый столбец - регистрация на выставку */}
        <div>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Зарегистрироваться на выставку
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Найдите подходящие выставки для вашего бизнеса
            </p>
            <Link
              href="/exhibitions"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              Найти выставки
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}