import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo-mark.svg'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setSuccess(true)
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md px-4">

        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="inline-flex w-14 h-14 rounded-2xl mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">مُتابِع</h1>
          <p className="text-gray-400 mt-1 text-sm">منصة العلاج</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">تم إرسال الرابط</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                إذا كان البريد الإلكتروني مسجلاً، ستجد رابط إعادة تعيين كلمة المرور في صندوق الوارد. الرابط صالح لمدة ساعة واحدة.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">نسيت كلمة المرور؟</h2>
              <p className="text-sm text-gray-400 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                <a href="/" className="font-medium hover:underline" style={{ color: '#0F4C81' }}>
                  العودة لتسجيل الدخول
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}