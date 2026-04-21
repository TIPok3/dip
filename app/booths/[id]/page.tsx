// app/booths/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'
import Link from 'next/link'
import BoothRatingStars from '@/app/exhibitions/[id]/components/BoothRatingStars'

interface Booth {
  id: string
  name: string
  description: string
  rating: number
  tags: string[]
  blocks: any[]
  exhibitor: {
    company_name: string
    contact_email: string
    contact_phone: string
    website: string
    description: string
  } | null
  exhibition: {
    id: string
    title: string
  } | null
}

export default function BoothPublicPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [booth, setBooth] = useState<Booth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (id) loadBooth()
  }, [id])

  useEffect(() => {
    if (!user || !id) return

    const trackView = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('booth_views')
        .select('id')
        .eq('booth_id', id)
        .eq('user_id', user.id)
        .gte('viewed_at', today)
        .maybeSingle()

      if (!existing) {
        await supabase.from('booth_views').insert({
          booth_id: id,
          user_id: user.id,
          viewed_at: new Date().toISOString()
        })
      }
    }

    trackView()
  }, [id, user])

  const loadBooth = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('booths')
      .select(`
        *,
        exhibitor:exhibitor_id (
          company_name,
          contact_email,
          contact_phone,
          website,
          description
        ),
        exhibition:exhibition_id (
          id,
          title
        )
      `)
      .eq('id', id)
      .single()

    if (error) setError(error.message)
    else {
      setBooth(data)
      setRating(data.rating || 0)
    }
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
  if (error || !booth) return <div style={{ textAlign: 'center', padding: '3rem' }}>Стенд не найден</div>

  const blocks = booth.blocks || []
  const tags = booth.tags || []

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href={`/exhibitions/${booth.exhibition?.id}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
          ← Вернуться к каталогу выставки
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {booth.exhibitor?.company_name}
        </h1>
        {booth.name && booth.name !== booth.exhibitor?.company_name && (
          <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '0.5rem' }}>
            {booth.name}
          </p>
        )}
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
          Выставка: {booth.exhibition?.title}
        </p>

        <BoothRatingStars
          boothId={id as string}
          currentRating={rating}
          onRatingUpdate={(newRating) => setRating(newRating)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {blocks.map((block: any, index: number) => {
          if (block.type === 'text') {
            return (
              <section key={index} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{block.content}</div>
              </section>
            )
          }
          if (block.type === 'image' && block.content) {
            return (
              <section key={index} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={block.content}
                    alt={`Изображение ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                  />
                </div>
              </section>
            )
          }
          if (block.type === 'video' && block.content) {
            return (
              <section key={index} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Видео презентация</h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe src={block.content} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
                </div>
              </section>
            )
          }
          if (block.type === 'file' && block.content) {
            return (
              <section key={index} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Материалы для скачивания</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ flex: 1 }}>{block.title || 'Файл'}</span>
                  <a href={block.content} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '0.375rem' }}>Скачать</a>
                </div>
              </section>
            )
          }
          return null
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Контактная информация</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {booth.exhibitor?.contact_email && <p>Email: <a href={`mailto:${booth.exhibitor.contact_email}`}>{booth.exhibitor.contact_email}</a></p>}
            {booth.exhibitor?.contact_phone && <p>Телефон: <a href={`tel:${booth.exhibitor.contact_phone}`}>{booth.exhibitor.contact_phone}</a></p>}
            {booth.exhibitor?.website && <p>Сайт: <a href={booth.exhibitor.website} target="_blank" rel="noopener noreferrer">{booth.exhibitor.website}</a></p>}
          </div>
        </section>

        {tags.length > 0 && (
          <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Теги</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tags.map((tag: string) => (
                <span key={tag} style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>#{tag}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}