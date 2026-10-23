import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import AppointmentsView from './components/AppointmentsView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/appointments.css'

function AppointmentsContent() {
  const [children, setChildren] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [appointments, setAppointments] = useState([])
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [childrenError, setChildrenError] = useState('')
  const [appointmentsError, setAppointmentsError] = useState('')
  useEffect(() => {
    document.title = 'المواعيد | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) { const list = Array.isArray(data) ? data : []; setChildren(list); setSelectedId(list[0]?.id || ''); setLoadingAppointments(Boolean(list[0]?.id)) } })
      .catch(() => { if (!cancelled) setChildrenError('تعذر تحميل قائمة الأطفال. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoadingChildren(false) })
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/appointments/child/${selectedId}`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setAppointments(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setAppointmentsError('تعذر تحميل مواعيد الطفل. اختر طفلًا آخر ثم أعد المحاولة.') })
      .finally(() => { if (!cancelled) setLoadingAppointments(false) })
    return () => { cancelled = true }
  }, [selectedId])
  const selectChild = id => { if (id === selectedId) return; setSelectedId(id); setAppointments([]); setAppointmentsError(''); setLoadingAppointments(true) }
  const addAppointment = async (appointment, notes) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ child_id: selectedId, appointment, notes: notes.trim() || null }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر حجز الموعد. حاول مجددًا.')
    setAppointments(current => [...current, data])
  }
  const deleteAppointment = async id => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر حذف الموعد. حاول مجددًا.') }
    setAppointments(current => current.filter(item => item.id !== id))
  }
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><AppointmentsView children={children} selectedId={selectedId} appointments={appointments} loadingChildren={loadingChildren} loadingAppointments={loadingAppointments} childrenError={childrenError} appointmentsError={appointmentsError} onSelectChild={selectChild} onAddAppointment={addAppointment} onDeleteAppointment={deleteAppointment} /></main></div>
}
export default function Appointments() { return <ThemeProvider><AppointmentsContent /></ThemeProvider> }
