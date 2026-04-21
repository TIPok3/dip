// app/dashboard/organizer/exhibitions/[id]/page.tsx
// Страница управления выставкой (организатор)

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'
import Link from 'next/link'
import { getExhibitorApplications, updateExhibitorStatus } from '@/lib/supabase/queries'
import { Toast } from '@/app/components/Toast'

interface Exhibition {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  is_public: boolean
  require_registration: boolean
  visitor_count: number
  rating: number
  logo_url: string | null
  tags: string[]
  created_at: string
}

interface Pavilion {
  id: string
  name: string
  code: string
  rows: number
  columns: number
  position_x: number
  position_y: number
  width: number
  height: number
  background_color: string
  border_color: string
}

interface Booth {
  id: string
  number: string
  name: string
  status: 'available' | 'occupied' | 'reserved'
  exhibitor_id: string | null
  visitor_count: number
  rating: number
  tags: string[]
  grid_row: number
  grid_column: number
  pavilion_id: string
}

type Tab = 'overview' | 'pavilions' | 'applications'

export default function ExhibitionManagePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [pavilions, setPavilions] = useState<Pavilion[]>([])
  const [booths, setBooths] = useState<Booth[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Выставка
      const { data: exhibitionData, error: exhibitionError } = await supabase
        .from('exhibitions')
        .select('*')
        .eq('id', id)
        .single()
      if (exhibitionError) throw exhibitionError
      setExhibition(exhibitionData)

      // Павильоны
      const { data: pavilionsData, error: pavilionsError } = await supabase
        .from('pavilions')
        .select('*')
        .eq('exhibition_id', id)
        .order('position_x', { ascending: true })
      if (pavilionsError) throw pavilionsError
      setPavilions(pavilionsData || [])

      // Стенды
      const { data: boothsData, error: boothsError } = await supabase
        .from('booths')
        .select('*')
        .eq('exhibition_id', id)
      if (boothsError) throw boothsError
      setBooths(boothsData || [])

      // Заявки экспонентов
      const { data: appsData, error: appsError } = await getExhibitorApplications(id as string)
      if (appsError) throw appsError
      setApplications(appsData || [])
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      setToast({ message: 'Ошибка загрузки данных', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (exhibitorId: string, newStatus: 'approved' | 'rejected') => {
    setUpdating(exhibitorId)
    try {
      const { data: application, error: fetchError } = await supabase
        .from('exhibitors')
        .select('exhibition_id, user_id, company_name')
        .eq('id', exhibitorId)
        .single()

      if (fetchError) throw fetchError

      let assignedBoothId = null
      let boothNumber = null

      if (newStatus === 'approved') {
        // Ищем первый свободный стенд в этой выставке
        const { data: freeBooth, error: boothError } = await supabase
          .from('booths')
          .select('id, number')
          .eq('exhibition_id', application.exhibition_id)
          .eq('status', 'available')
          .order('number', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (boothError) throw boothError

        if (!freeBooth) {
          setToast({ message: 'Нет свободных стендов для назначения', type: 'error' })
          setUpdating(null)
          return
        }

        // Назначаем стенд экспоненту
        const { error: assignError } = await supabase
          .from('booths')
          .update({ exhibitor_id: exhibitorId, status: 'occupied' })
          .eq('id', freeBooth.id)

        if (assignError) throw assignError

        assignedBoothId = freeBooth.id
        boothNumber = freeBooth.number
      }

      // Обновляем статус заявки и сохраняем номер стенда
      const { error: updateError } = await supabase
        .from('exhibitors')
        .update({ 
          status: newStatus,
          booth_number: boothNumber
        })
        .eq('id', exhibitorId)

      if (updateError) throw updateError

      // Обновляем локальное состояние
      setApplications(prev =>
        prev.map(app =>
          app.id === exhibitorId 
            ? { ...app, status: newStatus, booth_number: boothNumber } 
            : app
        )
      )

      if (assignedBoothId) {
        setBooths(prev =>
          prev.map(booth =>
            booth.id === assignedBoothId 
              ? { ...booth, exhibitor_id: exhibitorId, status: 'occupied' } 
              : booth
          )
        )
      }

      setToast({ 
        message: newStatus === 'approved' 
          ? `Заявка одобрена, назначен стенд ${boothNumber || ''}` 
          : 'Заявка отклонена', 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Ошибка обновления статуса:', error)
      setToast({ message: error.message || 'Не удалось обновить статус', type: 'error' })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { text: 'Одобрено', style: { backgroundColor: '#d1fae5', color: '#065f46' } }
      case 'rejected':
        return { text: 'Отклонено', style: { backgroundColor: '#fee2e2', color: '#dc2626' } }
      default:
        return { text: 'На рассмотрении', style: { backgroundColor: '#fef3c7', color: '#92400e' } }
    }
  }

  const handleStatusChangeExhibition = async (newStatus: Exhibition['status']) => {
    if (!exhibition) return
    const { error } = await supabase
      .from('exhibitions')
      .update({ status: newStatus })
      .eq('id', exhibition.id)
    if (error) {
      setToast({ message: 'Ошибка обновления статуса', type: 'error' })
    } else {
      setExhibition({ ...exhibition, status: newStatus })
      setToast({ message: `Статус изменён на ${newStatus === 'active' ? 'Активна' : newStatus === 'draft' ? 'Черновик' : 'Завершена'}`, type: 'success' })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить выставку? Это действие необратимо.')) return
    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', exhibition?.id)
    if (error) {
      setToast({ message: 'Ошибка удаления', type: 'error' })
    } else {
      router.push('/dashboard/organizer')
    }
  }

  const renderOverview = () => {
    if (!exhibition) return null

    const getStatusColor = () => {
      switch (exhibition.status) {
        case 'active': return '#10b981'
        case 'draft': return '#f59e0b'
        case 'completed': return '#6b7280'
        case 'cancelled': return '#ef4444'
        default: return '#6b7280'
      }
    }

    const getStatusText = () => {
      switch (exhibition.status) {
        case 'active': return 'Активна'
        case 'draft': return 'Черновик'
        case 'completed': return 'Завершена'
        case 'cancelled': return 'Отменена'
        default: return exhibition.status
      }
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Описание</h3>
          <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '2rem' }}>
            {exhibition.description || 'Описание отсутствует'}
          </p>

          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Детали</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Категория</p>
              <p style={{ fontWeight: '500' }}>{exhibition.category || 'Не указана'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Даты</p>
              <p style={{ fontWeight: '500' }}>{exhibition.start_date} – {exhibition.end_date}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Посетителей</p>
              <p style={{ fontWeight: '500' }}>{exhibition.visitor_count.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Рейтинг</p>
              <p style={{ fontWeight: '500' }}>{exhibition.rating || 'Нет оценок'}</p>
            </div>
          </div>

          {exhibition.tags.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Теги</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {exhibition.tags.map(tag => (
                  <span key={tag} style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Статус выставки</h3>
            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', backgroundColor: getStatusColor() + '20', color: getStatusColor(), fontWeight: '500', marginBottom: '1rem' }}>
              {getStatusText()}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {exhibition.status !== 'active' && (
                <button onClick={() => handleStatusChangeExhibition('active')} style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  Опубликовать
                </button>
              )}
              {exhibition.status !== 'draft' && (
                <button onClick={() => handleStatusChangeExhibition('draft')} style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  В черновик
                </button>
              )}
              {exhibition.status !== 'completed' && (
                <button onClick={() => handleStatusChangeExhibition('completed')} style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  Завершить
                </button>
              )}
              <button onClick={handleDelete} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                Удалить
              </button>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Доступ</h3>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              {exhibition.is_public ? '🌐 Публичная' : '🔒 Приватная'}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {exhibition.require_registration ? '✅ Требуется регистрация' : '❌ Регистрация не требуется'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderPavilions = () => {
    if (pavilions.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
          <p>Павильоны не добавлены</p>
          <Link href={`/dashboard/organizer/exhibitions/${id}/edit`} style={{ color: '#2563eb', textDecoration: 'none' }}>
            Добавить павильоны →
          </Link>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {pavilions.map(pavilion => {
          const pavilionBooths = booths.filter(b => b.pavilion_id === pavilion.id)
          const columns = pavilion.columns
          const rows = pavilion.rows

          const cells = []
          for (let row = 1; row <= rows; row++) {
            for (let col = 1; col <= columns; col++) {
              const booth = pavilionBooths.find(b => b.grid_row === row && b.grid_column === col)
              const statusColor = booth?.status === 'occupied' ? '#10b981' : booth?.status === 'reserved' ? '#f59e0b' : '#d1d5db'
              cells.push(
                <div
                  key={`${pavilion.id}-${row}-${col}`}
                  style={{
                    backgroundColor: statusColor,
                    padding: '8px 4px',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: '#1f2937',
                  }}
                  title={booth?.number || 'Свободно'}
                >
                  {booth?.number || 'Свободно'}
                </div>
              )
            }
          }

          return (
            <div key={pavilion.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{pavilion.name}</h3>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rows}×{columns}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(70px, 1fr))`,
                gap: '6px',
                backgroundColor: pavilion.background_color,
                padding: '1rem',
                borderRadius: '0.5rem',
                overflowX: 'auto',
              }}>
                {cells}
              </div>
            </div>
          )
        })}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href={`/dashboard/organizer/exhibitions/${id}/edit`} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
            Редактировать павильоны
          </Link>
        </div>
      </div>
    )
  }

  const renderApplications = () => {
    if (applications.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
          <p>Пока нет заявок от экспонентов</p>
        </div>
      )
    }

    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Компания</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Контакт</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Статус</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const statusInfo = getStatusBadge(app.status)
              const isPending = app.status === 'pending'
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '500' }}>{app.company_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{app.description?.substring(0, 60)}...</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <div>{app.contact_email}</div>
                    {app.contact_phone && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{app.contact_phone}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ ...statusInfo.style, padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isPending && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          disabled={updating === app.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          disabled={updating === app.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                    {!isPending && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Выставка не найдена</h2>
        <Link href="/dashboard/organizer" style={{ color: '#2563eb', textDecoration: 'none' }}>Вернуться к списку</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard/organizer" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← К списку выставок
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{exhibition.title}</h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{exhibition.start_date} – {exhibition.end_date}</span>
              {exhibition.logo_url && (
                <img src={exhibition.logo_url} alt="logo" style={{ height: '32px', borderRadius: '0.25rem' }} />
              )}
            </div>
          </div>
          <div>
            <Link href={`/dashboard/organizer/exhibitions/${id}/edit`} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem', textDecoration: 'none', color: '#374151', marginRight: '0.5rem' }}>
              Редактировать
            </Link>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {(['overview', 'pavilions', 'applications'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
              }}
            >
              {tab === 'overview' && 'Обзор'}
              {tab === 'pavilions' && 'Павильоны и стенды'}
              {tab === 'applications' && 'Заявки экспонентов'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'pavilions' && renderPavilions()}
      {activeTab === 'applications' && renderApplications()}
    </div>
  )
}