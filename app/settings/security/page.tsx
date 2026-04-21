// app/settings/security/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../../providers'
import { supabase } from '@/lib/supabase/client'

export default function SecurityPage() {
  const { user } = useAuth()
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'MacBook Pro', location: 'Moscow', browser: 'Chrome', current: true, lastActive: 'Сейчас' }
  ])
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Новые пароли не совпадают')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Новый пароль должен содержать минимум 6 символов')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccessMessage('Пароль успешно обновлен!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('Ошибка обновления пароля:', error)
      setErrorMessage(error.message || 'Ошибка обновления пароля')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    setLoading(true)
    try {
      // TODO: Реализовать включение/выключение 2FA
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTwoFactorEnabled(!twoFactorEnabled)
      setSuccessMessage(twoFactorEnabled ? '2FA отключена' : '2FA включена')
    } catch (error) {
      setErrorMessage('Ошибка изменения настроек 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = (sessionId: number) => {
    // TODO: Реализовать завершение сессии
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
    setSuccessMessage('Сессия завершена')
  }

  if (!user) {
    return <div>Загрузка...</div>
  }

  return (
    <div>
      {/* Заголовок страницы */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Безопасность
        </h2>
        <p style={{ color: '#6b7280' }}>
          Управление паролем, двухфакторной аутентификацией и активными сессиями
        </p>
      </div>

      {/* Сообщения */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #a7f3d0'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #fecaca'
        }}>
          ❌ {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Изменить пароль */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#374151'
          }}>
            Изменить пароль
          </h3>

          <form onSubmit={handleUpdatePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Текущий пароль
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Введите текущий пароль"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Новый пароль
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Повторите новый пароль"
                  required
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Обновление...' : 'Обновить пароль'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Двухфакторная аутентификация */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Двухфакторная аутентификация
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {twoFactorEnabled ? 
                  '2FA включена. Для входа требуется код из приложения.' : 
                  'Добавьте дополнительный уровень защиты для вашего аккаунта'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                fontSize: '0.875rem',
                color: twoFactorEnabled ? '#10b981' : '#6b7280',
                fontWeight: '500'
              }}>
                {twoFactorEnabled ? 'Включена' : 'Отключена'}
              </span>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={handleToggle2FA}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: twoFactorEnabled ? '#10b981' : '#d1d5db',
                  transition: '.4s',
                  borderRadius: '24px',
                  opacity: loading ? 0.5 : 1
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '20px',
                    width: '20px',
                    left: '2px',
                    bottom: '2px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    transform: twoFactorEnabled ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>
          </div>

          {!twoFactorEnabled && (
            <button
              onClick={handleToggle2FA}
              disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              Включить
            </button>
          )}
        </div>

        {/* Активные сессии */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#374151'
          }}>
            Активные сессии
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeSessions.map((session) => (
              <div key={session.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {session.device}
                    </span>
                    {session.current && (
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px'
                      }}>
                        Текущая сессия
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <span>{session.location}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{session.browser}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{session.lastActive}</span>
                  </div>
                </div>

                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Завершить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}