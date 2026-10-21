import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import ProgressView from '../progress/components/ProgressView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
function DoctorProgressContent() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { document.title = 'التقدم | متابع'; let cancelled = false; fetch(`${API_BASE_URL}/api/v1/feedback/doctor/progress`, { credentials: 'include' }).then(response => { if (!response.ok) throw new Error(); return response.json() }).then(value => { if (!cancelled) setData(value) }).catch(() => { if (!cancelled) setError('تعذر تحميل بيانات التقدم. حدّث الصفحة وحاول مجددًا.') }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [])
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><ProgressView data={data || {}} feedback={data?.feedback || []} loading={loading} error={error} onOpenChild={id => navigate(`/patients/${id}/progress`)} /></main></div>
}
export default function DoctorProgress() { return <ThemeProvider><DoctorProgressContent /></ThemeProvider> }
