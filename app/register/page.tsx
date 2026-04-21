// app/register/page.tsx - БЕЗ ЗАДЕРЖЕК
'use client'

import { useState } from 'react'
import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserRole = 'organizer' | 'exhibitor' | 'visitor'

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('form')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    // Валидация
    if (!selectedRole) {
      setError('Выберите роль')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setError('Примите условия использования')
      setLoading(false)
      return
    }

    // Регистрация
    const result = await register(
      email.trim(),
      password.trim(),
      selectedRole,
      name.trim() || undefined,
      selectedRole === 'exhibitor' ? company.trim() : undefined
    )

    setLoading(false)

    if (result.success) {
      if (result.needsEmailVerification) {
        setSuccessMessage(result.message || 'Проверьте вашу почту для подтверждения регистрации')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        // Мгновенный редирект
        router.push('/dashboard')
      }
    } else {
      setError(result.error || 'Ошибка регистрации')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ExpoSphere</h1>
        <h2 style={styles.subtitle}>Создание аккаунта</h2>

        {successMessage && (
          <div style={{
            ...styles.error,
            backgroundColor: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div style={styles.error}>❌ {error}</div>
        )}

        {step === 'role' ? (
          <>
            <p style={styles.roleText}>Выберите роль</p>
            
            <div style={styles.roleGrid}>
              <button
                onClick={() => handleRoleSelect('organizer')}
                style={{
                  ...styles.roleButton,
                  borderColor: selectedRole === 'organizer' ? '#2563eb' : '#e5e7eb'
                }}
              >
                <div style={styles.roleIcon}>📊</div>
                <h3 style={styles.roleTitle}>Организатор</h3>
                <p style={styles.roleDescription}>
                  Создавайте выставки и приглашайте экспонентов
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect('exhibitor')}
                style={{
                  ...styles.roleButton,
                  borderColor: selectedRole === 'exhibitor' ? '#2563eb' : '#e5e7eb'
                }}
              >
                <div style={styles.roleIcon}>🏢</div>
                <h3 style={styles.roleTitle}>Экспонент</h3>
                <p style={styles.roleDescription}>
                  Представляйте компанию на выставках
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect('visitor')}
                style={{
                  ...styles.roleButton,
                  borderColor: selectedRole === 'visitor' ? '#2563eb' : '#e5e7eb'
                }}
              >
                <div style={styles.roleIcon}>👤</div>
                <h3 style={styles.roleTitle}>Посетитель</h3>
                <p style={styles.roleDescription}>
                  Исследуйте выставки и находите партнёров
                </p>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.selectedRole}>
              <span style={styles.roleBadge}>
                {selectedRole === 'organizer' && '📊 Организатор'}
                {selectedRole === 'exhibitor' && '🏢 Экспонент'}
                {selectedRole === 'visitor' && '👤 Посетитель'}
              </span>
              <button 
                type="button"
                onClick={() => {
                  setStep('role')
                  setError('')
                }}
                style={styles.changeRoleButton}
              >
                Изменить
              </button>
            </div>

            {selectedRole === 'exhibitor' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Название компании *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={styles.input}
                  placeholder='ООО "Компания"'
                  required
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Ваше имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Иван Иванов"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
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
              <label style={styles.label}>Пароль * (минимум 6 символов)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="**********"
                required
                minLength={6}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Подтверждение пароля *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="**********"
                required
                minLength={6}
              />
            </div>

            <div style={styles.terms}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                  required
                />
                Я принимаю условия использования и политику конфиденциальности
              </label>
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </button>

            <div style={styles.loginLink}>
              Уже есть аккаунт?{' '}
              <Link href="/login" style={styles.loginLinkText}>
                Войти
              </Link>
            </div>
          </form>
        )}
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
    maxWidth: '500px',
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
    fontSize: '1.25rem',
    marginBottom: '2rem',
    color: '#6b7280',
    textAlign: 'center' as const
  } as React.CSSProperties,

  roleText: {
    fontSize: '1.125rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    color: '#374151',
    textAlign: 'center' as const
  } as React.CSSProperties,

  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  } as React.CSSProperties,

  roleButton: {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#2563eb',
      transform: 'translateY(-2px)'
    }
  } as React.CSSProperties,

  roleIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem'
  } as React.CSSProperties,

  roleTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#374151'
  } as React.CSSProperties,

  roleDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: '1.4'
  } as React.CSSProperties,

  selectedRole: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem'
  } as React.CSSProperties,

  roleBadge: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  } as React.CSSProperties,

  changeRoleButton: {
    fontSize: '0.75rem',
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline'
  } as React.CSSProperties,

  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.875rem'
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
    transition: 'border-color 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    }
  } as React.CSSProperties,

  terms: {
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    cursor: 'pointer',
    lineHeight: '1.4'
  } as React.CSSProperties,

  checkbox: {
    marginTop: '0.25rem',
    width: '1rem',
    height: '1rem'
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#1d4ed8'
    }
  } as React.CSSProperties,

  loginLink: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '1rem'
  } as React.CSSProperties,

  loginLinkText: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  } as React.CSSProperties
}