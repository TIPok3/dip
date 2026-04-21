// app/exhibitions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ExhibitionCard from './components/ExhibitionCard'
import Filters from './components/Filters'
import SearchBar from './components/SearchBar'

interface Exhibition {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  status: 'active' | 'upcoming' | 'completed' | 'draft'
  visitor_count: number
  rating: number
  logo_url?: string
  is_public: boolean
  tags: string[]
  organizer: {
    name: string
    company?: string
  }
}

interface FiltersType {
  category: string
  status: string
  dateRange: string
  sortBy: string
}

export default function ExhibitionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [filters, setFilters] = useState<FiltersType>({
    category: 'all',
    status: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  })

  const categories = [
    'Все',
    'Технологии',
    'Здравоохранение',
    'Финансы',
    'Образование',
    'Экология',
    'Недвижимость',
    'Маркетинг',
    'Стартапы'
  ]

  useEffect(() => {
    loadExhibitions()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [exhibitions, filters, searchQuery])

  const loadExhibitions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .select(`
          *,
          organizer:organizer_id (
            name,
            company,
            email
          )
        `)
        .eq('is_public', true)
        .in('status', ['active', 'upcoming'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Ошибка загрузки выставок:', error)
        setExhibitions([])
        setFilteredExhibitions([])
        return
      }

      if (!data || data.length === 0) {
        setExhibitions([])
        setFilteredExhibitions([])
        return
      }

      const formattedExhibitions: Exhibition[] = data.map((expo: any) => {
        const today = new Date()
        const startDate = new Date(expo.start_date)
        const endDate = new Date(expo.end_date)
        let displayStatus: Exhibition['status'] = 'upcoming'
        if (expo.status === 'draft') {
          displayStatus = 'draft'
        } else if (today >= startDate && today <= endDate) {
          displayStatus = 'active'
        } else if (today > endDate) {
          displayStatus = 'completed'
        }
        return {
          id: expo.id,
          title: expo.title || 'Без названия',
          description: expo.description || 'Описание отсутствует',
          start_date: expo.start_date,
          end_date: expo.end_date,
          category: expo.category || 'Без категории',
          status: displayStatus,
          visitor_count: expo.visitor_count || 0,
          rating: expo.rating || 0,
          logo_url: expo.logo_url,
          is_public: expo.is_public,
          tags: Array.isArray(expo.tags) ? expo.tags : [],
          organizer: {
            name: expo.organizer?.name || 'Организатор выставки',
            company: expo.organizer?.company || 'Компания организатора'
          }
        }
      })

      setExhibitions(formattedExhibitions)
      setFilteredExhibitions(formattedExhibitions)
    } catch (error) {
      console.error('Критическая ошибка загрузки:', error)
      setExhibitions([])
      setFilteredExhibitions([])
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...exhibitions]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(expo =>
        expo.title.toLowerCase().includes(query) ||
        expo.description.toLowerCase().includes(query) ||
        expo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (filters.category !== 'all') {
      result = result.filter(expo => expo.category === filters.category)
    }

    if (filters.status !== 'all') {
      result = result.filter(expo => expo.status === filters.status)
    }

    if (filters.dateRange !== 'all') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      result = result.filter(expo => {
        const startDate = new Date(expo.start_date)
        switch (filters.dateRange) {
          case 'thisWeek': return startDate >= today && startDate <= nextWeek
          case 'thisMonth': return startDate >= today && startDate <= nextMonth
          case 'upcoming': return startDate > today
          case 'past': return startDate < today
          default: return true
        }
      })
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest': return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        case 'oldest': return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        case 'popular': return b.visitor_count - a.visitor_count
        case 'rating': return b.rating - a.rating
        default: return 0
      }
    })

    setFilteredExhibitions(result)
  }

  const handleSearch = (query: string) => setSearchQuery(query)

  const handleFilterChange = (newFilters: Partial<FiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleBackToDashboard = () => {
    if (!user) {
      router.push('/')
      return
    }
    switch (user.role) {
      case 'organizer':
        router.push('/dashboard/organizer')
        break
      case 'exhibitor':
        router.push('/dashboard/exhibitor')
        break
      case 'visitor':
        router.push('/dashboard/visitor')
        break
      default:
        router.push('/')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'upcoming': return '#3b82f6'
      case 'completed': return '#6b7280'
      case 'draft': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна'
      case 'upcoming': return 'Скоро'
      case 'completed': return 'Завершена'
      case 'draft': return 'Черновик'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151' }}>Загрузка выставок...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f9fafb' }}>
      {/* Кнопка "Вернуться в дашборд" для авторизованных пользователей */}
      {user && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 0 1rem' }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            ← Вернуться в дашборд
          </button>
        </div>
      )}

      {/* Герой-секция */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827', textAlign: 'center' }}>
            Каталог выставок
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            Исследуйте виртуальные выставки по технологиям, финансам, здравоохранению и другим отраслям.
            Найдите подходящие мероприятия для вашего бизнеса.
          </p>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          <div>
            <Filters
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              exhibitionCount={filteredExhibitions.length}
            />
            {user?.role === 'organizer' && (
              <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #dbeafe', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '500' }}>Вы организатор?</p>
                <p style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.75rem' }}>Создайте свою выставку в личном кабинете</p>
                <Link href="/dashboard/organizer" style={{ display: 'block', padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', textDecoration: 'none' }}>
                  Перейти в дашборд
                </Link>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151' }}>
                Все выставки
                <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontWeight: '400' }}>({filteredExhibitions.length})</span>
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'active', 'upcoming'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange({ status })}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: filters.status === status ? '#3b82f6' : 'white',
                      color: filters.status === status ? 'white' : '#374151',
                      border: `1px solid ${filters.status === status ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {status === 'all' ? 'Все' : status === 'active' ? 'Активные' : 'Скоро'}
                  </button>
                ))}
              </div>
            </div>

            {filteredExhibitions.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }}>🕵️‍♂️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  {exhibitions.length === 0 ? 'В базе данных нет выставок' : 'Выставки не найдены'}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  {exhibitions.length === 0
                    ? 'Организаторы еще не создали публичные выставки'
                    : 'Попробуйте изменить параметры поиска или фильтры'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({ category: 'all', status: 'all', dateRange: 'all', sortBy: 'newest' })
                  }}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer' }}
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredExhibitions.map((exhibition) => (
                  <ExhibitionCard
                    key={exhibition.id}
                    exhibition={exhibition}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}