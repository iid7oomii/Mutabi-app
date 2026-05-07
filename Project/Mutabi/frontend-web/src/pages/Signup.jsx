import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo-mark.svg';
import userlogo from '../assets/logo-user.png';
import passlogo from '../assets/Passlogo.png';

export default function Signup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { fetchUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  const [form, setForm] = useState({
    // Clinic
    clinic_name: '',
    logo_url: '',
    contact_phone: '',
    address: '',
    // Admin
    first_name: '',
    second_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = (e) => {
    e.preventDefault()
    setError('')

    if (!form.clinic_name || !form.contact_phone) {
      setError('يرجى تعبئة جميع الحقول المطلوبة')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('كلمة المرور غير متطابقة')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clinic_name: form.clinic_name,
          logo_url: form.logo_url || 'https://example.com/logo.png',
          contact_phone: form.contact_phone,
          address: form.address,
          first_name: form.first_name,
          second_name: form.second_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
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
        <div className="text-center mb-8">
          <img src={logo} alt="Logo"  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"/>
          <h1 className="text-3xl font-bold text-gray-800">مُتابِع</h1>
          <p className="text-gray-400 mt-1 text-sm">إنشاء حساب جديد</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'text-white' : 'text-white'}`}
            style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
            1
          </div>
          <div className="h-1 w-16 rounded"
            style={{ background: step === 2 ? 'linear-gradient(135deg, #0F4C81, #2c78bb)' : '#e5e7eb' }} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'text-white' : 'text-gray-400 bg-gray-200'}`}
            style={step === 2 ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}>
            2
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {error}
            </div>
          )}

          {/* Step 1 - Clinic */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">بيانات العيادة</h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">اسم العيادة *</label>
                <input name="clinic_name" value={form.clinic_name} onChange={handleChange}
                  placeholder="عيادة الأمل" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">رقم التواصل *</label>
                <input name="contact_phone" value={form.contact_phone} onChange={handleChange}
                  placeholder="0512345678" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">العنوان</label>
                <input name="address" value={form.address} onChange={handleChange}
                  placeholder="الرياض، حي النزهة"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                التالي ←
              </button>
            </form>
          )}

          {/* Step 2 - Admin */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">بيانات المدير</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الأول</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange}
                    placeholder="محمد" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الثاني</label>
                  <input name="second_name" value={form.second_name} onChange={handleChange}
                    placeholder="العمري" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="example@gmail.com" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">رقم الجوال</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="0512345678" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">تأكيد كلمة المرور</label>
                <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
                  → رجوع
                </button>
                <button type="submit" disabled={loading}
                  className="w-2/3 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          )}
          <p className="text-center text-sm text-gray-400 mt-6">
            لديك حساب بالفعل؟{' '}
            <a  href="/"  className="font-medium hover:underline" style={{  background: 'linear-gradient(135deg, #0F4C81, #2c78bb)', WebkitBackgroundClip: 'text',WebkitTextFillColor: 'transparent'}}  > تسجيل الدخول</a>
          </p>
        </div>

      </div>
    </div>
  )
}