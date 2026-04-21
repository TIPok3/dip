// app/exhibitions/[id]/components/ExhibitionMap.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Toast } from '@/app/components/Toast'

interface Booth {
  id: string
  number: string
  name: string
  description: string
  status: 'available' | 'occupied' | 'reserved'
  visitor_count: number
  category: string
  tags: string[]
  exhibitor?: {
    company_name: string
    contact_email: string
  }
}

interface Pavilion {
  id: string
  name: string
  code: string
  rows: number
  columns: number
  width: number
  height: number
  background_color: string
}

interface ExhibitionMapProps {
  booths: Booth[]
  pavilions?: Pavilion[]
  exhibitionId: string
  exhibitionTitle: string
}

export default function ExhibitionMap({ booths, pavilions = [], exhibitionId, exhibitionTitle }: ExhibitionMapProps) {
  const [selectedPavilionId, setSelectedPavilionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapStats, setMapStats] = useState({
    totalBooths: 0,
    occupiedBooths: 0,
    availableBooths: 0
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const total = booths.length
    const occupied = booths.filter(b => b.status === 'occupied').length
    const available = booths.filter(b => b.status === 'available').length
    setMapStats({ totalBooths: total, occupiedBooths: occupied, availableBooths: available })
  }, [booths])

  useEffect(() => {
    if (pavilions.length > 0 && !selectedPavilionId) {
      setSelectedPavilionId(pavilions[0].id)
    }
  }, [pavilions, selectedPavilionId])

  const getBoothColor = (booth: Booth | null | undefined) => {
    if (!booth) return '#f3f4f6'
    switch (booth.status) {
      case 'occupied': return '#d1fae5'
      case 'reserved': return '#fef3c7'
      case 'available': return '#dbeafe'
      default: return '#f3f4f6'
    }
  }

  const handleConsultationRequest = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setToast({ message: 'Пожалуйста, войдите в систему для заказа консультации', type: 'error' })
        return
      }
      setToast({ message: 'Заявка на консультацию будет реализована позже', type: 'info' })
    } catch (error) {
      console.error('Ошибка заказа консультации:', error)
      setToast({ message: 'Ошибка при отправке заявки', type: 'error' })
    }
  }

  // Остальной код (логика генерации layout, рендер) – без изменений
  const useRealPavilions = pavilions.length > 0
  const legacyPavilions = Array.from(new Set(booths.map(b => b.number.charAt(0).toUpperCase()))).sort().slice(0, 5)

  const selectedPavilion = useRealPavilions
    ? pavilions.find(p => p.id === selectedPavilionId)
    : { code: selectedPavilionId, name: `Павильон ${selectedPavilionId}`, rows: 6, columns: 4, width: 800, height: 600, background_color: '#f9fafb' }

  if (!selectedPavilion && !useRealPavilions && legacyPavilions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Павильоны не найдены</div>
  }

  const generateLegacyLayout = (pavilionCode: string) => {
    const rows = 6
    const columns = 4
    const layout = []
    for (let row = 1; row <= rows; row++) {
      const rowItems = []
      for (let col = 1; col <= columns; col++) {
        const boothNumber = `${pavilionCode}${String(row).padStart(2, '0')}`
        const booth = booths.find(b => b.number === boothNumber)
        rowItems.push({ number: boothNumber, booth: booth || null, isEmpty: !booth })
      }
      layout.push(rowItems)
    }
    return layout
  }

  const generateRealLayout = (pavilion: Pavilion) => {
    const { rows, columns, code, width, height } = pavilion
    const cellWidth = (width - 40) / columns
    const cellHeight = (height - 60) / rows
    const layout = []
    for (let row = 1; row <= rows; row++) {
      const rowItems = []
      for (let col = 1; col <= columns; col++) {
        const boothNumber = `${code}${String(row).padStart(2, '0')}${String(col).padStart(2, '0')}`
        const booth = booths.find(b => b.number === boothNumber)
        rowItems.push({ number: boothNumber, booth: booth || null, isEmpty: !booth })
      }
      layout.push(rowItems)
    }
    return layout
  }

  const currentLayout = useRealPavilions && selectedPavilion && 'rows' in selectedPavilion
    ? generateRealLayout(selectedPavilion as Pavilion)
    : generateLegacyLayout(selectedPavilionId || 'A')

  const pavilionBooths = useRealPavilions && selectedPavilion && 'code' in selectedPavilion
    ? booths.filter(b => b.number.startsWith((selectedPavilion as Pavilion).code))
    : booths.filter(b => b.number.startsWith(selectedPavilionId || ''))

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Заголовок и поиск – без изменений */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>Карта выставки • {exhibitionTitle}</h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>Всего: {mapStats.totalBooths}</span>
            <span>Занято: {mapStats.occupiedBooths}</span>
            <span>Свободно: {mapStats.availableBooths}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск стенда по номеру или названию..."
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <button
            onClick={() => { setSearchQuery('') }}
            style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Левая колонка - список павильонов */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
              Павильоны
            </div>
            {(useRealPavilions ? pavilions : legacyPavilions).map((pav: any) => {
              const pavCode = useRealPavilions ? pav.code : pav
              const pavName = useRealPavilions ? pav.name : `Павильон ${pav}`
              const isActive = useRealPavilions ? selectedPavilionId === pav.id : selectedPavilionId === pav
              return (
                <button
                  key={useRealPavilions ? pav.id : pav}
                  onClick={() => useRealPavilions ? setSelectedPavilionId(pav.id) : setSelectedPavilionId(pav)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: isActive ? '#eff6ff' : 'white',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: isActive ? '#1e40af' : '#374151',
                    fontWeight: isActive ? '600' : '500',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{pavName}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '9999px' }}>
                    {booths.filter(b => b.number.startsWith(pavCode)).length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Легенда – без изменений */}
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Легенда карты</h3>
            {[
              { color: '#d1fae5', label: 'Занят (есть экспонент)' },
              { color: '#fef3c7', label: 'Зарезервирован' },
              { color: '#dbeafe', label: 'Свободен (можно занять)' },
              { color: '#f3f4f6', label: 'Свободное место', border: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: item.color, borderRadius: '0.25rem', border: item.border ? '1px dashed #d1d5db' : 'none' }} />
                <span style={{ fontSize: '0.75rem', color: '#374151' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Правая колонка - карта */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', minHeight: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                {useRealPavilions && selectedPavilion && 'name' in selectedPavilion ? selectedPavilion.name : `Павильон ${selectedPavilionId}`} • {pavilionBooths.length} стендов
              </h3>
            </div>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '2rem', overflow: 'auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${currentLayout.length}, 100px)`,
                gridTemplateColumns: `repeat(${currentLayout[0]?.length || 4}, 1fr)`,
                gap: '1rem'
              }}>
                {currentLayout.flat().map((item, index) => {
                  const isHoverable = !!item.booth
                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: getBoothColor(item.booth),
                        borderRadius: '0.5rem',
                        border: item.isEmpty ? '1px dashed #d1d5db' : '1px solid #e5e7eb',
                        padding: '0.75rem',
                        position: 'relative',
                        cursor: isHoverable ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { if (isHoverable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)' } }}
                      onMouseLeave={(e) => { if (isHoverable) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>{item.number}</div>
                      {item.booth && (
                        <>
                          <div style={{ fontSize: '0.625rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                            {item.booth.name}
                          </div>
                          {item.booth.visitor_count > 0 && (
                            <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                              <div style={{ fontSize: '0.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>
                                {item.booth.visitor_count}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {pavilionBooths.length > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.25rem' }}>💡</div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', marginBottom: '0.25rem' }}>
                      {useRealPavilions && selectedPavilion && 'name' in selectedPavilion ? selectedPavilion.name : `Павильон ${selectedPavilionId}`} - информация
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#92400e' }}>
                      • Занято: {pavilionBooths.filter(b => b.status === 'occupied').length} стендов<br/>
                      • Свободно: {pavilionBooths.filter(b => b.status === 'available').length} стендов<br/>
                      • Нажмите на занятый стенд, чтобы посмотреть информацию о компании
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}