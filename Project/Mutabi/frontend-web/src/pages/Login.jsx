import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../assets/logo-mark.svg';
import userlogo from '../assets/logo-user.png';
import passlogo from '../assets/Passlogo.png';

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { fetchUser, user } = useAuthStore()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const res = await fetch('/api/v1/auth/login', {
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

    await fetchUser()


  } catch {
    setError('تعذر الاتصال بالخادم')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <img src={logo} alt="Logo"  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"/>
          <h1 className="text-3xl font-bold text-gray-800">مُتابِع</h1>
          <p className="text-gray-400 mt-1 text-sm">منصة متابعة العلاج</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">تسجيل الدخول</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

         <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                    البريد الإلكتروني
                </label>
                <div className="relative">
                    <img 
                    src={userlogo} 
                    alt="user" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" 
                    />
                    <input    
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                كلمة المرور
              </label>
              <div className='relative'>
                <img src={passlogo} alt="" className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40'/>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
              />
              </div>
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

          <p className="text-center text-sm text-gray-400 mt-6">
            ليس لديك حساب؟{' '}
            <a href="/signup" className="text-blue-500 font-medium hover:underline">
              إنشاء حساب
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}