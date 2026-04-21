// app/exhibitions/[id]/components/BoothsGrid.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'
import BoothRatingStars from './BoothRatingStars'

interface Booth {
  id: string
  number: string
  name: string
  description: string
  status: 'available' | 'occupied' | 'reserved'
  visitor_count: number
  rating: number
  category: string
  tags: string[]
  exhibitor?: {
    company_name: string
    description: string
    contact_email: string
    website?: string
  }
}

interface Exhibition {
  id: string
  title: string
  status: 'active' | 'upcoming' | 'completed' | 'draft'
}

interface BoothsGridProps {
  booths: Booth[]
  exhibition: Exhibition
}

export default function BoothsGrid({ booths, exhibition }: BoothsGridProps) {
  const { user } = useAuth()
  const [hoveredBooth, setHoveredBooth] = useState<string | null>(null)

  const logBoothView = async (boothId: string) => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('booth_views')
      .upsert({
        booth_id: boothId,
        user_id: user.id,
        viewed_at: today
      }, {
        onConflict: 'booth_id, user_id, viewed_at'
      })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#10b981'
      case 'reserved': return '#f59e0b'
      case 'available': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied': return 'Занят'
      case 'reserved': return 'Зарезервированный'
      case 'available': return 'Свободен'
      default: return status
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Группируем стенды по павильонам (по первой букве номера)
  const groupedBooths = booths.reduce((groups: Record<string, Booth[]>, booth) => {
    const pavilion = booth.number.charAt(0).toUpperCase()
    if (!groups[pavilion]) {
      groups[pavilion] = []
    }
    groups[pavilion].push(booth)
    return groups
  }, {})

  const sortedPavilions = Object.keys(groupedBooths).sort()

  if (booths.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }}>🏢</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
          На этой выставке пока нет стендов
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Экспоненты еще не зарегистрировались или организатор не разместил стенды
        </p>
        {exhibition.status === 'active' || exhibition.status === 'upcoming' ? (
          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Подать заявку на участие
          </button>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Выставка завершена, новые заявки не принимаются</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
            Стенды выставки
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {booths.length} стендов • {Object.keys(groupedBooths).length} павильонов
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            <option value="number">По номеру (А-Я)</option>
            <option value="popular">По популярности</option>
            <option value="rating">По рейтингу</option>
            <option value="category">По категории</option>
          </select>

          <button
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            🔍 Поиск
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sortedPavilions.map((pavilion) => (
          <div key={pavilion}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#dbeafe',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#1e40af'
              }}>
                {pavilion}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                Павильон {pavilion}
              </h3>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {groupedBooths[pavilion].length} стендов
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem'
            }}>
              {groupedBooths[pavilion].map((booth) => (
                <div
                  key={booth.id}
                  onMouseEnter={() => setHoveredBooth(booth.id)}
                  onMouseLeave={() => setHoveredBooth(null)}
                  onClick={() => {
                    logBoothView(booth.id)
                    // Здесь можно добавить открытие модального окна или переход на страницу стенда
                    console.log('Открыть стенд', booth.id)
                  }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    border: `1px solid ${hoveredBooth === booth.id ? '#3b82f6' : '#e5e7eb'}`,
                    padding: '1.25rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: hoveredBooth === booth.id ? '0 4px 6px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                          {booth.number}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: getStatusColor(booth.status) + '20',
                          color: getStatusColor(booth.status),
                          borderRadius: '9999px',
                          fontWeight: '500'
                        }}>
                          {getStatusText(booth.status)}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>
                        {booth.name}
                      </h4>
                    </div>

                    {booth.rating > 0 && (
                      <BoothRatingStars boothId={booth.id} currentRating={booth.rating} />
                    )}
                  </div>

                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    marginBottom: '0.75rem',
                    minHeight: '40px'
                  }}>
                    {booth.description.length > 80 
                      ? `${booth.description.substring(0, 80)}...` 
                      : booth.description}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    {booth.category && (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '0.25rem',
                        marginRight: '0.5rem',
                        marginBottom: '0.375rem',
                        fontWeight: '500'
                      }}>
                        {booth.category}
                      </span>
                    )}
                    
                    {booth.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          borderRadius: '0.25rem',
                          marginRight: '0.375rem',
                          marginBottom: '0.375rem',
                          display: 'inline-block'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {booth.tags.length > 2 && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        +{booth.tags.length - 2}
                      </span>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
                          Посетителей
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                          {formatNumber(booth.visitor_count)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      
                      
                      <Link
                        href={`/booths/${booth.id}`}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        Посетить
                      </Link>
                    </div>
                  </div>

                  {booth.exhibitor && (
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f3f4f6',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.125rem' }}>
                        {booth.exhibitor.company_name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{booth.exhibitor.contact_email}</span>
                        {booth.exhibitor.website && (
                          <a 
                            href={booth.exhibitor.website} 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#3b82f6', textDecoration: 'none' }}
                          >
                            Сайт →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {booths.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Всего стендов</div>
          </div>

          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {booths.filter(b => b.status === 'occupied').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Занято</div>
          </div>

          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {booths.reduce((sum, b) => sum + b.visitor_count, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Всего посещений</div>
          </div>

          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {booths.filter(b => b.rating > 0).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>С оценкой</div>
          </div>
        </div>

        {exhibition.status === 'active' || exhibition.status === 'upcoming' ? (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              🏢 Подать заявку на участие
            </button>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Станьте экспонентом на этой выставке
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
            Выставка завершена. Регистрация новых участников закрыта.
          </div>
        )}
      </div>
    </div>
  )
}