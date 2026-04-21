// app/exhibitions/[id]/components/ExhibitionHeader.tsx
'use client'

import Link from 'next/link'
import RatingStars from './RatingStars'

interface ExhibitionHeaderProps {
  exhibition: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    category: string
    status: 'active' | 'upcoming' | 'completed' | 'draft'
    visitor_count: number
    rating: number
    logo_url?: string
    tags: string[]
  }
  onRegister: () => void
  user: any
  isRegistered?: boolean
  onRatingUpdate?: (newRating: number) => void
}

export default function ExhibitionHeader({
  exhibition,
  onRegister,
  user,
  isRegistered = false,
  onRatingUpdate
}: ExhibitionHeaderProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'upcoming': return '#3b82f6'
      case 'completed': return '#6b7280'
      case 'draft': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна'
      case 'upcoming': return 'Скоро'
      case 'completed': return 'Завершена'
      case 'draft': return 'Черновик'
      default: return status
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link 
            href="/exhibitions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ← Вернуться к каталогу
          </Link>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {exhibition.logo_url ? (
                  <img 
                    src={exhibition.logo_url} 
                    alt={exhibition.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '0.75rem'
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: '1.5rem',
                    color: '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    {exhibition.title.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: '#111827'
                  }}>
                    {exhibition.title}
                  </h1>
                  
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: getStatusColor(exhibition.status) + '15',
                    color: getStatusColor(exhibition.status),
                    borderRadius: '9999px',
                    fontWeight: '500',
                    border: `1px solid ${getStatusColor(exhibition.status)}30`
                  }}>
                    {getStatusText(exhibition.status)}
                  </span>
                </div>

                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {exhibition.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #f3f4f6'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Даты проведения
                </div>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {formatDate(exhibition.start_date)} – {formatDate(exhibition.end_date)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Категория
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  fontWeight: '500'
                }}>
                  {exhibition.category}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Посетителей
                </div>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {exhibition.visitor_count.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Рейтинг
                </div>
                <RatingStars
                  exhibitionId={exhibition.id}
                  currentRating={exhibition.rating}
                  onRatingUpdate={onRatingUpdate}
                />
              </div>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            {exhibition.status === 'active' || exhibition.status === 'upcoming' ? (
              <button
                onClick={onRegister}
                disabled={isRegistered}
                style={{
                  padding: '0.875rem 1.5rem',
                  backgroundColor: isRegistered ? '#9ca3af' : (user ? '#3b82f6' : '#10b981'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: isRegistered ? 'not-allowed' : 'pointer',
                  minWidth: '180px',
                  transition: 'background-color 0.2s'
                }}
              >
                {isRegistered ? '✓ Вы зарегистрированы' : (user ? 'Зарегистрироваться' : 'Войти для регистрации')}
              </button>
            ) : (
              <div style={{
                padding: '0.875rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                Выставка завершена
              </div>
            )}
          </div>
        </div>

        {exhibition.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f3f4f6'
          }}>
            {exhibition.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '0.375rem'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}