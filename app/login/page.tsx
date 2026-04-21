// app/login/page.tsx - БЕЗ ЗАДЕРЖЕК
'use client'

import { useState } from 'react'
import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('22200461@live.preco.ru')
  const [password, setPassword] = useState('123123')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Мгновенный редирект
        router.push('/dashboard')
      } else {
        setError(result.error || 'Ошибка входа')
      }
    } catch (err) {
      setError('Ошибка входа. Проверьте email и пароль.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ExpoSphere</h1>
        <h2 style={styles.subtitle}>Вход в систему</h2>
        
        {error && (
          <div style={styles.error}>❌ {error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="********"
              required
            />
          </div>
          
          <div style={styles.options}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              Запомнить меня
            </label>
            <Link href="#" style={styles.forgotLink}>
              Забыли пароль?
            </Link>
          </div>
          
          <button type="submit" style={styles.submitButton}>
            Войти
          </button>
          
          <div style={styles.divider}>
            <span style={styles.dividerText}>или войти через</span>
          </div>
          
          <div style={styles.socialButtons}>
            <button type="button" style={styles.socialButton}>
              Google
            </button>
            <button type="button" style={styles.socialButton}>
              GitHub
            </button>
          </div>
          
          <div style={styles.registerLink}>
            Нет аккаунта?{' '}
            <Link href="/register" style={styles.registerLinkText}>
              Зарегистрироваться
            </Link>
          </div>
        </form>
        
        {/* Демо-аккаунты */}
        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Демо-аккаунты (нажмите Войти):</p>
          <div style={styles.demoGrid}>
            <button 
              onClick={() => {
                setEmail('22200461@live.preco.ru')
                setPassword('123123')
              }}
              style={styles.demoButton}
            >
              Организатор
            </button>
            <button 
              onClick={() => {
                setEmail('kirya.lun@gmail.com')
                setPassword('123123')
              }}
              style={styles.demoButton}
            >
              Экспонент
            </button>
            <button 
              onClick={() => {
                setEmail('panvisvp3@gmail.com')
                setPassword('123123')
              }}
              style={styles.demoButton}
            >
              Посетитель
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Стили (без изменений)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '1rem'
  } as React.CSSProperties,
  
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  } as React.CSSProperties,
  
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2563eb',
    textAlign: 'center' as const
  } as React.CSSProperties,
  
  subtitle: {
    fontSize: '1.125rem',
    marginBottom: '2rem',
    color: '#6b7280',
    textAlign: 'center' as const
  } as React.CSSProperties,
  
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'center' as const
  } as React.CSSProperties,
  
  formGroup: {
    marginBottom: '1.25rem'
  } as React.CSSProperties,
  
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151',
    fontSize: '0.875rem'
  } as React.CSSProperties,
  
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s'
  } as React.CSSProperties,
  
  options: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  } as React.CSSProperties,
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    cursor: 'pointer'
  } as React.CSSProperties,
  
  checkbox: {
    width: '1rem',
    height: '1rem'
  } as React.CSSProperties,
  
  forgotLink: {
    color: '#2563eb',
    fontSize: '0.875rem',
    textDecoration: 'none'
  } as React.CSSProperties,
  
  submitButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'background-color 0.2s'
  } as React.CSSProperties,
  
  divider: {
    position: 'relative' as const,
    textAlign: 'center' as const,
    marginBottom: '1.5rem'
  } as React.CSSProperties,
  
  dividerText: {
    backgroundColor: 'white',
    padding: '0 1rem',
    color: '#9ca3af',
    fontSize: '0.875rem'
  } as React.CSSProperties,
  
  socialButtons: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  } as React.CSSProperties,
  
  socialButton: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  } as React.CSSProperties,
  
  registerLink: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '0.875rem'
  } as React.CSSProperties,
  
  registerLinkText: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  } as React.CSSProperties,
  
  demoSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb'
  } as React.CSSProperties,
  
  demoTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.75rem',
    color: '#6b7280',
    textAlign: 'center' as const
  } as React.CSSProperties,
  
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem'
  } as React.CSSProperties,
  
  demoButton: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: '#4b5563'
  } as React.CSSProperties
}