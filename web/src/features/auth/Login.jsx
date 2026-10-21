import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { AuthTemplate } from '../../design-system/templates'
import { Button, Message, TextField } from '../../design-system/components'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { fetchUser, user } = useAuthStore()

  useEffect(() => { document.title = 'تسجيل الدخول | متابع' }, [])
  useEffect(() => {
    if (!user) return
    navigate(user.active ? '/dashboard' : '/set_password', { replace: true })
  }, [user, navigate])

  const handleLogin = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'تعذر تسجيل الدخول')
        return
      }
      if (data.role === 'parent') {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' })
        setError('حساب الأسرة متاح عبر تطبيق الجوال')
        return
      }
      await fetchUser()
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return <ThemeProvider>
    <AuthTemplate title="تسجيل الدخول إلى متابع" description="إدارة المتابعة العلاجية من مكان واحد."
      backAction={<Button variant="quiet" type="button" onClick={() => navigate('/')}>
        <ArrowRight size={18} aria-hidden="true" /> العودة للرئيسية
      </Button>}
      footer={<p className="mt-auth__foot">للحصول على حساب عيادة، <Link to="/?contact=1">تواصل معنا</Link>.</p>}>
      <form className="mt-auth__form" onSubmit={handleLogin}>
        {error && <Message tone="error">{error}</Message>}
        <TextField id="login-email" label="البريد الإلكتروني" icon={Mail} type="email"
          autoComplete="username" value={email} onChange={event => setEmail(event.target.value)}
          placeholder="name@example.com" required />
        <TextField id="login-password" label="كلمة المرور" icon={LockKeyhole}
          type={showPassword ? 'text' : 'password'} autoComplete="current-password"
          value={password} onChange={event => setPassword(event.target.value)}
          placeholder="كلمة المرور" required
          trailing={<button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={() => setShowPassword(current => !current)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>} />
        <div className="mt-auth__link-row"><Link className="mt-auth__link" to="/forgot-password">نسيت كلمة المرور؟</Link></div>
        <Button type="submit" loading={loading}>تسجيل الدخول</Button>
      </form>
    </AuthTemplate>
  </ThemeProvider>
}
