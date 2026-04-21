// app/exhibitions/[id]/components/RatingStars.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'
import { Toast } from '@/app/components/Toast'

interface RatingStarsProps {
  exhibitionId: string
  currentRating: number
  onRatingUpdate?: (newRating: number) => void
}

export default function RatingStars({ exhibitionId, currentRating, onRatingUpdate }: RatingStarsProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (user) {
      loadUserRating()
    }
  }, [user, exhibitionId])

  const loadUserRating = async () => {
    const { data, error } = await supabase
      .from('exhibition_ratings')
      .select('rating')
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', user?.id)
      .maybeSingle()

    if (!error && data) {
      setUserRating(data.rating)
    }
  }

  const handleRate = async (rating: number) => {
    if (!user) {
      setToast({ message: 'Войдите, чтобы оценить выставку', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('exhibition_ratings')
        .upsert({
          exhibition_id: exhibitionId,
          user_id: user.id,
          rating: rating
        }, {
          onConflict: 'exhibition_id, user_id'
        })

      if (error) throw error

      setUserRating(rating)
      if (onRatingUpdate) onRatingUpdate(rating)
      setToast({ message: 'Спасибо за оценку!', type: 'success' })
    } catch (error) {
      console.error(error)
      setToast({ message: 'Ошибка при сохранении оценки', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: (hoverRating !== null ? star <= hoverRating : star <= (userRating || 0))
                ? '#fbbf24'
                : '#d1d5db',
              transition: 'color 0.2s',
              padding: '0 0.125rem'
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        ({currentRating.toFixed(1)})
      </span>
    </div>
  )
}