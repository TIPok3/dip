// app/dashboard/organizer/exhibitions/new/components/StepBasicInfo.tsx
'use client'

import { useState } from 'react'
import { Toast } from '@/app/components/Toast'

interface StepBasicInfoProps {
  formData: {
    title: string
    description: string
    start_date: string
    end_date: string
    category: string
    logo_url: string | null
    tags: string[]
  }
  updateFormData: (data: Partial<any>) => void
  onNext: () => void
  onLogoUpload: (file: File) => Promise<string | null>
}

const categories = [
  'Технологии',
  'Здравоохранение',
  'Финансы',
  'Образование',
  'Экология',
  'Недвижимость',
  'Маркетинг',
  'Стартапы'
]

export default function StepBasicInfo({ 
  formData, 
  updateFormData, 
  onNext,
  onLogoUpload 
}: StepBasicInfoProps) {
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Название обязательно'
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
    if (!formData.start_date) newErrors.start_date = 'Дата начала обязательна'
    if (!formData.end_date) newErrors.end_date = 'Дата окончания обязательна'
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'Дата окончания не может быть раньше даты начала'
      }
    }
    
    if (!formData.category) newErrors.category = 'Выберите категорию'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData({ 
        tags: [...formData.tags, tagInput.trim().toLowerCase()] 
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({ 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Файл слишком большой (макс. 5MB)', type: 'error' })
      return
    }

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Загрузите изображение (PNG, JPG)', type: 'error' })
      return
    }

    setUploading(true)
    const url = await onLogoUpload(file)
    if (url) updateFormData({ logo_url: url })
    setUploading(false)
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#374151'
      }}>
        Основная информация
      </h2>

      {/* остальной JSX без изменений */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Название */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Название выставки *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Digital Tech Expo 2025"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.title ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.title && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.title}
            </p>
          )}
        </div>

        {/* Описание */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Описание *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Расскажите о вашей выставке..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
          {errors.description && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.description}
            </p>
          )}
        </div>

        {/* Даты */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Дата начала *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.start_date ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            {errors.start_date && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.start_date}
              </p>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Дата окончания *
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.end_date ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            {errors.end_date && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.end_date}
              </p>
            )}
          </div>
        </div>

        {/* Категория */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Категория *
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateFormData({ category: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.category ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.category}
            </p>
          )}
        </div>

        {/* Логотип */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Логотип выставки
          </label>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {formData.logo_url ? (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={formData.logo_url} 
                  alt="Logo preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => updateFormData({ logo_url: null })}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <label style={{
                padding: '2rem',
                border: '2px dashed #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                flex: 1
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {uploading ? (
                    'Загрузка...'
                  ) : (
                    <>
                      <span style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Нажмите или перетащите файл
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        PNG, JPG до 5MB
                      </span>
                    </>
                  )}
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Теги */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Теги
          </label>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Введите тег и нажмите Enter"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
            <button
              onClick={handleAddTag}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Добавить
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {formData.tags.map(tag => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0 0.25rem'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {formData.tags.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Пока нет тегов
              </span>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            ← Отмена
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Далее: Конструктор павильонов →
          </button>
        </div>
      </div>
    </div>
  )
}