// app/settings/layout.tsx - LAYOUT С САЙДБАРОМ
'use client'

import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }

    // Определяем активную вкладку по URL
    if (pathname.includes('/settings/security')) {
      setActiveTab('security')
    } else if (pathname.includes('/settings/preferences')) {
      setActiveTab('preferences')
    } else if (pathname.includes('/settings/payments')) {
      setActiveTab('payments')
    } else {
      setActiveTab('profile')
    }
  }, [user, router, pathname])

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Загрузка...</p>
      </div>
    )
  }

  // Навигационные пункты
  const navItems = [
    { id: 'profile', label: 'Профиль', icon: '👤', path: '/settings' },
    { id: 'security', label: 'Безопасность', icon: '🔒', path: '/settings/security' },
    { id: 'preferences', label: 'Предпочтения', icon: '🎨', path: '/settings/preferences' }
  ]

  // Добавляем платежи только для организаторов
  if (user.role === 'organizer') {
    navItems.push({ id: 'billing', label: 'Платежи', icon: '💳', path: '/settings/payments' })
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', // Высота минус header
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Заголовок */}
        <div style={{ padding: '2rem 0 1.5rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Настройки
          </h1>
          <p style={{ color: '#6b7280' }}>
            Управление аккаунтом и предпочтениями
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          minHeight: '600px'
        }}>
          {/* Сайдбар слева */}
          <div style={{
            width: '280px',
            flexShrink: 0
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    textDecoration: 'none',
                    color: activeTab === item.id ? '#2563eb' : '#374151',
                    backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                    borderLeft: activeTab === item.id ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span style={{
                    fontSize: '1.25rem',
                    marginRight: '0.75rem',
                    width: '24px',
                    textAlign: 'center'
                  }}>
                    {item.icon}
                  </span>
                  <span style={{
                    fontWeight: activeTab === item.id ? '600' : '500',
                    fontSize: '0.875rem'
                  }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Информация о пользователе */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              marginTop: '1rem',
              padding: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  marginRight: '0.75rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {user.name}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {user.role === 'organizer' ? 'Организатор' :
                     user.role === 'exhibitor' ? 'Экспонент' : 'Посетитель'}
                  </p>
                </div>
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '0.75rem'
              }}>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.company && (
                  <p>
                    <strong>Компания:</strong> {user.company}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Основной контент справа */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '2rem'
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}