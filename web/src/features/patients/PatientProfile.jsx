import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import PatientProfileView from './components/PatientProfileView'
import ChildGoalsPanel from './components/ChildGoalsPanel'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
import '../../design-system/profiles.css'
function PatientProfileContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { document.title = 'ملف الطفل | متابع'; let cancelled = false; fetch(`${API_BASE_URL}/api/v1/children/${id}`, { credentials: 'include' }).then(response => { if (!response.ok) throw new Error(); return response.json() }).then(data => { if (!cancelled) setPatient(data) }).catch(() => { if (!cancelled) setError('تعذر تحميل ملف الطفل. حدّث الصفحة وحاول مجددًا.') }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [id])
  const deleteExercise = async exerciseId => {
    const response = await fetch(`${API_BASE_URL}/api/v1/plan-exercises/${exerciseId}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر إزالة التمرين.') }
    const updated = await fetch(`${API_BASE_URL}/api/v1/children/${id}`, { credentials: 'include' })
    if (!updated.ok) throw new Error('أزيل التمرين، لكن تعذر تحديث الملف. حدّث الصفحة.')
    setPatient(await updated.json())
  }
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><PatientProfileView patient={patient} loading={loading} error={error} onBack={() => navigate('/patients')} onOpenProgress={() => navigate(`/patients/${id}/progress`)} onOpenPlan={() => navigate('/plans', { state: { patient } })} onDeleteExercise={deleteExercise} />{patient && <ChildGoalsPanel childId={id} />}</main></div>
}
export default function PatientProfile() { return <ThemeProvider><PatientProfileContent /></ThemeProvider> }
