'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // Можно добавить debounce для поиска при вводе
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Поиск выставок по названию, категории..."
          style={{
            width: '100%',
            padding: '0.875rem 3rem 0.875rem 1rem',
            border: `1px solid ${isFocused ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '0.75rem',
            fontSize: '1rem',
            backgroundColor: 'white',
            transition: 'all 0.2s',
            boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
          }}
        />
        
        {/* Иконка поиска */}
        <div style={{
          position: 'absolute',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
          
          <button
            type="submit"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              color: '#6b7280'
            }}>
              🔍
            </div>
          </button>
        </div>
      </div>

      {/* Подсказки под поиском */}
      {query && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          marginTop: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 10,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            borderBottom: '1px solid #f3f4f6'
          }}>
            Нажмите Enter для поиска
          </div>
          <div style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: '#3b82f6',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Найти "{query}"
          </div>
        </div>
      )}

      {/* Быстрые теги */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
        justifyContent: 'center'
      }}>
        {['Технологии', 'Здравоохранение', 'Финансы', 'Стартапы'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag)
              onSearch(tag)
            }}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  )
}