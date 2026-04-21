// app/page.tsx - УЛУЧШЕННАЯ ВЕРСИЯ
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Навигация как в макете */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2563eb',
              }}
            >
              ExpoSphere
            </h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" className="btn btn-secondary">
                Войти
              </Link>
              <Link href="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Герой-секция */}
      <main className="container" style={{ padding: '4rem 1rem' }}>
        <div
          style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
        >
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              lineHeight: '1.2',
            }}
          >
            Виртуальные выставки
            <br />
            нового поколения
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              marginBottom: '2.5rem',
            }}
          >
            Создавайте профессиональные виртуальные выставки за минуты.
            Привлекайте посетителей и расширяйте бизнес онлайн.
          </p>

          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
          >
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Начать бесплатно
            </Link>
            <Link
              href="/how-it-works"
              className="btn btn-secondary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Как это работает
            </Link>
          </div>
        </div>

        {/* Секция ролей - пока простые карточки */}
        <div style={{ marginTop: '6rem' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '1.875rem',
              fontWeight: '600',
              marginBottom: '3rem',
            }}
          >
            Выберите свою роль
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Организатор',
                desc: 'Создавайте выставки и приглашайте экспонентов',
                icon: '📊',
                color: '#dbeafe',
              },
              {
                title: 'Экспонент',
                desc: 'Представляйте компанию на выставках',
                icon: '🏢',
                color: '#fef3c7',
              },
              {
                title: 'Посетитель',
                desc: 'Исследуйте выставки и находите партнёров',
                icon: '👤',
                color: '#dcfce7',
              },
            ].map((role) => (
              <div
                key={role.title}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: role.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '2rem',
                  }}
                >
                  {role.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}
                >
                  {role.title}
                </h3>
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                >
                  {role.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Простой футер */}
      <footer
        style={{
          backgroundColor: '#f9fafb',
          padding: '2rem',
          marginTop: '4rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            © 2025 ExpoSphere. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
