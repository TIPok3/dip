// app/exhibitions/components/ExhibitionCard.tsx
'use client'

import Link from 'next/link'

interface ExhibitionCardProps {
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
    organizer: {
      name: string
      company?: string
    }
  }
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
}

export default function ExhibitionCard({ 
  exhibition, 
  getStatusColor, 
  getStatusText 
}: ExhibitionCardProps) {
  
  // Динамическое определение статуса на основе дат
  const getCurrentStatus = () => {
    const today = new Date()
    const startDate = new Date(exhibition.start_date)
    const endDate = new Date(exhibition.end_date)
    
    if (today < startDate) return 'upcoming'
    if (today > endDate) return 'completed'
    return 'active'
  }

  const currentStatus = getCurrentStatus()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Заголовок с логотипом */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Логотип выставки */}
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
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
                  borderRadius: '0.5rem'
                }}
              />
            ) : (
              <div style={{
                fontSize: '1.25rem',
                color: '#6b7280',
                fontWeight: 'bold'
              }}>
                {exhibition.title.charAt(0)}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.3'
              }}>
                {exhibition.title}
              </h3>
              
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: getStatusColor(currentStatus) + '15',
                color: getStatusColor(currentStatus),
                borderRadius: '9999px',
                fontWeight: '500',
                border: `1px solid ${getStatusColor(currentStatus)}30`
              }}>
                {getStatusText(currentStatus)}
              </span>
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              {exhibition.description.length > 120 
                ? `${exhibition.description.substring(0, 120)}...` 
                : exhibition.description}
            </p>
          </div>
        </div>
      </div>

      {/* Информация о выставке */}
      <div style={{
        padding: '1.25rem 1.5rem',
        flex: 1
      }}>
        {/* Категория и даты */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <span style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '0.375rem',
            fontWeight: '500'
          }}>
            {exhibition.category}
          </span>
          
          <div style={{ color: '#6b7280' }}>
            {formatDate(exhibition.start_date)} – {formatDate(exhibition.end_date)}
          </div>
        </div>

        {/* Теги */}
        {exhibition.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.375rem',
            marginBottom: '1.25rem'
          }}>
            {exhibition.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '0.25rem'
                }}
              >
                #{tag}
              </span>
            ))}
            {exhibition.tags.length > 3 && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                color: '#6b7280'
              }}>
                +{exhibition.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.25rem'
            }}>
              Посетители
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827'
            }}>
              {exhibition.visitor_count.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.25rem'
            }}>
              Рейтинг
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {exhibition.rating.toFixed(1)}
              <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>★</span>
            </div>
          </div>
        </div>

        {/* Организатор */}
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #f3f4f6',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Организатор: <span style={{ fontWeight: '500', color: '#374151' }}>
            {exhibition.organizer.name}
          </span>
          {exhibition.organizer.company && (
            <span style={{ marginLeft: '0.5rem' }}>
              • {exhibition.organizer.company}
            </span>
          )}
        </div>
      </div>

      {/* Кнопка действия - только "Подробнее" */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
      }}>
        <Link 
          href={`/exhibitions/${exhibition.id}`}
          style={{
            display: 'block',
            padding: '0.625rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontWeight: '500',
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s'
          }}
        >
          Подробнее
        </Link>
      </div>
    </div>
  )
}