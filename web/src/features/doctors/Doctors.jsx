import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import DoctorsView from './components/DoctorsView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/doctors.css'

function DoctorsContent() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const load = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users?role=Doctor`, { credentials: 'include' })
    if (!response.ok) throw new Error('تعذر تحميل الأخصائيين.')
    const data = await response.json()
    setDoctors(Array.isArray(data) ? data : [])
  }
  useEffect(() => {
    document.title = 'الأخصائيون | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/users?role=Doctor`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setDoctors(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setLoadError('تعذر تحميل الأخصائيين. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])
  const addDoctor = async form => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/doctor`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر إضافة الأخصائي.')
    await load()
    return data.temp_password
  }
  const toggleStatus = async doctor => {
    const action = doctor.is_active ? 'deactivate' : 'activate'
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${doctor.id}/${action}`, { method: 'PUT', credentials: 'include' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر تغيير حالة الأخصائي.') }
    await load()
  }
  const deleteDoctor = async id => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر حذف الأخصائي.') }
    await load()
  }
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><DoctorsView doctors={doctors} loading={loading} loadError={loadError} onOpenDoctor={id => navigate(`/doctors/${id}`)} onAddDoctor={addDoctor} onToggleStatus={toggleStatus} onDeleteDoctor={deleteDoctor} /></main></div>
}
export default function Doctors() { return <ThemeProvider><DoctorsContent /></ThemeProvider> }
