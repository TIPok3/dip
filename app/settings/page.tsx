// app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../providers'
import { supabase } from '@/lib/supabase/client'
import { updateUserProfile } from '@/lib/supabase/queries'

export default function SettingsProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    position: '',
    about: '',
    website: '',
    avatar_url: '',
  })

  useEffect(() => {
    if (!user) return

    // Загружаем данные профиля
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data) {
        setFormData({
          name: data.name || '',
          email: data.email || user.email || '',
          company: data.company || '',
          phone: data.phone || '',
          position: data.position || '',
          about: data.about || '',
          website: data.website || '',
          avatar_url: data.avatar_url || '',
        })
      } else {
        // Фолбек на данные из Auth
        setFormData({
          name: user.name || '',
          email: user.email || '',
          company: user.company || '',
          phone: '',
          position: '',
          about: '',
          website: '',
          avatar_url: user.avatar_url || '',
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      // 1. Обновляем метаданные в Auth (для быстрого доступа)
      await supabase.auth.updateUser({
        data: {
          name: formData.name.trim(),
          company: formData.company.trim() || null,
        },
      })

      // 2. Обновляем профиль в user_profiles
      const { error } = await updateUserProfile(user.id, {
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim() || undefined,
        about: formData.about.trim() || undefined,
        website: formData.website.trim() || undefined,
        avatar_url: formData.avatar_url.trim() || undefined,
      })

      if (error) throw error

      setSuccessMessage('Профиль успешно обновлен!')

      // Обновляем пользователя в контексте
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      setErrorMessage(error.message || 'Ошибка сохранения профиля')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Файл слишком большой (макс. 2MB)')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Загрузите изображение (JPG, PNG)')
      return
    }

    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const avatarUrl = publicUrl

      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }))

      // Сохраняем в БД
      await updateUserProfile(user.id, { avatar_url: avatarUrl })

      setSuccessMessage('Аватар обновлен!')
    } catch (error: any) {
      console.error('Ошибка загрузки аватара:', error)
      setErrorMessage(error.message || 'Ошибка загрузки аватара')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Загрузка...</div>
  }

  if (loading) {
    return <div>Загрузка профиля...</div>
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
          Профиль
        </h2>
        <p style={{ color: '#6b7280' }}>Управление основной информацией и аватаром</p>
      </div>

      {/* Сообщения */}
      {successMessage && (
        <div
          style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '3rem',
        }}
      >
        {/* Левая колонка - Аватар */}
        <div>
          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: formData.avatar_url ? 'transparent' : '#3b82f6',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Аватар"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <label
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                marginBottom: '0.5rem',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={loading}
              />
              {loading ? 'Загрузка...' : 'Изменить фото'}
            </label>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.5rem',
              }}
            >
              JPG, PNG. Макс. 2MB
            </p>
          </div>
        </div>

        {/* Правая колонка - Форма */}
        <div>
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#374151',
                }}
              >
                Основная информация
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                  placeholder="Ваше имя"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                  }}
                  readOnly
                  disabled
                />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.5rem',
                  }}
                >
                  Email нельзя изменить
                </p>
              </div>

              {(user.role === 'organizer' || user.role === 'exhibitor') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '0.875rem',
                    }}
                  >
                    Компания
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                    }}
                    placeholder="Название компании"
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Должность
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                  placeholder="Ваша должность"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Веб-сайт
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                  placeholder="https://example.com"
                />
              </div>

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
                  О себе
                </label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    minHeight: '120px',
                    resize: 'vertical',
                  }}
                  placeholder="Расскажите о себе..."
                  rows={4}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
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
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
