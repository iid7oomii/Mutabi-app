import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import RegistrationView from './components/RegistrationView'
import { emptyRegistrationForm } from './components/registrationForm'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import useAuthStore from '../../store/authStore'
import '../../design-system/dashboard.css'
import '../../design-system/registration.css'

function generatePassword() {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '@#$!']
  const all = sets.join('')
  const randomIndex = length => {
    const range = 0x100000000
    const limit = range - (range % length)
    const value = new Uint32Array(1)
    do { crypto.getRandomValues(value) } while (value[0] >= limit)
    return value[0] % length
  }
  const chars = [...sets.map(set => set[randomIndex(set.length)]), ...Array.from({ length: 8 }, () => all[randomIndex(all.length)])]
  for (let index = chars.length - 1; index > 0; index--) {
    const swap = randomIndex(index + 1)
    ;[chars[index], chars[swap]] = [chars[swap], chars[index]]
  }
  return chars.join('')
}

function registrationErrorMessage(message) {
  if (/email already exists/i.test(message)) return 'هذا البريد الإلكتروني مسجّل مسبقًا.'
  if (/phone number already exists/i.test(message)) return 'رقم الجوال مسجّل مسبقًا.'
  if (/domain|invalid email/i.test(message)) return 'استخدم بريدًا صحيحًا من مزوّدي البريد الموضحين في النموذج.'
  if (/phone number|invalid phone/i.test(message)) return 'أدخل رقم جوال سعودي صحيحًا.'
  return message
}

function RegistrationContent() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(emptyRegistrationForm)
  const [customRelationship, setCustomRelationship] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDoctors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setDoctors(Array.isArray(data) ? data : [])
    } catch { setError('تعذر تحميل قائمة الأخصائيين. حدّث الصفحة وحاول مجددًا.') }
  }, [])

  useEffect(() => { document.title = 'تسجيل طفل | متابع' }, [])
  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setDoctors(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setError('تعذر تحميل قائمة الأخصائيين. حدّث الصفحة وحاول مجددًا.') })
    return () => { cancelled = true }
  }, [isAdmin])

  const onFieldChange = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const onReset = () => {
    setForm({ ...emptyRegistrationForm })
    setCustomRelationship('')
    setError('')
    setSuccess('')
  }

  const onSubmit = async event => {
    event.preventDefault()
    setError('')
    if (!form.parent_first_name.trim() || !form.parent_second_name.trim()) return setError('أدخل الاسم الكامل لولي الأمر.')
    if (!form.parent_email.trim()) return setError('أدخل البريد الإلكتروني لولي الأمر.')
    if (!['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com'].includes(form.parent_email.trim().toLowerCase().split('@')[1])) return setError('استخدم بريدًا من Gmail أو Outlook أو Yahoo أو iCloud أو Hotmail.')
    if (!form.parent_phone.trim()) return setError('أدخل رقم جوال ولي الأمر.')
    if (!/^(05|\+9665|009665)\d{8}$/.test(form.parent_phone.trim())) return setError('أدخل رقم جوال سعودي صحيح يبدأ بـ 05 أو +9665 أو 009665.')
    if (!form.parent_relationship) return setError('اختر صلة القرابة بالطفل.')
    if (form.parent_relationship === 'other' && !customRelationship.trim()) return setError('وضّح صلة القرابة بالطفل.')
    if (!form.child_first_name.trim() || !form.child_second_name.trim()) return setError('أدخل الاسم الكامل للطفل.')
    if (!form.child_dob) return setError('أدخل تاريخ ميلاد الطفل.')
    if (new Date(`${form.child_dob}T00:00:00`) > new Date()) return setError('لا يمكن أن يكون تاريخ الميلاد في المستقبل.')
    if (isAdmin && !form.doctor_id) return setError('اختر الأخصائي المسؤول عن الطفل.')

    setSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/register-family`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_first_name: form.parent_first_name.trim(), parent_second_name: form.parent_second_name.trim(),
          parent_email: form.parent_email.trim(), parent_phone: form.parent_phone.trim(),
          parent_relationship: form.parent_relationship,
          custom_relationship: form.parent_relationship === 'other' ? customRelationship.trim() : null,
          parent_password: generatePassword(), child_first_name: form.child_first_name.trim(),
          child_second_name: form.child_second_name.trim(), date_of_birth: form.child_dob,
          diagnosis_notes: form.child_diagnosis.trim(), doctor_id: form.doctor_id || user?.user_id,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = data.error || 'تعذر تسجيل الطفل. حاول مجددًا.'
        if (message.toLowerCase().includes('doctor')) {
          await loadDoctors()
          setForm(current => ({ ...current, doctor_id: '' }))
          throw new Error('تعذر تعيين الأخصائي المحدد. اختر أخصائيًا آخر وحاول مجددًا.')
        }
        throw new Error(registrationErrorMessage(message))
      }
      const result = await response.json()
      setSuccess(result.invitation_sent === false
        ? 'تم تسجيل الطفل وولي الأمر، لكن تعذر إرسال دعوة البريد. راجع إعدادات البريد، ثم افتح صفحة الأطفال من القائمة.'
        : 'تم تسجيل الطفل وولي الأمر بنجاح. جارٍ فتح قائمة الأطفال…')
      if (result.invitation_sent !== false) window.setTimeout(() => navigate('/patients'), 1600)
    } catch (err) { setError(err.message || 'تعذر تسجيل الطفل. حاول مجددًا.') }
    finally { setSaving(false) }
  }

  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main">
    <RegistrationView form={form} onFieldChange={onFieldChange} customRelationship={customRelationship}
      onCustomRelationshipChange={setCustomRelationship} doctors={doctors} isAdmin={isAdmin}
      saving={saving} error={error} success={success} onSubmit={onSubmit} onReset={onReset} />
  </main></div>
}

export default function Registration() {
  return <ThemeProvider><RegistrationContent /></ThemeProvider>
}
