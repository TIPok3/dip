// app/exhibitions/[id]/components/FiltersSidebar.tsx
'use client'

interface FiltersSidebarProps {
  filters: {
    category: string
    status: string
    onlineOnly: boolean
  }
  onFilterChange: (newFilters: any) => void
  boothCount: number
  exhibitionId: string
}

export default function FiltersSidebar({ 
  filters, 
  onFilterChange, 
  boothCount,
  exhibitionId 
}: FiltersSidebarProps) {
  
  const categories = [
    'Все',
    'Cloud Services',
    'Security',
    'AI & ML',
    'DevOps',
    'Analytics',
    'Blockchain',
    'IoT'
  ]

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'available', label: 'Свободные' },
    { value: 'occupied', label: 'Занятые' },
    { value: 'reserved', label: 'Зарезервированные' }
  ]

  return (
    <div>
      {/* Блок статистики */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.25rem'
        }}>
          Найдено стендов
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          {boothCount}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#10b981',
          marginTop: '0.25rem'
        }}>
          в этой выставке
        </div>
      </div>

      {/* Поиск */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#374151'
        }}>
          Поиск стендов
        </h3>
        
        <input
          type="text"
          placeholder="Поиск стендов..."
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: '#f9fafb'
          }}
        />
      </div>

      {/* Фильтр: Онлайн/Офлайн */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#374151'
        }}>
          Статус
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {statusOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.25rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={filters.status === option.value}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Фильтр: Категории */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#374151'
        }}>
          Категории
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map((category) => (
            <label
              key={category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.25rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <input
                type="radio"
                name="category"
                value={category === 'Все' ? 'all' : category}
                checked={filters.category === (category === 'Все' ? 'all' : category)}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Фильтр: Онлайн только */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ position: 'relative', width: '40px', height: '20px' }}>
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => onFilterChange({ onlineOnly: e.target.checked })}
              style={{ display: 'none' }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: filters.onlineOnly ? '#10b981' : '#d1d5db',
              borderRadius: '20px',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                position: 'absolute',
                height: '16px',
                width: '16px',
                left: '2px',
                top: '2px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'transform 0.2s',
                transform: filters.onlineOnly ? 'translateX(20px)' : 'translateX(0)'
              }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Только онлайн
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Показывать только стенды с онлайн-присутствием
            </div>
          </div>
        </label>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => {
          onFilterChange({
            category: 'all',
            status: 'all',
            onlineOnly: false
          })
        }}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: 'white',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          fontWeight: '500',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Сбросить фильтры
      </button>

      {/* Информация для экспонентов */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #fde68a',
        marginTop: '1rem'
      }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#92400e', 
          marginBottom: '0.5rem',
          fontWeight: '500'
        }}>
          Вы экспонент?
        </p>
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#92400e',
          marginBottom: '0.75rem' 
        }}>
          Зарегистрируйте свой стенд на этой выставке
        </p>
        <button
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#fbbf24',
            color: '#92400e',
            borderRadius: '0.375rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Подать заявку на участие
        </button>
      </div>
    </div>
  )
}