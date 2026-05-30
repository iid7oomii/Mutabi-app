import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/logo-mark.svg'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!token) setError('الرابط غير صالح أو منتهي الصلاحية.')
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 خانات على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }
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
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">تم تغيير كلمة المرور</h2>
              <p className="text-gray-500 text-sm mb-6">يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">إعادة تعيين كلمة المرور</h2>
              <p className="text-sm text-gray-400 mb-6">أدخل كلمة مرور جديدة وقوية لحسابك.</p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={!token}
                      className="w-full pr-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(p => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNew
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={!token}
                      className="w-full pr-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirm
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  يجب أن تحتوي على 8 خانات على الأقل، وحرف كبير، وحرف صغير، ورقم، ورمز خاص.
                </p>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: loading || !token ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                  {loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
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
