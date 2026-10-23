import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import ExerciseLibraryView from './components/ExerciseLibraryView'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import '../../design-system/dashboard.css'
import '../../design-system/exercises.css'

function ExerciseLibraryContent() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    document.title = 'مكتبة التمارين | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/exercises/`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setExercises(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setLoadError('تعذر تحميل مكتبة التمارين. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const create = async payload => {
    const response = await fetch(`${API_BASE_URL}/api/v1/exercises/`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'تعذر حفظ التمرين. حاول مجددًا.')
    }
    const created = await response.json()
    setExercises(current => [...current, created])
  }

  const remove = async id => {
    const response = await fetch(`${API_BASE_URL}/api/v1/exercises/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const message = data.error?.includes('active therapy plan')
        ? 'هذا التمرين مستخدم في خطة علاجية نشطة. أزله من الخطة قبل حذفه.'
        : data.error || 'تعذر حذف التمرين.'
      throw new Error(message)
    }
    setExercises(current => current.filter(exercise => exercise.id !== id))
  }

  const upload = async file => {
    const body = new FormData()
    body.append('file', file)
    body.append('folder', 'exercises')
    const response = await fetch(`${API_BASE_URL}/api/v1/upload/media`, { method: 'POST', credentials: 'include', body })
    if (!response.ok) throw new Error('تعذر رفع الملف. حاول مجددًا.')
    const data = await response.json()
    if (!data.url) throw new Error('لم يصل رابط الملف بعد الرفع.')
    return data.url
  }

  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main">
    <ExerciseLibraryView exercises={exercises} loading={loading} loadError={loadError} onCreate={create} onDelete={remove} onUpload={upload} />
  </main></div>
}

export default function ExerciseLibrary() {
  return <ThemeProvider><ExerciseLibraryContent /></ThemeProvider>
}
