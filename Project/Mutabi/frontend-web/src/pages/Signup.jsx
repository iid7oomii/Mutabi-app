import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import logo from '../assets/logo-mark.svg';
import userlogo from '../assets/logo-user.png';
import { API_BASE_URL } from '../config';
import passlogo from '../assets/Passlogo.png';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons'

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

export default function Signup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { fetchUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  const [form, setForm] = useState({
    clinic_name: '',
    logo_url: '',
    contact_phone: '',
    address: '',
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
    setError(null)

		const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;

    if (!form.clinic_name || !nameRegex.test(form.clinic_name)){
			setError({field:'clinic_name', message:'اسم العيادة يجب ان يكون نص'})
			return
    }

		if (form.clinic_name.length > 50){
			setError({field:'clinic_name' , message:'اسم العياده يجب ان يكون اقل من 50 حرف'})
			return
		}

		const phoneRegex = /^05\d{8}$/;

		if (!form.contact_phone || !phoneRegex.test(form.contact_phone) || form.contact_phone.length != 10) {
			setError({field:'contact_phone' , message:'رقم الجوال يجب أن يكون رقم سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام'});
			return
		}

    setStep(2)
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;

  if (!form.first_name || !nameRegex.test(form.first_name)) {
    setError({ field: 'first_name', message: 'الاسم الأول مطلوب ويجب أن يحتوي على أحرف فقط' });
    return;
  }
  if (form.first_name.length < 2 || form.first_name.length > 50) {
    setError({ field: 'first_name', message: 'الاسم الأول يجب أن يكون بين 2 و 50 حرف' });
    return;
  }

  if (!form.second_name || !nameRegex.test(form.second_name)) {
    setError({ field: 'second_name', message: 'الاسم الثاني مطلوب ويجب أن يحتوي على أحرف فقط' });
    return;
  }
  if (form.second_name.length < 2 || form.second_name.length > 50) {
    setError({ field: 'second_name', message: 'الاسم الثاني يجب أن يكون بين 2 و 50 حرف' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !emailRegex.test(form.email)) {
    setError({ field: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' });
    return;
  }

  const phoneRegex = /^05\d{8}$/;
  if (!form.phone || !phoneRegex.test(form.phone)) {
    setError({ field: 'phone', message: 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!form.password || !passwordRegex.test(form.password)) {
    setError({ 
      field: 'password', 
      message: 'كلمة المرور يجب أن تكون 8 خانات على الأقل وتحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص' 
    });
    return;
  }

  if (form.password !== form.confirm_password) {
    setError({ field: 'confirm_password', message: 'كلمة المرور غير متطابقة' });
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
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
    });

    const data = await res.json();

    if (!res.ok) {
      setError({ message: data.error || 'حدث خطأ أثناء إنشاء الحساب' });
      return;
    }

    await fetchUser();

  } catch {
    setError({ message: 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
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
          <div className={`h-1 w-16 rounded `}
            className="h-1 w-16 rounded"
            style={{  background: step === 2  ? 'linear-gradient(135deg, #0F4C81, #2c78bb)' : '#e5e7eb' }}/>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'text-white' : 'text-gray-400 bg-gray-200'}`}
            style={step === 2 ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}>
            2
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {error.message}
            </div>
          )}

          {/* Step 1 - Clinic */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">بيانات العيادة</h2>

                    <div>
                    <label 
                        className={`block text-sm font-medium mb-1 transition ${
                        error?.field === 'clinic_name' ? 'text-red-500' : 'text-gray-600'
                        }`}
                    >
                        اسم العيادة *
                    </label>
                    
                    <input 
                        name="clinic_name" 
                        value={form.clinic_name} 
                        onChange={(e) => {
                        handleChange(e);
                        if (error?.field === 'clinic_name') setError(null);
                        }}
                        placeholder="عيادة الأمل" 
                        required
                        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition ${
                        error?.field === 'clinic_name' 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-700 bg-red-50' 
                            : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100 text-gray-700'
                        }`} 
                    />
                    
                    {error?.field === 'clinic_name' && (
                        <p className="mt-2 text-sm text-red-500">{error.message}</p>
                    )}
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">رقم التواصل *</label>
                <input name="contact_phone" maxLength="10" value={form.contact_phone} onChange={(e) => {
										e.target.value = e.target.value.replace(/[^0-9]/g, '');
										handleChange(e);
									}}
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
                <span className="flex items-center justify-center gap-2">التالي <ChevronLeftIcon className="w-4 h-4" /></span>
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
                <input name="phone" maxLength="10" value={form.phone} onChange={(e) => {
										e.target.value = e.target.value.replace(/[^0-9]/g, '');
										handleChange(e);
									}}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="••••••••" required
                    className="w-full px-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input name="confirm_password" type={showConfirmPassword ? 'text' : 'password'} value={form.confirm_password} onChange={handleChange}
                    placeholder="••••••••" required
                    className="w-full px-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
                  <span className="flex items-center justify-center gap-2"><ChevronRightIcon className="w-4 h-4" /> رجوع</span>
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