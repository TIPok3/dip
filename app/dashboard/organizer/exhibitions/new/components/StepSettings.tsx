// app/dashboard/organizer/exhibitions/new/components/StepSettings.tsx

'use client'

import { useState } from 'react'

interface StepSettingsProps {
  formData: {
    title: string
    description: string
    start_date: string
    end_date: string
    category: string
    logo_url: string | null
    tags: string[]
    pavilions: any[]
    is_public: boolean
    require_registration: boolean
  }
  updateFormData: (data: Partial<any>) => void
  onNext: () => void
  onBack: () => void
  loading: boolean
  isEditMode?: boolean   // добавлено
}

export default function StepSettings({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack,
  loading,
  isEditMode = false   // по умолчанию false
}: StepSettingsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onNext()
    }
  }

  const totalBooths = formData.pavilions.reduce(
    (sum, pavilion) => sum + (pavilion.boothRows * pavilion.boothColumns), 
    0
  )

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#374151'
      }}>
        Настройки и публикация
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        {/* Левая колонка – настройки доступа */}
        <div>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              Доступ к выставке
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="radio"
                  id="public"
                  checked={formData.is_public}
                  onChange={() => updateFormData({ is_public: true })}
                  style={{
                    marginTop: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <label htmlFor="public" style={{
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#374151',
                    cursor: 'pointer'
                  }}>
                    Публичная выставка
                  </label>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Доступна всем пользователям платформы
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <input
                  type="radio"
                  id="private"
                  checked={!formData.is_public}
                  onChange={() => updateFormData({ is_public: false })}
                  style={{
                    marginTop: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <label htmlFor="private" style={{
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#374151',
                    cursor: 'pointer'
                  }}>
                    Приватная выставка
                  </label>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Только по приглашениям
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.require_registration}
                  onChange={(e) => updateFormData({ require_registration: e.target.checked })}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <span style={{
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    Требовать регистрацию
                  </span>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Посетители должны зарегистрироваться
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Правая колонка – предпросмотр */}
        <div>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#374151'
            }}>
              Предпросмотр выставки
            </h3>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                height: '120px',
                backgroundColor: formData.logo_url ? 'transparent' : '#3b82f6',
                backgroundImage: formData.logo_url ? `url(${formData.logo_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!formData.logo_url && (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {formData.title.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  {formData.title || 'Название выставки'}
                </h4>

                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1rem',
                  lineHeight: '1.5'
                }}>
                  {formData.description?.substring(0, 100)}...
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.75rem'
                }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Даты:</span>
                    <div style={{ fontWeight: '500', color: '#374151' }}>
                      {formData.start_date || 'ДД.ММ.ГГГГ'} - {formData.end_date || 'ДД.ММ.ГГГГ'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Категория:</span>
                    <div style={{ fontWeight: '500', color: '#374151' }}>
                      {formData.category || 'Не выбрана'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                      {formData.pavilions.length}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Павильонов</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                      {totalBooths}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Стендов</div>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: formData.is_public ? '#d1fae5' : '#fef3c7',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: formData.is_public ? '#065f46' : '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{formData.is_public ? '🌐' : '🔒'}</span>
                  <span>
                    {formData.is_public ? 'Публичная' : 'Приватная'}
                    {formData.require_registration && ' • Требуется регистрация'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          ← Назад
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isEditMode ? '#2563eb' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <span style={{
                display: 'inline-block',
                width: '1rem',
                height: '1rem',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Сохранение...
            </>
          ) : (
            isEditMode ? 'Сохранить изменения' : '📢 Опубликовать выставку'
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}