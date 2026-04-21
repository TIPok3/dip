// app/dashboard/layout.tsx
'use client'

import { useAuth } from '../providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  // Перенаправление, если не авторизован
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
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

  if (!user) {
    return null // редирект уже происходит
  }

  const getRoleName = () => {
    switch (user.role) {
      case 'organizer': return 'Организатор'
      case 'exhibitor': return 'Экспонент'
      case 'visitor': return 'Посетитель'
      default: return 'Пользователь'
    }
  }

  // Общие ссылки для всех ролей
  const commonLinks = [
    { href: `/dashboard/${user.role}`, label: 'Дашборд' },
    { href: `/dashboard/${user.role}/exhibitions`, label: 'Мои выставки' },
    { href: '/exhibitions', label: 'Каталог выставок' },
    { href: '/settings', label: 'Настройки' }
  ]

  // Дополнительные ссылки для организатора
  const organizerLinks = [
    { href: '/dashboard/organizer/exhibitions/new', label: 'Создать выставку' }
  ]

  const navLinks = user.role === 'organizer'
    ? [...commonLinks, ...organizerLinks]
    : commonLinks

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href={`/dashboard/${user.role}`} style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#2563eb',
              textDecoration: 'none'
            }}>
              ExpoSphere
            </Link>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {getRoleName()}
                {user.company && ` • ${user.company}`}
              </p>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {children}
      </main>
    </div>
  )
}