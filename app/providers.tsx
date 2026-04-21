// app/providers.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type UserRole = 'organizer' | 'exhibitor' | 'visitor'

interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  company?: string
  phone?: string
  position?: string
  about?: string
  avatar_url?: string
  website?: string
  preferences?: any
  notification_settings?: any
  subscription_data?: any
  payment_method?: any
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (
    email: string,
    password: string,
    role: UserRole,
    name?: string,
    company?: string
  ) => Promise<{
    success: boolean
    error?: string
    needsEmailVerification?: boolean
    message?: string
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Кэш профиля в памяти для предотвращения повторных запросов
const profileCache = new Map<string, AppUser>()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const initialLoadDone = useRef(false)

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    // Проверяем кэш
    const cached = profileCache.get(supabaseUser.id)
    if (cached) {
      setUser(cached)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle()

      const metadata = supabaseUser.user_metadata || {}
      let appUser: AppUser

      if (!error && profile) {
        appUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || profile.email,
          name: profile.name || metadata?.name || supabaseUser.email?.split('@')[0] || 'Пользователь',
          role: profile.role || metadata?.role || 'visitor',
          company: profile.company || metadata?.company,
          phone: profile.phone,
          position: profile.position,
          about: profile.about,
          avatar_url: profile.avatar_url,
          website: profile.website,
          preferences: profile.preferences,
          notification_settings: profile.notification_settings,
          subscription_data: profile.subscription_data,
          payment_method: profile.payment_method,
        }
      } else {
        appUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: metadata?.name || supabaseUser.email?.split('@')[0] || 'Пользователь',
          role: metadata?.role || 'visitor',
          company: metadata?.company,
          avatar_url: metadata?.avatar_url,
        }
      }

      profileCache.set(supabaseUser.id, appUser)
      setUser(appUser)
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
      const metadata = supabaseUser.user_metadata || {}
      const fallbackUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: metadata?.name || supabaseUser.email?.split('@')[0] || 'Пользователь',
        role: metadata?.role || 'visitor',
        company: metadata?.company,
        avatar_url: metadata?.avatar_url,
      }
      profileCache.set(supabaseUser.id, fallbackUser)
      setUser(fallbackUser)
    }
  }, [])

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Ошибка получения сессии:', error.message)
        } else if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error('Ошибка при проверке сессии:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        profileCache.clear()
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Инвалидируем кэш и загружаем заново
        profileCache.delete(session.user.id)
        await fetchUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        let errorMessage = 'Ошибка входа'
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Неверный email или пароль'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Подтвердите email перед входом'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Слишком много попыток. Попробуйте позже'
        }
        return { success: false, error: errorMessage }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: 'Произошла непредвиденная ошибка' }
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Ошибка выхода:', error.message)
    } else {
      setUser(null)
      profileCache.clear()
      router.push('/login')
    }
  }

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    name?: string,
    company?: string
  ) => {
    try {
      if (password.length < 6) {
        return {
          success: false,
          error: 'Пароль должен содержать минимум 6 символов',
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return { success: false, error: 'Введите корректный email' }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            role,
            name: name?.trim() || email.trim().split('@')[0],
            company: company?.trim() || null,
          },
        },
      })

      if (error) {
        let errorMessage = 'Ошибка регистрации'
        if (
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('email address has already been registered') ||
          error.message.includes('user with this email')
        ) {
          errorMessage = 'Пользователь с таким email уже зарегистрирован'
        } else if (
          error.message.includes('rate limit') ||
          error.message.includes('Too Many Requests') ||
          error.message.includes('429')
        ) {
          errorMessage = 'Слишком много попыток. Подождите 1 минуту и попробуйте снова'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Пароль должен содержать минимум 6 символов'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Некорректный email'
        }
        return { success: false, error: errorMessage }
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'Пользователь с таким email уже зарегистрирован',
        }
      }

      if (data.user && !data.session) {
        return {
          success: true,
          needsEmailVerification: true,
          message: 'Проверьте вашу почту для подтверждения регистрации',
        }
      }

      if (data.user && data.session) {
        const redirectPath =
          role === 'organizer'
            ? '/dashboard/organizer'
            : role === 'exhibitor'
            ? '/dashboard/exhibitor'
            : '/dashboard/visitor'
        router.push(redirectPath)
        return { success: true }
      }

      return { success: false, error: 'Не удалось завершить регистрацию' }
    } catch (error: any) {
      return { success: false, error: 'Произошла непредвиденная ошибка' }
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <p>Загрузка аутентификации...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}