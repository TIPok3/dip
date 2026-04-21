// app/dashboard/organizer/exhibitions/new/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { createExhibition } from '@/lib/supabase/queries'
import StepBasicInfo from './components/StepBasicInfo'
import StepPavilions from './components/StepPavilions'
import StepSettings from './components/StepSettings'
import { ExhibitionFormData } from './components/types'
import { Toast } from '@/app/components/Toast'

type Step = 'basic' | 'pavilions' | 'settings'

const generateId = (): string => Math.random().toString(36).substr(2, 9)

export default function NewExhibitionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [formData, setFormData] = useState<ExhibitionFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category: '',
    logo_url: null,
    tags: [],
    pavilions: [
      {
        id: generateId(),
        name: 'Павильон A',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        color: '#f9fafb',
        boothRows: 2,
        boothColumns: 3,
      }
    ],
    is_public: true,
    require_registration: true
  })

  const updateFormData = (data: Partial<ExhibitionFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleLogoUpload = async (file: File) => {
    if (!user) return null
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `exhibitions/logos/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('exhibitions')
        .upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('exhibitions')
        .getPublicUrl(filePath)
      return publicUrl
    } catch (error) {
      console.error('Ошибка загрузки логотипа:', error)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setToast({ message: 'Пользователь не авторизован', type: 'error' })
      setLoading(false)
      return
    }
    setLoading(true)

    let exhibitionId = null

    try {
      console.log('🚀 Создание выставки...')

      const { data: exhibition, error: exhibitionError } = await createExhibition({
        organizer_id: user.id,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        category: formData.category,
        is_public: formData.is_public,
        require_registration: formData.require_registration,
        tags: formData.tags
      })

      if (exhibitionError) {
        console.error('❌ Ошибка при создании выставки:', exhibitionError)
        throw exhibitionError
      }
      if (!exhibition) throw new Error('Не удалось создать выставку')

      exhibitionId = exhibition.id
      console.log('✅ Выставка создана, ID:', exhibitionId)

      // Сохраняем павильоны и стенды
      for (const pavilion of formData.pavilions) {
        const pavilionCode = pavilion.name.split(' ')[1] || 
          String.fromCharCode(65 + formData.pavilions.indexOf(pavilion))

        console.log(`📦 Сохраняем павильон: ${pavilion.name}`)

        const { data: pavilionData, error: pavilionError } = await supabase
          .from('pavilions')
          .insert({
            exhibition_id: exhibitionId,
            name: pavilion.name,
            code: pavilionCode,
            rows: pavilion.boothRows,
            columns: pavilion.boothColumns,
            position_x: pavilion.position.x,
            position_y: pavilion.position.y,
            width: pavilion.size.width,
            height: pavilion.size.height,
            background_color: pavilion.color,
            border_color: '#e5e7eb',
            layout_type: 'grid'
          })
          .select()
          .single()

        if (pavilionError) {
          console.error(`❌ Ошибка сохранения павильона ${pavilion.name}:`, pavilionError)
          continue
        }

        console.log(`✅ Павильон сохранён, ID: ${pavilionData.id}`)

        const boothsToInsert = []
        let boothCounter = 1
        for (let row = 1; row <= pavilion.boothRows; row++) {
          for (let col = 1; col <= pavilion.boothColumns; col++) {
            boothsToInsert.push({
              exhibition_id: exhibitionId,
              pavilion_id: pavilionData.id,
              number: `${pavilionCode}${String(row).padStart(2, '0')}${String(col).padStart(2, '0')}`,
              name: `Стенд ${boothCounter}`,
              description: null,
              status: 'available',
              grid_row: row,
              grid_column: col,
              visitor_count: 0,
              rating: 0,
              tags: []
            })
            boothCounter++
          }
        }

        if (boothsToInsert.length > 0) {
          const { error: boothsError } = await supabase
            .from('booths')
            .insert(boothsToInsert)

          if (boothsError) {
            console.error(`❌ Ошибка сохранения стендов для павильона ${pavilion.name}:`, boothsError)
          } else {
            console.log(`✅ Сохранено ${boothsToInsert.length} стендов`)
          }
        }
      }

      console.log('🏁 Все данные сохранены, перенаправляем...')
      router.push(`/dashboard/organizer/exhibitions/${exhibitionId}`)
    } catch (error: any) {
      console.error('💥 Ошибка при создании выставки:', error)
      if (!exhibitionId) {
        setToast({ message: error?.message || 'Ошибка создания выставки. Попробуйте снова.', type: 'error' })
      } else {
        console.warn('⚠️ Выставка создана, но возникли проблемы при сохранении павильонов/стендов.')
        router.push(`/dashboard/organizer/exhibitions/${exhibitionId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem'
    }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/dashboard/organizer" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Вернуться к дашборду
          </Link>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Создание новой выставки
          </h1>
          <p style={{ color: '#6b7280' }}>
            Заполните информацию о выставке, настройте павильоны и опубликуйте
          </p>
        </div>

        {/* Прогресс-бар */}
        <div style={{ display: 'flex', marginBottom: '3rem', position: 'relative' }}>
          {[
            { step: 'basic', label: 'Основная информация' },
            { step: 'pavilions', label: 'Павильоны' },
            { step: 'settings', label: 'Настройки' }
          ].map((item, index) => {
            const step = item.step as Step
            const isActive = currentStep === step
            const isCompleted = ['basic', 'pavilions', 'settings'].indexOf(currentStep) > index

            return (
              <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {index > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: 'calc(-50% + 40px)',
                    width: 'calc(100% - 80px)',
                    height: '2px',
                    backgroundColor: isCompleted ? '#3b82f6' : '#e5e7eb',
                    zIndex: 1
                  }} />
                )}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#f3f4f6',
                  color: isActive || isCompleted ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  zIndex: 2,
                  border: isActive ? '2px solid #93c5fd' : 'none'
                }}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: isActive ? '600' : '500', color: isActive ? '#3b82f6' : '#6b7280' }}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Основной контент */}
        {currentStep === 'basic' && (
          <StepBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => setCurrentStep('pavilions')}
            onLogoUpload={handleLogoUpload}
          />
        )}

        {currentStep === 'pavilions' && (
          <StepPavilions
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => setCurrentStep('settings')}
            onBack={() => setCurrentStep('basic')}
          />
        )}

        {currentStep === 'settings' && (
          <StepSettings
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmit}
            onBack={() => setCurrentStep('pavilions')}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}