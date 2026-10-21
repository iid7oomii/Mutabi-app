import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import useAuthStore from '../../store/authStore'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import DoctorProfileView from './components/DoctorProfileView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
import '../../design-system/profiles.css'
function DoctorProfileContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  useEffect(() => { document.title = 'ملف الأخصائي | متابع'; let cancelled = false; Promise.all([fetch(`${API_BASE_URL}/api/v1/users/${id}`, { credentials: 'include' }), fetch(`${API_BASE_URL}/api/v1/users/${id}/patients`, { credentials: 'include' })]).then(async responses => { if (responses.some(response => !response.ok)) throw new Error(); return Promise.all(responses.map(response => response.json())) }).then(([profile, list]) => { if (!cancelled) { setDoctor(profile); setPatients(Array.isArray(list) ? list : []) } }).catch(() => { if (!cancelled) setError('تعذر تحميل ملف الأخصائي. حدّث الصفحة وحاول مجددًا.') }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [id])
  const uploadAvatar = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { const body = new FormData(); body.append('file', file); const response = await fetch(`${API_BASE_URL}/api/v1/upload/avatar/${id}`, { method: 'POST', credentials: 'include', body }); if (!response.ok) throw new Error(); const data = await response.json(); setDoctor(current => ({ ...current, profile_picture_url: data.url })); setError('') } catch { setError('تعذر رفع الصورة. حاول مجددًا.') } finally { setUploading(false); event.target.value = '' }
  }
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><DoctorProfileView doctor={doctor} patients={patients} loading={loading} error={error} isAdmin={user?.role === 'admin'} uploading={uploading} fileInputRef={fileInputRef} onUploadAvatar={uploadAvatar} onChooseAvatar={() => fileInputRef.current?.click()} onBack={() => navigate('/doctors')} onOpenPatient={childId => navigate(`/patients/${childId}`)} onOpenProgress={() => navigate('/progress')} /></main></div>
}
export default function DoctorProfile() { return <ThemeProvider><DoctorProfileContent /></ThemeProvider> }
