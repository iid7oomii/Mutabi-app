import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, MailCheck } from 'lucide-react'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { AuthTemplate } from '../../design-system/templates'
import { Button, Message, TextField } from '../../design-system/components'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { document.title = 'نسيت كلمة المرور | متابع' }, [])

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('يلزم إدخال البريد الإلكتروني')
      return
    }
    setLoading(true)
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
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

  return <ThemeProvider>
    <AuthTemplate
      title={success ? 'تم إرسال الطلب' : 'نسيت كلمة المرور؟'}
      description={success
        ? 'إذا كان البريد مرتبطًا بحساب في متابع، تُرسل رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.'
        : 'يُرسل رابط إعادة التعيين إلى البريد الإلكتروني المرتبط بالحساب.'}
      backAction={<Button variant="quiet" type="button" onClick={() => navigate('/login')}>
        <ArrowRight size={18} aria-hidden="true" /> تسجيل الدخول
      </Button>}>
      {success ? <div className="mt-auth__form">
        <span className="mt-empty__icon"><MailCheck size={24} aria-hidden="true" /></span>
        <Button type="button" onClick={() => navigate('/login')}>العودة لتسجيل الدخول</Button>
      </div> : <form className="mt-auth__form" onSubmit={handleSubmit}>
        {error && <Message tone="error">{error}</Message>}
        <TextField id="forgot-email" label="البريد الإلكتروني" icon={Mail} type="email"
          autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}
          placeholder="name@example.com" required />
        <Button type="submit" loading={loading}>إرسال رابط إعادة التعيين</Button>
        <div className="mt-auth__link-row"><Link className="mt-auth__link" to="/login">العودة لتسجيل الدخول</Link></div>
      </form>}
    </AuthTemplate>
  </ThemeProvider>
}
