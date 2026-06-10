import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo-mark.svg'
import { API_BASE_URL } from '../config'

// ─── Validation helpers ───────────────────────────────────────────────────────

const isLettersOnly = (v) => /^[؀-ۿa-zA-Z\s]+$/.test(v.trim())

const isSaudiPhone = (v) => {
  const n = v.replace(/[\s-]/g, '')
  return /^(05\d{8}|0(11|12|13|14|16|17)\d{7}|9200\d{6}|800\d{7})$/.test(n)
}

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

const passwordRules = [
  { test: (p) => p.length >= 8,                    label: '8 أحرف على الأقل' },
  { test: (p) => /[A-Z]/.test(p),                  label: 'حرف كبير واحد' },
  { test: (p) => /[0-9]/.test(p),                  label: 'رقم واحد على الأقل' },
  { test: (p) => /[@#$!%^&*()_+\-=]/.test(p),      label: 'رمز خاص (@#$! ...)' },
]
const isStrongPassword = (p) => passwordRules.every(r => r.test(p))

// ─── UI components ────────────────────────────────────────────────────────────

function StepBar({ current, steps }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${
                  done || active ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`}
                style={(done || active) ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}
              >
                {done
                  ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  : i + 1
                }
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active || done ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-3 ${done ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
      {msg}
    </p>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 mr-0.5">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-4 py-3 rounded-xl border text-gray-800 text-sm transition placeholder:text-gray-300 focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
  }`

const EyeIcon = ({ show }) => show ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

function PasswordStrength({ password }) {
  if (!password) return null
  const passed = passwordRules.filter(r => r.test(password)).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {passwordRules.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < passed ? colors[passed - 1] : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {passwordRules.map((r, i) => (
          <span key={i} className={`text-xs flex items-center gap-1 ${r.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            {r.test(password)
              ? <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              : <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            }
            {r.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const STEPS = ['معلومات العيادة', 'بيانات المسؤول']

export default function Signup() {
  document.title = 'إنشاء حساب | متابع'

  const navigate            = useNavigate()
  const { fetchUser, user } = useAuthStore()

  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [touched, setTouched]   = useState({})
  const [success, setSuccess]   = useState(false)

  const [form, setForm] = useState({
    clinic_name:   '',
    contact_phone: '',
    address:       '',
    first_name:    '',
    second_name:   '',
    email:         '',
    phone:         '',
    password:      '',
    confirm:       '',
  })

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user])

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setApiError('')
  }

  const touch = (k) => () => setTouched(t => ({ ...t, [k]: true }))

  const errs = {
    clinic_name:   !form.clinic_name.trim()
                     ? 'اسم العيادة مطلوب'
                     : form.clinic_name.trim().length < 3
                       ? 'الاسم قصير جداً (3 أحرف على الأقل)'
                       : null,

    contact_phone: !form.contact_phone.trim()
                     ? 'رقم الجوال مطلوب'
                     : !isSaudiPhone(form.contact_phone)
                       ? 'رقم غير صحيح — مثال: 0512345678'
                       : null,

    first_name:    !form.first_name.trim()
                     ? 'الاسم الأول مطلوب'
                     : !isLettersOnly(form.first_name)
                       ? 'يجب أن يحتوي على أحرف فقط بدون أرقام'
                       : null,

    second_name:   !form.second_name.trim()
                     ? 'الاسم الأخير مطلوب'
                     : !isLettersOnly(form.second_name)
                       ? 'يجب أن يحتوي على أحرف فقط بدون أرقام'
                       : null,

    email:         !form.email.trim()
                     ? 'البريد الإلكتروني مطلوب'
                     : !isValidEmail(form.email)
                       ? 'صيغة البريد الإلكتروني غير صحيحة'
                       : null,

    phone:         !form.phone.trim()
                     ? 'رقم الجوال مطلوب'
                     : !isSaudiPhone(form.phone)
                       ? 'رقم غير صحيح — مثال: 0512345678'
                       : null,

    password:      !form.password
                     ? 'كلمة المرور مطلوبة'
                     : !isStrongPassword(form.password)
                       ? 'كلمة المرور لا تستوفي المتطلبات'
                       : null,

    confirm:       !form.confirm
                     ? 'تأكيد كلمة المرور مطلوب'
                     : form.confirm !== form.password
                       ? 'كلمتا المرور غير متطابقتين'
                       : null,
  }

  const showErr = (k) => touched[k] ? errs[k] : null

  const nextStep = () => {
    setTouched(t => ({ ...t, clinic_name: true, contact_phone: true }))
    if (errs.clinic_name || errs.contact_phone) return
    setStep(1)
  }

  const step1Fields = ['first_name', 'second_name', 'email', 'phone', 'password', 'confirm']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(t => ({ ...t, ...Object.fromEntries(step1Fields.map(k => [k, true])) }))
    if (step1Fields.some(k => errs[k])) return

    setLoading(true)
    setApiError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_name:   form.clinic_name.trim(),
          contact_phone: form.contact_phone.trim(),
          address:       form.address.trim() || undefined,
          first_name:    form.first_name.trim(),
          second_name:   form.second_name.trim(),
          email:         form.email.trim(),
          phone:         form.phone.trim(),
          password:      form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error || 'حدث خطأ أثناء التسجيل'); return }

      await fetchUser()
      setSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 3000)
    } catch {
      setApiError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
            <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">أهلاً وسهلاً!</h1>
          <p className="text-gray-500 mb-4">
            تم إنشاء حساب <strong className="text-gray-700">{form.clinic_name}</strong> بنجاح
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            جاري التحويل للوحة التحكم...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">

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
          <img src={logo} alt="متابع" className="inline-block w-14 h-14 rounded-2xl mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">متابع</h1>
          <p className="text-gray-400 mt-1 text-sm">منصة متابعة العلاج الوظيفي</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">

          <StepBar current={step} steps={STEPS} />

          {apiError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {apiError}
            </div>
          )}

          {/* ── Step 0: معلومات العيادة ── */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">بيانات العيادة</h2>

              <Field label="اسم العيادة أو المركز" required error={showErr('clinic_name')}>
                <input
                  value={form.clinic_name}
                  onChange={setField('clinic_name')}
                  onBlur={touch('clinic_name')}
                  placeholder="عيادة الأمل للعلاج الوظيفي"
                  className={inputCls(showErr('clinic_name'))}
                  autoFocus
                />
              </Field>

              <Field label="رقم هاتف العيادة" required error={showErr('contact_phone')}>
                <input
                  value={form.contact_phone}
                  onChange={setField('contact_phone')}
                  onBlur={touch('contact_phone')}
                  placeholder="0512345678"
                  type="tel"
                  dir="ltr"
                  className={inputCls(showErr('contact_phone'))}
                />
              </Field>

              <Field label="العنوان" error={null}>
                <input
                  value={form.address}
                  onChange={setField('address')}
                  placeholder="الرياض، حي النزهة (اختياري)"
                  className={inputCls(false)}
                />
              </Field>

              <button
                type="button"
                onClick={nextStep}
                className="w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                التالي
              </button>
            </div>
          )}

          {/* ── Step 1: بيانات المسؤول ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">بيانات المسؤول</h2>

              <div className="grid grid-cols-2 gap-3">
                <Field label="الاسم الأول" required error={showErr('first_name')}>
                  <input
                    value={form.first_name}
                    onChange={setField('first_name')}
                    onBlur={touch('first_name')}
                    placeholder="محمد"
                    className={inputCls(showErr('first_name'))}
                    autoFocus
                  />
                </Field>
                <Field label="الاسم الأخير" required error={showErr('second_name')}>
                  <input
                    value={form.second_name}
                    onChange={setField('second_name')}
                    onBlur={touch('second_name')}
                    placeholder="العمري"
                    className={inputCls(showErr('second_name'))}
                  />
                </Field>
              </div>

              <Field label="البريد الإلكتروني" required error={showErr('email')}>
                <input
                  value={form.email}
                  onChange={setField('email')}
                  onBlur={touch('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  dir="ltr"
                  className={inputCls(showErr('email'))}
                />
              </Field>

              <Field label="رقم الجوال" required error={showErr('phone')}>
                <input
                  value={form.phone}
                  onChange={setField('phone')}
                  onBlur={touch('phone')}
                  type="tel"
                  placeholder="0512345678"
                  dir="ltr"
                  className={inputCls(showErr('phone'))}
                />
              </Field>

              <Field label="كلمة المرور" required error={showErr('password')}>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={setField('password')}
                    onBlur={touch('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`${inputCls(showErr('password'))} pl-10`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    <EyeIcon show={showPass} />
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </Field>

              <Field label="تأكيد كلمة المرور" required error={showErr('confirm')}>
                <div className="relative">
                  <input
                    value={form.confirm}
                    onChange={setField('confirm')}
                    onBlur={touch('confirm')}
                    type={showConf ? 'text' : 'password'}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`${inputCls(showErr('confirm'))} pl-10`}
                  />
                  <button type="button" onClick={() => setShowConf(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    <EyeIcon show={showConf} />
                  </button>
                </div>
              </Field>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(0); setApiError('') }}
                  className="w-1/3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            سجّل الدخول
          </Link>
        </p>

      </div>
    </div>
  )
}
