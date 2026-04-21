// app/dashboard/organizer/exhibitions/new/components/StepPavilions.tsx
'use client'

import { useState } from 'react'
import { Pavilion } from './types'
import { Toast } from '@/app/components/Toast'

interface StepPavilionsProps {
  formData: {
    pavilions: Pavilion[]
  }
  updateFormData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export default function StepPavilions({ formData, updateFormData, onNext, onBack }: StepPavilionsProps) {
  const pavilions = formData.pavilions || []
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const addPavilion = () => {
    const newPavilion: Pavilion = {
      id: generateId(),
      name: `Павильон ${String.fromCharCode(65 + pavilions.length)}`,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      color: '#f9fafb',
      boothRows: 2,
      boothColumns: 3,
    }
    updateFormData({ pavilions: [...pavilions, newPavilion] })
  }

  const removePavilion = (id: string) => {
    if (pavilions.length <= 1) {
      setToast({ message: 'Должен остаться хотя бы один павильон', type: 'error' })
      return
    }
    updateFormData({ pavilions: pavilions.filter(p => p.id !== id) })
  }

  const updatePavilion = (id: string, updates: Partial<Pavilion>) => {
    updateFormData({
      pavilions: pavilions.map(p => p.id === id ? { ...p, ...updates } : p)
    })
  }

  const renderBooths = (pavilion: Pavilion) => {
    const { boothRows, boothColumns, size } = pavilion
    const cellWidth = (size.width - 40) / boothColumns
    const cellHeight = (size.height - 60) / boothRows

    const booths = []
    let index = 1
    for (let row = 0; row < boothRows; row++) {
      for (let col = 0; col < boothColumns; col++) {
        booths.push(
          <div
            key={`${pavilion.id}-${row}-${col}`}
            style={{
              position: 'absolute',
              left: 20 + col * cellWidth,
              top: 40 + row * cellHeight,
              width: cellWidth - 4,
              height: cellHeight - 4,
              backgroundColor: '#10b981',
              border: '1px solid #374151',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {pavilion.name.split(' ')[1]}{index++}
          </div>
        )
      }
    }
    return booths
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Павильоны и стенды</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Настройте количество стендов в каждом павильоне
          </p>
        </div>
        <button
          onClick={addPavilion}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          + Добавить павильон
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {pavilions.map(pavilion => (
          <div key={pavilion.id} style={{ width: pavilion.size.width, marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={pavilion.name}
                onChange={(e) => updatePavilion(pavilion.id, { name: e.target.value })}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.75rem' }}>Ряды:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={pavilion.boothRows}
                  onChange={(e) => {
                    const rows = parseInt(e.target.value) || 1
                    updatePavilion(pavilion.id, { boothRows: rows })
                  }}
                  style={{ width: '50px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <label style={{ fontSize: '0.75rem' }}>Колонки:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={pavilion.boothColumns}
                  onChange={(e) => {
                    const cols = parseInt(e.target.value) || 1
                    updatePavilion(pavilion.id, { boothColumns: cols })
                  }}
                  style={{ width: '50px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
            </div>

            {/* Павильон с крестиком внутри */}
            <div
              style={{
                position: 'relative',
                width: pavilion.size.width,
                height: pavilion.size.height,
                backgroundColor: pavilion.color,
                border: '2px solid #9ca3af',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <button
                onClick={() => removePavilion(pavilion.id)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ✕
              </button>

              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '4px',
                  borderRadius: '0.25rem',
                  fontSize: '14px',
                  zIndex: 1,
                }}
              >
                {pavilion.name}
              </div>

              {renderBooths(pavilion)}
            </div>
          </div>
        ))}
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
          ← Назад
        </button>

        <button
          onClick={onNext}
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
          Далее: Настройки доступа →
        </button>
      </div>
    </div>
  )
}