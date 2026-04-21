// app/settings/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { supabase } from '@/lib/supabase/client'
import { Toast } from '@/app/components/Toast'

interface PaymentHistory {
  id: string
  date: string
  description: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  invoice_url?: string
}

interface Subscription {
  plan: string
  price: number
  currency: string
  status: 'active' | 'canceled' | 'expired'
  next_billing_date: string
  auto_renew: boolean
}

interface PaymentMethod {
  card_number: string
  card_type: string
  expiry_date: string
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'Professional Plan',
    price: 99,
    currency: '$',
    status: 'active',
    next_billing_date: '17 января 2026',
    auto_renew: true,
  })

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    card_number: '4242',
    card_type: 'Visa',
    expiry_date: '12/26',
  })

  useEffect(() => {
    if (!user) return
    loadPaymentData()
  }, [user])

  const loadPaymentData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('subscription_data, payment_history, payment_method')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Ошибка загрузки данных о платежах:', error)
        return
      }

      if (profile) {
        if (profile.subscription_data) {
          setSubscription((prev) => ({
            ...prev,
            ...profile.subscription_data,
            next_billing_date: formatDateForDisplay(profile.subscription_data.next_billing_date),
          }))
        }

        if (profile.payment_history && Array.isArray(profile.payment_history)) {
          const formattedHistory = profile.payment_history.map((payment: any) => ({
            ...payment,
            date: formatDateForDisplay(payment.date),
          }))
          setPaymentHistory(formattedHistory)
        }

        if (profile.payment_method) {
          setPaymentMethod(profile.payment_method)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных о платежах:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const handleChangePlan = async () => {
    try {
      const newSubscription = {
        ...subscription,
        plan: subscription.plan === 'Professional Plan' ? 'Business Plan' : 'Professional Plan',
        price: subscription.plan === 'Professional Plan' ? 199 : 99,
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_data: newSubscription,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id)

      if (error) throw error

      setSubscription(newSubscription)
      setToast({ message: `План изменён на ${newSubscription.plan}`, type: 'success' })
    } catch (error) {
      console.error('Ошибка изменения плана:', error)
      setToast({ message: 'Ошибка изменения плана', type: 'error' })
    }
  }

  const handleUpdatePaymentMethod = async () => {
    try {
      const newPaymentMethod = {
        card_number: '5555',
        card_type: 'MasterCard',
        expiry_date: '06/27',
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          payment_method: newPaymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id)

      if (error) throw error

      setPaymentMethod(newPaymentMethod)
      setToast({ message: 'Способ оплаты обновлён', type: 'success' })
    } catch (error) {
      console.error('Ошибка обновления способа оплаты:', error)
      setToast({ message: 'Ошибка обновления способа оплаты', type: 'error' })
    }
  }

  const handleDownloadInvoice = async (paymentId: string) => {
    setToast({ message: `Скачивание счёта для платежа ${paymentId} будет реализовано позже`, type: 'info' })
  }

  const handleToggleAutoRenew = async () => {
    try {
      const newAutoRenew = !subscription.auto_renew
      const newSubscription = { ...subscription, auto_renew: newAutoRenew }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_data: newSubscription,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id)

      if (error) throw error

      setSubscription(newSubscription)
      setToast({ message: `Автопродление ${newAutoRenew ? 'включено' : 'отключено'}`, type: 'success' })
    } catch (error) {
      console.error('Ошибка обновления автопродления:', error)
      setToast({ message: 'Ошибка обновления настроек', type: 'error' })
    }
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p>Загрузка...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p>Загрузка данных о платежах...</p>
      </div>
    )
  }

  if (user.role !== 'organizer') {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Платежи</h2>
          <p style={{ color: '#6b7280' }}>Управление подпиской и историей платежей</p>
        </div>
        <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #fde68a' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Доступ ограничен</h3>
          <p style={{ marginBottom: '1rem' }}>Раздел "Платежи" доступен только для организаторов выставок.</p>
          <p>Ваша роль: <strong>{user.role === 'exhibitor' ? 'Экспонент' : 'Посетитель'}</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Платежи и подписка</h2>
        <p style={{ color: '#6b7280' }}>Управление подпиской, способами оплаты и историей платежей</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Текущая подписка */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>{subscription.plan}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Действует до {subscription.next_billing_date}</p>
            </div>
            <button onClick={handleChangePlan} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '0.375rem', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}>Изменить план</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#374151' }}>{subscription.currency}{subscription.price}</span>
            <span style={{ color: '#6b7280' }}>/ месяц</span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
              <input type="checkbox" checked={subscription.auto_renew} onChange={handleToggleAutoRenew} style={{ display: 'none' }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: subscription.auto_renew ? '#10b981' : '#d1d5db', borderRadius: '20px', transition: '.4s' }}>
                <span style={{ position: 'absolute', height: '16px', width: '16px', left: '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: subscription.auto_renew ? 'translateX(20px)' : 'translateX(0)' }} />
              </span>
            </label>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Автопродление</span>
          </div>
        </div>

        {/* Способ оплаты */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Способ оплаты</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '25px', backgroundColor: '#3b82f6', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                {paymentMethod.card_type.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>•••• •••• •••• {paymentMethod.card_number}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Истекает {paymentMethod.expiry_date}</p>
              </div>
            </div>
            <button onClick={handleUpdatePaymentMethod} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}>Изменить</button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Следующий платёж будет списан с этой карты {subscription.next_billing_date}</p>
        </div>

        {/* История платежей */}
        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>История платежей</h3>
          {paymentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>История платежей пуста</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Здесь будут отображаться ваши платежи после подключения подписки</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Дата</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Описание</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Стоимость</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Статус</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#374151' }}>{payment.date}</td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#374151' }}>{payment.description}</td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{subscription.currency}{payment.amount.toFixed(2)}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: payment.status === 'completed' ? '#d1fae5' : payment.status === 'pending' ? '#fef3c7' : '#fee2e2', color: payment.status === 'completed' ? '#065f46' : payment.status === 'pending' ? '#92400e' : '#dc2626', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                          {payment.status === 'completed' ? 'Оплачено' : payment.status === 'pending' ? 'Ожидание' : 'Ошибка'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <button onClick={() => handleDownloadInvoice(payment.id)} style={{ padding: '0.375rem 0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Скачать</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}>Загрузить полную историю</button>
          </div>
        </div>

        {/* Информация для организатора */}
        <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #dbeafe' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>Информация для организатора</h4>
          <ul style={{ fontSize: '0.875rem', color: '#1e40af', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>Тарифный план определяет количество активных выставок</li>
            <li>Дополнительные выставки можно приобрести отдельно</li>
            <li>Все цены указаны без учёта НДС</li>
            <li>Техническая поддержка включена в стоимость</li>
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <a href="#" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>📄 Посмотреть договор оферты</a>
          </div>
        </div>
      </div>
    </div>
  )
}