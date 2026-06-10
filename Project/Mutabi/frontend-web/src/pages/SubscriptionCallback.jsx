import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'

document.title = 'نتيجة الدفع | متابع'

function CountdownCircle({ seconds, total = 5 }) {
  const r = 28
  const circumference = 2 * Math.PI * r
  const progress = (seconds / total) * circumference

  return (
    <div className="relative inline-flex items-center justify-center w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-green-600">{seconds}</span>
    </div>
  )
}

export default function SubscriptionCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const paymentId = searchParams.get('id') || searchParams.get('payment_id')
    const moyasarStatus = searchParams.get('status')

    if (!paymentId) {
      setStatus('error')
      return
    }

    if (moyasarStatus === 'failed' || moyasarStatus === 'canceled' || moyasarStatus === 'cancelled') {
      setStatus('failed')
      return
    }

    fetch(`${API_BASE_URL}/api/v1/subscriptions/verify?payment_id=${paymentId}`, {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('error'))
  }, [])

  // Countdown + redirect on success
  useEffect(() => {
    if (status !== 'success') return
    if (countdown <= 0) {
      window.location.replace('/login')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">جاري التحقق من الدفع...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center mx-4">

          {/* Checkmark */}
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم الاشتراك بنجاح!</h1>
          <p className="text-gray-500 text-sm mb-6">
            اشتراكك مفعّل الآن. يمكنك تسجيل الدخول والبدء في استخدام المنصة.
          </p>

          <div className="flex flex-col items-center gap-3">
            <CountdownCircle seconds={countdown} total={5} />
            <p className="text-xs text-gray-400">سيتم تحويلك لصفحة الدخول خلال {countdown} ثوانٍ</p>
          </div>

          <button
            onClick={() => window.location.replace('/login')}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
          >
            تسجيل الدخول الآن
          </button>
        </div>
      </div>
    )
  }

  if (status === 'failed' || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center mx-4">

          {/* X mark */}
          <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-5">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">لم يتم الدفع</h1>
          <p className="text-gray-500 text-sm mb-6">
            {status === 'error'
              ? 'تعذر التحقق من الدفع. إذا تم خصم المبلغ يرجى التواصل مع الدعم.'
              : 'فشلت عملية الدفع أو تم إلغاؤها. يمكنك المحاولة مرة أخرى.'}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/subscription')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition"
            >
              حاول مرة أخرى
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-gray-600 text-sm transition"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
