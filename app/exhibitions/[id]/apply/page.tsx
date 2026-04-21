// app/exhibitions/[id]/apply/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Toast } from '@/app/components/Toast'

export default function ApplyExhibitionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [exhibition, setExhibition] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    description: '',
    website: '',
    contact_email: '',
    contact_phone: '',
  })

  useEffect(() => {
    if (!id) return
    const loadExhibition = async () => {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('title, organizer_id')
        .eq('id', id)
        .single()
      if (!error && data) setExhibition(data)
    }
    loadExhibition()
  }, [id])

  useEffect(() => {
    if (user && user.company) {
      setFormData(prev => ({ ...prev, company_name: user.company || '' }))
    }
    if (user && user.email) {
      setFormData(prev => ({ ...prev, contact_email: user.email || '' }))
    }
  }, [user])

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showToast('Войдите в систему', 'error')
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // Проверка, не подавал ли уже заявку
      const { data: existing, error: checkError } = await supabase
        .from('exhibitors')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('exhibition_id', id)
        .maybeSingle()

      if (checkError) throw checkError

      if (existing) {
        let message = 'Вы уже подавали заявку на эту выставку'
        if (existing.status === 'pending') message += ' (ожидает рассмотрения)'
        else if (existing.status === 'approved') message += ' (одобрена)'
        else if (existing.status === 'rejected') message += ' (отклонена)'
        showToast(message, 'error')
        router.push(`/exhibitions/${id}`)
        return
      }

      const { error } = await supabase
        .from('exhibitors')
        .insert({
          user_id: user.id,
          exhibition_id: id,
          company_name: formData.company_name,
          description: formData.description,
          website: formData.website,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          status: 'pending',
        })

      if (error) {
        console.error('Ошибка Supabase:', error)
        throw error
      }

      showToast('Заявка успешно отправлена!', 'success')
      setTimeout(() => router.push(`/exhibitions/${id}`), 1500)
    } catch (error: any) {
      console.error('Ошибка отправки заявки:', error)
      let errorMessage = 'Не удалось отправить заявку'
      if (error.code === '23505') { // duplicate key violation
        errorMessage = 'Вы уже подавали заявку на эту выставку'
      } else if (error.message) {
        errorMessage = error.message
      }
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Для подачи заявки необходимо войти в систему</p>
        <Link href="/login" style={{ color: '#2563eb' }}>Войти</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Подача заявки на участие
      </h1>
      {exhibition && (
        <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
          Выставка: {exhibition.title}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Название компании *</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Описание деятельности</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Сайт</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Контактный email *</label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Контактный телефон</label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}