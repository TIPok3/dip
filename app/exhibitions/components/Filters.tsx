'use client'

interface FiltersProps {
  categories: string[]
  filters: {
    category: string
    status: string
    dateRange: string
    sortBy: string
  }
  onFilterChange: (newFilters: any) => void
  exhibitionCount: number
}

export default function Filters({ 
  categories, 
  filters, 
  onFilterChange, 
  exhibitionCount 
}: FiltersProps) {
  
  const dateRangeOptions = [
    { value: 'all', label: 'Все даты' },
    { value: 'thisWeek', label: 'На этой неделе' },
    { value: 'thisMonth', label: 'В этом месяце' },
    { value: 'upcoming', label: 'Предстоящие' },
    { value: 'past', label: 'Прошедшие' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'popular', label: 'По популярности' },
    { value: 'rating', label: 'По рейтингу' }
  ]

  return (
    <div>
      {/* Блок с количеством */}
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
          Найдено выставок
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          {exhibitionCount}
        </div>
      </div>

      {/* Категории */}
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
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Категории
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
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
              <span style={{
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Дата проведения */}
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
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Дата проведения
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {dateRangeOptions.map((option) => (
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
                name="dateRange"
                value={option.value}
                checked={filters.dateRange === option.value}
                onChange={(e) => onFilterChange({ dateRange: e.target.value })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Сортировка */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Сортировка
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {sortOptions.map((option) => (
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
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => {
          onFilterChange({
            category: 'all',
            status: 'all',
            dateRange: 'all',
            sortBy: 'newest'
          })
        }}
        style={{
          width: '100%',
          marginTop: '1rem',
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
    </div>
  )
}