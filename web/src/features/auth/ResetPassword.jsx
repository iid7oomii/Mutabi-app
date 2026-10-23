import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CircleCheck, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { AuthTemplate } from '../../design-system/templates'
import { Button, Message, TextField } from '../../design-system/components'
export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  useEffect(() => { document.title = 'إعادة تعيين كلمة المرور | متابع' }, [])
  const submit = async event => { event.preventDefault(); setError(''); if (newPassword.length < 8) return setError('كلمة المرور يجب أن تحتوي على 8 خانات على الأقل.'); if (newPassword !== confirmPassword) return setError('كلمتا المرور غير متطابقتين.'); setLoading(true); try { const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password-confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, new_password: newPassword }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر تغيير كلمة المرور.'); setSuccess(true) } catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') } finally { setLoading(false) } }
  return <ThemeProvider><AuthTemplate title={success ? 'تم تغيير كلمة المرور' : 'إعادة تعيين كلمة المرور'} description={success ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' : 'أدخل كلمة مرور جديدة لحسابك.'} backAction={<Button type="button" variant="quiet" onClick={() => navigate('/login')}><ArrowRight size={18} /> تسجيل الدخول</Button>}>{success ? <div className="mt-auth__form"><span className="mt-empty__icon"><CircleCheck size={24} /></span><Button type="button" onClick={() => navigate('/login')}>تسجيل الدخول</Button></div> : <form className="mt-auth__form" onSubmit={submit}>{!token && <Message tone="error">الرابط غير صالح أو منتهي الصلاحية.</Message>}{error && <Message tone="error">{error}</Message>}<TextField id="reset-new-password" label="كلمة المرور الجديدة" icon={LockKeyhole} type={showNew ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required disabled={!token} trailing={<button type="button" onClick={() => setShowNew(value => !value)} aria-label={showNew ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button>} /><TextField id="reset-confirm-password" label="تأكيد كلمة المرور" icon={LockKeyhole} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required disabled={!token} trailing={<button type="button" onClick={() => setShowConfirm(value => !value)} aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>} /><small>استخدم 8 خانات على الأقل، مع حرف كبير وصغير ورقم ورمز خاص.</small><Button type="submit" loading={loading} disabled={!token}>تغيير كلمة المرور</Button><div className="mt-auth__link-row"><Link className="mt-auth__link" to="/login">العودة لتسجيل الدخول</Link></div></form>}</AuthTemplate></ThemeProvider>
}
