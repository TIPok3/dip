// app/settings/preferences/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { supabase } from '@/lib/supabase/client'
import { updateUserProfile } from '@/lib/supabase/queries'

interface Preferences {
  language: string
  timezone: string
  dateFormat: string
  theme: string
  compactMode: boolean
}

export default function PreferencesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [preferences, setPreferences] = useState<Preferences>({
    language: 'ru',
    timezone: 'Europe/Moscow',
    dateFormat: 'DD.MM.YYYY',
    theme: 'light',
    compactMode: false,
  })

  useEffect(() => {
    if (!user) return
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.log('Настройки не найдены в БД, используем значения по умолчанию')
      } else if (profile?.preferences) {
        setPreferences((prev) => ({
          ...prev,
          ...profile.preferences,
        }))
      }
    } catch (error) {
      console.error('Ошибка загрузки предпочтений:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Preferences, value: string | boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const { error } = await updateUserProfile(user.id, {
        preferences: preferences,
      })

      if (error) throw error

      // Сохраняем в метаданные Auth
      await supabase.auth.updateUser({
        data: { preferences: preferences },
      })

      setSuccessMessage('Настройки предпочтений сохранены!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      setErrorMessage(`Ошибка сохранения: ${error.message}`)

      // Фолбек
      localStorage.setItem(`prefs_${user.id}`, JSON.stringify(preferences))
      setSuccessMessage('Сохранено локально')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
        }}
      >
        <p>Загрузка...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
        }}
      >
        <p>Загрузка настроек...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Заголовок страницы */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          Предпочтения
        </h2>
        <p style={{ color: '#6b7280' }}>Настройка языка, формата даты и отображения</p>
      </div>

      {/* Сообщения */}
      {successMessage && (
        <div
          style={{
            backgroundColor: successMessage.includes('локально') ? '#fef3c7' : '#d1fae5',
            color: successMessage.includes('локально') ? '#92400e' : '#065f46',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #a7f3d0',
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
          }}
        >
          ❌ {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Язык */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#374151',
            }}
          >
            Язык
          </h3>

          <select
            value={preferences.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: 'white',
            }}
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* Часовой пояс */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#374151',
            }}
          >
            Часовой пояс
          </h3>

          <select
            value={preferences.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: 'white',
            }}
          >
            <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
            <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
          </select>
        </div>

        {/* Формат даты */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#374151',
            }}
          >
            Формат даты
          </h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { value: 'DD.MM.YYYY', label: 'ДД.ММ.ГГГГ (15.12.2024)' },
              { value: 'YYYY-MM-DD', label: 'ГГГГ-ММ-ДД (2024-12-15)' },
              { value: 'MM/DD/YYYY', label: 'ММ/ДД/ГГГГ (12/15/2024)' },
              { value: 'DD MMM YYYY', label: 'ДД МММ ГГГГ (15 дек 2024)' },
            ].map((format) => (
              <label
                key={format.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: preferences.dateFormat === format.value ? '#dbeafe' : 'white',
                  border: `1px solid ${preferences.dateFormat === format.value ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px',
                }}
              >
                <input
                  type="radio"
                  name="dateFormat"
                  value={format.value}
                  checked={preferences.dateFormat === format.value}
                  onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${preferences.dateFormat === format.value ? '#3b82f6' : '#9ca3af'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {preferences.dateFormat === format.value && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: '0.875rem' }}>{format.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Отображение */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#374151',
            }}
          >
            Отображение
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Тема */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '0.875rem',
                }}
              >
                Тема
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
                <option value="system">Как в системе</option>
                <option value="auto">Автоматически</option>
              </select>
            </div>

            {/* Компактный режим */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <div>
                <p style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Компактный режим
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Уменьшает отступы и размеры элементов интерфейса
                </p>
              </div>

              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => handleInputChange('compactMode', e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.compactMode ? '#10b981' : '#d1d5db',
                    transition: '.4s',
                    borderRadius: '24px',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '2px',
                      bottom: '2px',
                      backgroundColor: 'white',
                      transition: '.4s',
                      borderRadius: '50%',
                      transform: preferences.compactMode ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  )
}