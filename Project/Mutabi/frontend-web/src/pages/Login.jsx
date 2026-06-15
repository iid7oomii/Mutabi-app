import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../assets/logo-mark.svg';
import { API_BASE_URL } from '../config';
import userlogo from '../assets/logo-user.png';
import passlogo from '../assets/Passlogo.png';


const WarningIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const EyeIcon = ({ show }) => show ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function Login() {
  document.title = 'Login | Mutabi'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [noSubscription, setNoSubscription] = useState(false)

  const { fetchUser, user } = useAuthStore()

  useEffect(() => {
    if (!user) return
    // SUBSCRIPTION CHECK DISABLED
    // const { subscription } = useAuthStore.getState()
    // if (user.role === 'admin' && !['trial', 'active'].includes(subscription?.status)) {
    //   return
    // }
    if (!user.active) {
      navigate('/set_password', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNoSubscription(false)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }

      if (data.role === 'parent') {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' })
        setError('حساب ولي الأمر متاح فقط عبر تطبيق الجوال')
        return
      }

      // SUBSCRIPTION CHECK DISABLED
      // const loggedInUser = await fetchUser()
      // const { subscription } = useAuthStore.getState()
      // if (loggedInUser?.role === 'admin' && !['trial', 'active'].includes(subscription?.status)) {
      //   setNoSubscription(true)
      //   return
      // }
      await fetchUser()

    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">

      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-5 right-5 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        العودة للرئيسية
      </button>

      <div className="w-full max-w-md px-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"/>
          <h1 className="text-2xl font-bold text-gray-800">متابع</h1>
          <p className="text-gray-400 mt-1 text-sm">منصة متابعة العلاج الوظيفي</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">تسجيل الدخول</h2>

          {noSubscription && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-orange-800 font-semibold text-sm mb-1">ليس لديك اشتراك نشط</p>
              <p className="text-orange-600 text-xs mb-3">يجب الاشتراك أولاً للوصول إلى النظام</p>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
              >
                اشترك الآن ←
              </button>
            </div>
          )}

          {error && !noSubscription && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <img src={userlogo} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40"/>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
              <div className="relative">
                <img src={passlogo} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40"/>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-sm hover:underline text-blue-600">
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
            >
              {loading ? 'جاري التحميل...' : 'دخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            إنشاء حساب جديد
          </Link>
        </p>

      </div>
    </div>
  )
}