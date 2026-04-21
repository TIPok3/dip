// app/dashboard/organizer/exhibitions/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  getExhibitionById,
  updateExhibition,
  getPavilionsByExhibition,
  createPavilion,
  generateBoothsForPavilion,
} from '@/lib/supabase/queries'
import StepBasicInfo from '../../new/components/StepBasicInfo'
import StepPavilions from '../../new/components/StepPavilions'
import StepSettings from '../../new/components/StepSettings'
import { Toast } from '@/app/components/Toast'
import { Pavilion } from '../../new/components/types'

type Step = 'basic' | 'pavilions' | 'settings'

export default function EditExhibitionPage() {
  const { id } = useParams() as { id: string } // ← явное указание типа
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!id) return
    const loadExhibition = async () => {
      setLoading(true)
      try {
        // Загружаем выставку
        const { data, error } = await getExhibitionById(id)
        if (error) throw error
        if (!data) throw new Error('Выставка не найдена')

        // Загружаем павильоны
        const { data: pavilionsData, error: pavilionsError } = await getPavilionsByExhibition(id)
        if (pavilionsError) throw pavilionsError

        // Преобразуем павильоны в формат, ожидаемый компонентами
        const formattedPavilions: Pavilion[] = (pavilionsData || []).map(
          (p: {
            id: string
            name: string
            rows: number
            columns: number
            position_x: number
            position_y: number
            width: number
            height: number
            background_color: string
          }) => ({
            id: p.id,
            name: p.name,
            position: { x: p.position_x, y: p.position_y },
            size: { width: p.width, height: p.height },
            color: p.background_color,
            boothRows: p.rows,
            boothColumns: p.columns,
          })
        )

        setFormData({
          title: data.title || '',
          description: data.description || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          category: data.category || '',
          logo_url: data.logo_url || null,
          tags: data.tags || [],
          pavilions: formattedPavilions,
          is_public: data.is_public ?? true,
          require_registration: data.require_registration ?? true,
        })
      } catch (error: any) {
        console.error('Ошибка загрузки выставки:', error)
        setToast({ message: error.message || 'Не удалось загрузить данные', type: 'error' })
        router.push('/dashboard/organizer')
      } finally {
        setLoading(false)
      }
    }
    loadExhibition()
  }, [id, router])

  const updateFormData = (data: Partial<any>) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const handleLogoUpload = async (file: File) => {
    const user = (await supabase.auth.getUser()).data.user
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
      setToast({ message: 'Не удалось загрузить логотип', type: 'error' })
      return null
    }
  }

  const handleSave = async () => {
    if (!formData) return
    setSaving(true)

    try {
      // 1. Обновляем основные поля выставки
      const { error: updateError } = await updateExhibition(id, {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        category: formData.category,
        is_public: formData.is_public,
        require_registration: formData.require_registration,
        tags: formData.tags,
        logo_url: formData.logo_url,
      })
      if (updateError) throw updateError

      // 2. Синхронизируем павильоны
      const { data: existingPavilions, error: fetchError } = await getPavilionsByExhibition(id)
      if (fetchError) throw fetchError

      const existingIds = new Set(existingPavilions?.map((p: any) => p.id) || [])
      const newIds = new Set(formData.pavilions.map((p: Pavilion) => p.id).filter(Boolean))

      // Удаляем павильоны, которых нет в форме
      for (const pav of existingPavilions || []) {
        if (!newIds.has(pav.id)) {
          await supabase.from('pavilions').delete().eq('id', pav.id)
        }
      }

      // Обновляем или создаём павильоны
      for (const pavilion of formData.pavilions) {
        const pavilionData = {
          name: pavilion.name,
          code: pavilion.name.split(' ')[1] || 'A',
          rows: pavilion.boothRows,
          columns: pavilion.boothColumns,
          position_x: pavilion.position.x,
          position_y: pavilion.position.y,
          width: pavilion.size.width,
          height: pavilion.size.height,
          background_color: pavilion.color,
          border_color: '#e5e7eb',
          layout_type: 'grid' as const,
        }

        if (pavilion.id && existingIds.has(pavilion.id)) {
          // Обновляем существующий павильон
          await supabase.from('pavilions').update(pavilionData).eq('id', pavilion.id)
        } else {
          // Создаём новый павильон
          const { data: newPavilion, error: createError } = await createPavilion({
            exhibition_id: id,
            ...pavilionData,
          })
          if (createError) throw createError
          if (newPavilion) {
            await generateBoothsForPavilion(newPavilion.id)
          }
        }
      }

      setToast({ message: 'Изменения сохранены', type: 'success' })
      setTimeout(() => {
        router.push(`/dashboard/organizer/exhibitions/${id}`)
      }, 1000)
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      setToast({ message: error.message || 'Не удалось сохранить изменения', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!formData) {
    return <div>Ошибка загрузки данных</div>
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/dashboard/organizer/exhibitions/${id}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Вернуться к управлению выставкой
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Редактирование выставки</h2>

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
            onNext={handleSave}
            onBack={() => setCurrentStep('pavilions')}
            loading={saving}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  )
}