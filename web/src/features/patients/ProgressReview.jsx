import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import ProgressView from '../progress/components/ProgressView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
function ProgressReviewContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { document.title = 'تقدم الطفل | متابع'; let cancelled = false; Promise.all([fetch(`${API_BASE_URL}/api/v1/children/${id}`, { credentials: 'include' }), fetch(`${API_BASE_URL}/api/v1/feedback/child/${id}`, { credentials: 'include' }), fetch(`${API_BASE_URL}/api/v1/goals/child/${id}`, { credentials: 'include' })]).then(async responses => { if (responses.some(response => !response.ok)) throw new Error(); return Promise.all(responses.map(response => response.json())) }).then(([child, reports, childGoals]) => { if (!cancelled) { setPatient(child); setFeedback(Array.isArray(reports) ? reports : []); setGoals(Array.isArray(childGoals) ? childGoals : []) } }).catch(() => { if (!cancelled) setError('تعذر تحميل تقدم الطفل. حدّث الصفحة وحاول مجددًا.') }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [id])
  const createGoal = async form => {
    const response = await fetch(`${API_BASE_URL}/api/v1/goals/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, child_id: id }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر حفظ الهدف. حاول مجددًا.')
    setGoals(current => [data, ...current])
  }
  const childName = [patient?.first_name, patient?.second_name].filter(Boolean).join(' ')
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><ProgressView mode="child" childName={childName} feedback={feedback} goals={goals} loading={loading} error={error} onCreateGoal={createGoal} onBack={() => navigate(`/patients/${id}`)} onOpenFeedback={feedbackId => navigate('/feedback', { state: { highlightId: feedbackId } })} /></main></div>
}
export default function ProgressReview() { return <ThemeProvider><ProgressReviewContent /></ThemeProvider> }
