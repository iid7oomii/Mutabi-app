import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { AuthTemplate } from '../../design-system/templates'
import { Button, Message, TextField } from '../../design-system/components'
export default function SetPassword() {
  const navigate = useNavigate()
  const { fetchUser, user } = useAuthStore()
  const [tempPassword, setTempPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showTemp, setShowTemp] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { document.title = 'تفعيل الحساب | متابع' }, [])
  useEffect(() => { if (user?.active) navigate('/dashboard', { replace: true }) }, [user, navigate])
  const submit = async event => { event.preventDefault(); setLoading(true); setError(''); try { const response = await fetch(`${API_BASE_URL}/api/v1/auth/set_password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tempPassword, newPassword }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر تفعيل الحساب.'); await fetchUser(); navigate('/dashboard', { replace: true }) } catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') } finally { setLoading(false) } }
  return <ThemeProvider><AuthTemplate title="تفعيل الحساب" description="استخدم كلمة المرور المؤقتة التي وصلتك، ثم أنشئ كلمة مرور جديدة." backAction={<Button type="button" variant="quiet" onClick={() => navigate('/login')}><ArrowRight size={18} /> تسجيل الدخول</Button>}><form className="mt-auth__form" onSubmit={submit}>{error && <Message tone="error">{error}</Message>}<TextField id="temporary-password" label="كلمة المرور المؤقتة" icon={LockKeyhole} type={showTemp ? 'text' : 'password'} autoComplete="current-password" value={tempPassword} onChange={event => setTempPassword(event.target.value)} required trailing={<button type="button" onClick={() => setShowTemp(value => !value)} aria-label={showTemp ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showTemp ? <EyeOff size={18} /> : <Eye size={18} />}</button>} /><TextField id="new-password" label="كلمة المرور الجديدة" icon={LockKeyhole} type={showNew ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required trailing={<button type="button" onClick={() => setShowNew(value => !value)} aria-label={showNew ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button>} /><Button type="submit" loading={loading}>تفعيل الحساب</Button></form></AuthTemplate></ThemeProvider>
}
