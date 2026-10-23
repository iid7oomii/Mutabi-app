import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import FeedbackView from './components/FeedbackView'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import useAuthStore from '../../store/authStore'
import '../../design-system/dashboard.css'
import '../../design-system/feedback.css'

function FeedbackContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    document.title = 'ملاحظات الأسرة | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/feedback/doctor/all`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setFeedbacks(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setLoadError('تعذر تحميل تقارير الأسرة. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const reply = async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/feedback/${id}/reply`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'تعذر حفظ الرد. حاول مجددًا.')
    }
    setFeedbacks(current => current.map(feedback => feedback.id === id ? { ...feedback, doctor_reply: text } : feedback))
  }

  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main">
    <FeedbackView feedbacks={feedbacks} loading={loading} loadError={loadError}
      highlightId={location.state?.highlightId} isAdmin={user?.role === 'admin'}
      onReply={reply} onOpenPatient={id => navigate(`/patients/${id}`)} />
  </main></div>
}

export default function Feedback() {
  return <ThemeProvider><FeedbackContent /></ThemeProvider>
}
