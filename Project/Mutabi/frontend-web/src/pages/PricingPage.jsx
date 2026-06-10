import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

document.title = 'Subscription | Mutabi'

const PLAN_FEATURES = [
  'خطط علاجية مخصصة',
  'متابعة التمارين اليومية',
  'تقارير التقدم',
  'ملاحظات الطبيب',
  'إدارة المواعيد',
  'تطبيق الجوال للأهل',
  'مقالات التوعية',
  'إشعارات فورية',
]

const IconSpecialist = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconClinic = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const IconUnlimited = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const PLANS_META = {
  specialist: { Icon: IconSpecialist, color: 'blue',   badge: null,             hasTrial: true  },
  clinic:     { Icon: IconClinic,     color: 'orange', badge: 'الأكثر شيوعاً', hasTrial: true  },
  unlimited:  { Icon: IconUnlimited,  color: 'purple', badge: 'للعيادات الكبيرة', hasTrial: false },
}

const COLOR_MAP = {
  blue:   { border: 'border-blue-200',  bg: 'bg-blue-50',   btn: 'bg-blue-600 hover:bg-blue-700',   badge: 'bg-blue-100 text-blue-700',   icon: 'text-blue-600' },
  orange: { border: 'border-orange-400', bg: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', btn: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-100 text-purple-700', icon: 'text-purple-600' },
}

export default function PricingPage() {
  const navigate = useNavigate()
  const [plans, setPlans]         = useState([])
  const [current, setCurrent]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [error, setError]         = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/subscriptions/plans`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/v1/subscriptions/current`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([plansData, currentData]) => {
      setPlans(plansData)
      setCurrent(currentData)
    }).catch(() => setError('تعذر تحميل الباقات'))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckout = async (planType) => {
    setCheckoutLoading(planType)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/subscriptions/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطأ في الدفع'); return }
      window.location.href = data.payment_url
    } catch {
      setError('تعذر الاتصال ببوابة الدفع')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const isCurrentPlan = (planType) =>
    current && ['trial', 'active'].includes(current.status) && current.plan_type === planType

  const formatExpiry = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 text-lg">جاري التحميل...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">اختر الباقة المناسبة</h1>
          <p className="text-gray-500 text-lg">جميع الباقات تشمل كامل الميزات — الفرق في عدد المستخدمين</p>

          {current?.status === 'trial' && ['specialist', 'clinic'].includes(current?.plan_type) && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>أنت في فترة التجربة المجانية — تنتهي في {formatExpiry(current.expires_at)}</span>
            </div>
          )}
          {current?.status === 'expired' && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
              <span>⚠️</span>
              <span>انتهت صلاحية اشتراكك — اشترك الآن للاستمرار</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg py-3 px-4">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="relative mb-12">
          {/* COMING SOON OVERLAY */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-2xl shadow-lg border border-amber-200">
              <svg className="h-10 w-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-bold text-gray-800">الباقات قيد الإنشاء</p>
              <p className="text-sm text-gray-500 text-center">سيتم الإعلان عن الباقات والأسعار قريباً</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 pointer-events-none select-none">
          {plans.map(plan => {
            const meta  = PLANS_META[plan.plan_type] || {}
            const c     = COLOR_MAP[meta.color] || COLOR_MAP.blue
            const active = isCurrentPlan(plan.plan_type)

            return (
              <div
                key={plan.plan_type}
                className={`relative bg-white rounded-2xl border-2 ${active ? 'border-orange-400 shadow-lg shadow-orange-100' : c.border} p-6 flex flex-col transition-shadow hover:shadow-md`}
              >
                {meta.badge && (
                  <span className={`absolute -top-3 right-6 ${c.badge} text-xs font-bold px-3 py-1 rounded-full`}>
                    {meta.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute -top-3 left-6 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    باقتك الحالية
                  </span>
                )}

                <div className={`flex items-center justify-center h-12 w-12 rounded-xl mb-3 ${c.bg} ${c.icon}`}>
                  <meta.Icon />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.display_name}</h2>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price_sar.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm"> ريال / سنة</span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-600 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{plan.max_doctors === -1 ? 'عدد غير محدود من الأطباء' : `${plan.max_doctors} ${plan.max_doctors === 1 ? 'طبيب' : 'أطباء'}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{plan.max_patients_per_doctor === -1 ? 'عدد غير محدود من المرضى' : `${plan.max_patients_per_doctor} مريضاً لكل طبيب`}</span>
                  </div>
                  {PLAN_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.plan_type === 'unlimited' && (
                    <div className="flex items-center gap-2 font-medium text-purple-700">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>أولوية في طلبات الميزات الجديدة</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCheckout(plan.plan_type)}
                  disabled={active || checkoutLoading === plan.plan_type}
                  className={`w-full py-3 rounded-xl text-white font-bold transition-all ${
                    active
                      ? 'bg-gray-200 text-gray-500 cursor-default'
                      : `${c.btn} cursor-pointer`
                  }`}
                >
                  {checkoutLoading === plan.plan_type
                    ? 'جاري التحويل...'
                    : active
                      ? 'باقتك الحالية'
                      : meta.hasTrial
                        ? 'ابدأ التجربة المجانية'
                        : 'اشترك الآن'}
                </button>
              </div>
            )
          })}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">أسئلة شائعة</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              { q: 'هل يمكنني الترقية لاحقاً؟', a: 'نعم، يمكنك الترقية في أي وقت وستُحسب الأشهر المتبقية.' },
              { q: 'هل الدفع آمن؟', a: 'نعم، ندفع عبر Moyasar المعتمدة ويدعم mada وVISA وApple Pay.' },
              { q: 'ماذا يحدث بعد انتهاء التجربة؟', a: 'يمكنك الاشتراك بأي باقة والاستمرار. بياناتك محفوظة.' },
              { q: 'هل هناك دفع شهري؟', a: 'الاشتراك سنوي فقط بسعر مخفض مقارنة بالشهري.' },
            ].map(item => (
              <div key={item.q} className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-800 mb-1">{item.q}</p>
                <p className="text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">
            ← العودة
          </button>
        </div>
      </div>
    </div>
  )
}
