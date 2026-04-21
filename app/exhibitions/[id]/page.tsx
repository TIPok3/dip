// app/exhibitions/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '../../providers'
import Link from 'next/link'
import ExhibitionHeader from './components/ExhibitionHeader'
import BoothsGrid from './components/BoothsGrid'
import FiltersSidebar from './components/FiltersSidebar'
import ExhibitionMap from './components/ExhibitionMap'
import { Toast } from '@/app/components/Toast'

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

interface Booth {
  id: string
  number: string
  name: string
  description: string
  status: 'available' | 'occupied' | 'reserved'
  visitor_count: number
  rating: number
  category: string
  tags: string[]
  exhibitor?: {
    company_name: string
    description: string
    contact_email: string
    website?: string
  }
}

export default function ExhibitionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [booths, setBooths] = useState<Booth[]>([])
  const [pavilions, setPavilions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'booths' | 'map'>('booths')
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    onlineOnly: false,
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    if (id) {
      loadExhibitionData()
    }
  }, [id])

  useEffect(() => {
    if (user && id) {
      const checkRegistration = async () => {
        const { data } = await supabase
          .from('exhibition_visitors')
          .select('id')
          .eq('exhibition_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
        setIsRegistered(!!data)
      }
      checkRegistration()
    }
  }, [user, id])

  const loadExhibitionData = async () => {
    setLoading(true)
    try {
      const { data: exhibitionData, error: exhibitionError } = await supabase
        .from('exhibitions')
        .select(`
          *,
          organizer:organizer_id (
            name,
            company,
            email
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (exhibitionError) {
        console.error('Ошибка загрузки выставки:', exhibitionError)
        router.push('/exhibitions')
        return
      }

      if (!exhibitionData) {
        console.error('Выставка не найдена')
        router.push('/exhibitions')
        return
      }

      const formattedExhibition: Exhibition = {
        id: exhibitionData.id,
        title: exhibitionData.title || 'Без названия',
        description: exhibitionData.description || 'Описание отсутствует',
        start_date: exhibitionData.start_date,
        end_date: exhibitionData.end_date,
        category: exhibitionData.category || 'Без категории',
        status: exhibitionData.status as any,
        visitor_count: exhibitionData.visitor_count || 0,
        rating: exhibitionData.rating || 0,
        logo_url: exhibitionData.logo_url,
        is_public: exhibitionData.is_public,
        tags: Array.isArray(exhibitionData.tags) ? exhibitionData.tags : [],
        organizer: {
          name: exhibitionData.organizer?.name || 'Организатор выставки',
          company: exhibitionData.organizer?.company || 'Компания организатора',
        },
      }

      setExhibition(formattedExhibition)

      const { data: boothsData, error: boothsError } = await supabase
        .from('booths')
        .select(`
          *,
          exhibitor:exhibitor_id (
            company_name,
            description,
            contact_email,
            website
          )
        `)
        .eq('exhibition_id', id)
        .order('number')

      if (boothsError) {
        console.error('Ошибка загрузки стендов:', boothsError)
        setBooths([])
      } else {
        const formattedBooths: Booth[] = (boothsData || []).map((booth: any) => ({
          id: booth.id,
          number: booth.number || '',
          name: booth.name || booth.exhibitor?.company_name || 'Стенд',
          description: booth.description || booth.exhibitor?.description || '',
          status: booth.status || 'available',
          visitor_count: booth.visitor_count || 0,
          rating: booth.rating || 0,
          category: booth.category || '',
          tags: Array.isArray(booth.tags) ? booth.tags : [],
          exhibitor: booth.exhibitor
            ? {
                company_name: booth.exhibitor.company_name,
                description: booth.exhibitor.description,
                contact_email: booth.exhibitor.contact_email,
                website: booth.exhibitor.website,
              }
            : undefined,
        }))

        setBooths(formattedBooths)
      }

      const { data: pavilionsData, error: pavilionsError } = await supabase
        .from('pavilions')
        .select('*')
        .eq('exhibition_id', id)

      if (!pavilionsError) {
        setPavilions(pavilionsData || [])
      } else {
        console.error('Ошибка загрузки павильонов:', pavilionsError)
      }
    } catch (error) {
      console.error('Критическая ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingUpdate = (newRating: number) => {
    if (exhibition) {
      setExhibition({ ...exhibition, rating: newRating })
    }
  }

  const handleRegister = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    try {
      const { error } = await supabase
        .from('exhibition_visitors')
        .insert({
          user_id: user.id,
          exhibition_id: id,
          status: 'registered'
        })
      if (error) throw error
      setIsRegistered(true)
      // Обновляем локально счётчик посетителей
      if (exhibition) {
        setExhibition({
          ...exhibition,
          visitor_count: exhibition.visitor_count + 1
        })
      }
      setToast({ message: 'Вы успешно зарегистрированы на выставку!', type: 'success' })
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      setToast({ message: 'Ошибка регистрации', type: 'error' })
    }
  }

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const filteredBooths = booths.filter((booth) => {
    if (filters.category !== 'all' && booth.category !== filters.category) return false
    if (filters.status !== 'all' && booth.status !== filters.status) return false
    return true
  })

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151' }}>Загрузка выставки...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }}>🕵️‍♂️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Выставка не найдена</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Запрошенная выставка не существует или была удалена</p>
          <Link href="/exhibitions" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>Вернуться в каталог</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f9fafb' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ExhibitionHeader
        exhibition={exhibition}
        onRegister={handleRegister}
        user={user}
        isRegistered={isRegistered}
        onRatingUpdate={handleRatingUpdate}
      />

      {user && user.role === 'exhibitor' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', textAlign: 'right' }}>
          <Link href={`/exhibitions/${id}/apply`} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>Подать заявку на участие</Link>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid transparent' }}>
            <button onClick={() => setActiveTab('booths')} style={{ padding: '1rem 0', backgroundColor: 'transparent', border: 'none', fontSize: '1rem', fontWeight: '500', color: activeTab === 'booths' ? '#3b82f6' : '#6b7280', borderBottom: activeTab === 'booths' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>Все стенды</button>
            <button onClick={() => setActiveTab('map')} style={{ padding: '1rem 0', backgroundColor: 'transparent', border: 'none', fontSize: '1rem', fontWeight: '500', color: activeTab === 'map' ? '#3b82f6' : '#6b7280', borderBottom: activeTab === 'map' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>Карта</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'booths' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
            <FiltersSidebar filters={filters} onFilterChange={handleFilterChange} boothCount={filteredBooths.length} exhibitionId={exhibition.id} />
            <BoothsGrid booths={filteredBooths} exhibition={exhibition} />
          </div>
        )}
        {activeTab === 'map' && (
          <ExhibitionMap booths={booths} pavilions={pavilions} exhibitionId={exhibition.id} exhibitionTitle={exhibition.title} />
        )}
      </div>
    </div>
  )
}