// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

// ВАШИ РЕАЛЬНЫЕ КЛЮЧИ
const supabaseUrl = 'https://zxokqvecedhrtpxaoimf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b2txdmVjZWRocnRweGFvaW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDg2OTMsImV4cCI6MjA4NDAyNDY5M30.-D783KU0tQ-YT-M4D_9z5Cg5OSEFvjWAYx6PygHdyt4'

console.log('🔐 Supabase URL:', supabaseUrl)
console.log('🔑 Supabase Key присутствует?', supabaseAnonKey ? '✅ Да' : '❌ Нет')

// Создаем клиент с настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
})

// Тест подключения
export const testConnection = async () => {
  console.log('🔄 Тестируем подключение к Supabase...')
  
  try {
    // 1. Проверка REST API
    const restTest = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    console.log('REST API статус:', restTest.status, restTest.statusText)
    
    // 2. Проверка аутентификации
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Ошибка аутентификации:', sessionError.message)
      return { success: false, error: sessionError }
    }
    
    console.log('✅ Подключение к Supabase успешно!')
    console.log('Сессия:', sessionData.session ? 'Есть' : 'Нет')
    
    return { success: true, session: sessionData.session }
    
  } catch (error: any) {
    console.error('❌ Критическая ошибка подключения:', error.message)
    return { success: false, error }
  }
}

// Автоматически тестируем при импорте (в браузере)
if (typeof window !== 'undefined') {
  setTimeout(() => testConnection(), 500)
}